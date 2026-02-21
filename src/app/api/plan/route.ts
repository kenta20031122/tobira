import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { spots } from '@/data/spots';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured. Add GEMINI_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Sign in to use the AI planner.', code: 'auth_required' },
      { status: 401 }
    );
  }

  // Check subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single();

  const isPro = sub?.status === 'active';
  const adminClient = createAdminClient();

  if (!isPro) {
    const { data: usageRow } = await adminClient
      .from('plan_uses')
      .select('count')
      .eq('user_id', user.id)
      .single();

    const currentCount = usageRow?.count ?? 0;

    if (currentCount >= 1) {
      return NextResponse.json(
        {
          error: "You've used your 1 free AI plan. Upgrade to Pro for unlimited itineraries.",
          code: 'upgrade_required',
        },
        { status: 403 }
      );
    }
  }

  const { days, interests, pace, prefecture, spotId } = await req.json();

  // If a specific spot was requested, find it
  const anchorSpot = spotId ? spots.find((s) => s.id === spotId) : null;

  // Filter relevant spots for context — keep payload small to stay within timeout
  const relevantSpots = spots
    .filter((s) => prefecture === 'all' || s.prefecture === prefecture)
    .map((s) => ({
      name: s.name,
      prefecture: s.prefecture,
      categories: s.categories.join('/'),
      desc: s.description.slice(0, 80),
      duration: s.duration,
    }));

  const anchorSection = anchorSpot
    ? `
IMPORTANT: The traveler specifically wants to visit "${anchorSpot.name}" (${anchorSpot.prefecture}). You MUST include this spot in the itinerary. Brief info: ${anchorSpot.description.slice(0, 120)}
`
    : '';

  const prompt = `You are a local Kyushu travel expert helping a foreign tourist plan an authentic trip.
${anchorSection}
Available spots in our curated database:
${JSON.stringify(relevantSpots, null, 2)}

Create a ${days}-day itinerary for a traveler with these preferences:
- Interests: ${interests.join(', ')}
- Travel pace: ${pace}
- Focus area: ${prefecture === 'all' ? 'All of Kyushu (Kumamoto, Oita, Miyazaki)' : prefecture}

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "title": "Creative trip title",
  "overview": "2-3 sentence overview of this trip",
  "days": [
    {
      "day": 1,
      "title": "Day theme title",
      "spots": [
        {
          "name": "Spot name",
          "description": "Why visit and what to do (2 sentences)",
          "time": "Suggested time (e.g. '9:00 AM - 12:00 PM')",
          "tip": "Insider tip locals know but tourists miss"
        }
      ]
    }
  ]
}

Rules:
- Use spots from the database when possible, but you may add real Kyushu spots not in the list
- Match the pace: relaxed=1-2 spots/day, moderate=3-4, packed=5+
- Start with the most iconic spot of the trip on day 1
- Include at least one meal recommendation per day
- Tips should be genuinely useful and specific (best time to arrive, what to order, hidden details)`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    // Track usage for free users
    if (!isPro) {
      await adminClient
        .from('plan_uses')
        .upsert({ user_id: user.id, count: 1 }, { onConflict: 'user_id' });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('AI plan error:', err);
    return NextResponse.json(
      { error: 'Failed to generate itinerary. Please try again.' },
      { status: 500 }
    );
  }
}
