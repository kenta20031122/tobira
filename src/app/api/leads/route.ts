import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

function getPersonalitySummary(answers: Record<string, string>): string {
  const { vibe, nature_type, history_type, atmosphere } = answers;
  if (vibe === 'nature') {
    if (nature_type === 'mountain') return 'mountain escapes and highland scenery';
    if (nature_type === 'coast')    return 'coastal scenery and island life';
    if (nature_type === 'volcanic') return 'dramatic volcanic landscapes';
    if (nature_type === 'forest')   return 'ancient forests and quiet nature walks';
    if (atmosphere === 'wild')      return 'raw, adventure-driven landscapes';
    return 'scenic nature and the great outdoors';
  }
  if (vibe === 'history') {
    if (history_type === 'ancient')     return 'ancient shrines, temples, and spiritual sites';
    if (history_type === 'samurai')     return 'samurai history and castle towns';
    if (history_type === 'traditional') return 'traditional crafts and Japanese arts';
    return "Japan's rich history and cultural heritage";
  }
  if (vibe === 'onsen') return 'onsen, wellness, and restorative travel';
  if (vibe === 'food')  return 'local food culture and everyday Japanese life';
  return 'authentic, off-the-beaten-path Japan';
}

type SpotRow = { id: string; name: string; prefecture: string; description: string; image_url: string };

function buildEmailHtml(personality: string, spots: SpotRow[]): string {
  const spotRows = spots.map(s => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e7e5e4;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${s.image_url ? `
            <td width="88" style="vertical-align:top;padding-right:14px;">
              <img src="${s.image_url}" width="88" height="66" alt="${s.name}"
                style="display:block;border-radius:8px;object-fit:cover;width:88px;height:66px;" />
            </td>` : ''}
            <td style="vertical-align:top;">
              <p style="margin:0 0 3px 0;font-size:16px;font-weight:600;color:#1c1917;">${s.name}</p>
              <p style="margin:0 0 6px 0;font-size:13px;color:#78716c;">${s.prefecture}</p>
              <p style="margin:0;font-size:14px;color:#44403c;line-height:1.5;">${s.description.slice(0, 110)}…</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">

        <!-- Header -->
        <tr>
          <td style="background:#1c1917;padding:28px 32px;">
            <a href="https://tobira-travel.com" style="text-decoration:none;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">tobira</p>
              <p style="margin:4px 0 0 0;font-size:13px;color:#a8a29e;">· beyond tokyo</p>
            </a>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:32px 32px 16px 32px;">
            <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#dc2626;text-transform:uppercase;letter-spacing:0.08em;">Your Japan match results</p>
            <h1 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#1c1917;line-height:1.3;">Your Tobira Japan matches are here</h1>
            <p style="margin:0;font-size:15px;color:#57534e;line-height:1.6;">
              Based on your answers, you seem to enjoy <strong>${personality}</strong>.
              Here are the spots we think you'll love most.
            </p>
          </td>
        </tr>

        <!-- Spots -->
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${spotRows}
            </table>
          </td>
        </tr>

        <!-- AI Planner CTA -->
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:10px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#1c1917;">Want a day-by-day itinerary?</p>
                  <p style="margin:0 0 14px 0;font-size:14px;color:#57534e;">Tell us your dates, pace and group — our AI planner builds a full route around your picks.</p>
                  <a href="https://tobira-travel.com/plan" style="display:inline-block;background:#dc2626;color:#ffffff;font-size:14px;font-weight:600;padding:10px 20px;border-radius:999px;text-decoration:none;">Try the AI Planner →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Pro upsell -->
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1c1917;border-radius:10px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#fca5a5;text-transform:uppercase;letter-spacing:0.06em;">✦ Go Pro</p>
                  <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#ffffff;">Unlock every hidden gem</p>
                  <p style="margin:0 0 14px 0;font-size:14px;color:#a8a29e;">Premium spots come with insider tips, local secrets, and highlights you won't find on TripAdvisor.</p>
                  <a href="https://tobira-travel.com/pricing" style="display:inline-block;background:#ffffff;color:#dc2626;font-size:14px;font-weight:600;padding:10px 20px;border-radius:999px;text-decoration:none;">See Pro plans →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #e7e5e4;text-align:center;">
            <a href="https://tobira-travel.com" style="display:inline-block;font-size:13px;font-weight:600;color:#1c1917;text-decoration:none;border:1px solid #e7e5e4;border-radius:999px;padding:8px 20px;margin-bottom:14px;">Visit tobira-travel.com →</a>
            <p style="margin:0;font-size:12px;color:#a8a29e;">You received this because you signed up at tobira-travel.com.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const { email, answers, matchedSpotIds } = await req.json();

  if (!email || !Array.isArray(matchedSpotIds)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Save lead (upsert — idempotent on duplicate email)
  await admin
    .from('leads')
    .upsert({ email, answers, matched_spot_ids: matchedSpotIds }, { onConflict: 'email' });

  // Fetch spot details for email (top 5)
  const { data: spots } = await admin
    .from('spots')
    .select('id, name, prefecture, description, image_url')
    .in('id', matchedSpotIds.slice(0, 5));

  const personality = getPersonalitySummary(answers ?? {});

  // Send email (fire-and-forget — don't block the unlock)
  resend.emails.send({
    from: 'tobira <noreply@tobira-travel.com>',
    to: email,
    subject: 'Your Tobira Japan matches are here 🗾',
    html: buildEmailHtml(personality, spots ?? []),
  }).catch(err => console.error('Resend error:', err));

  return NextResponse.json({ ok: true });
}
