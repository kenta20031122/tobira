import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/user/trips — save a generated itinerary
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sign in to save itineraries.' }, { status: 401 });
  }

  const { title, overview, days } = await req.json();

  if (!title || !days) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Generate share token in app code (avoid DB-level base64url dependency)
  const shareToken = randomBytes(16).toString('hex');

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('saved_trips')
    .insert({ user_id: user.id, title, overview, days, share_token: shareToken, is_public: true })
    .select('id, share_token')
    .single();

  if (error) {
    console.error('Save trip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, shareToken: data.share_token });
}

// GET /api/user/trips — list saved trips for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('saved_trips')
    .select('id, title, overview, share_token, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch trips.' }, { status: 500 });
  }

  return NextResponse.json(data);
}
