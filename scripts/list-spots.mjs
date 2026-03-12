import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://khgpsvnrorfigvubxhmd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ3Bzdm5yb3JmaWd2dWJ4aG1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ4OTE4MywiZXhwIjoyMDg3MDY1MTgzfQ.0xer79-vehbyjBsDW7a-Nyv-l5Mmo2hDltzrJdzSKwY'
);

const targets = ['Tokyo', 'Osaka', 'Kanagawa', 'Hiroshima', 'Aichi', 'Hyogo', 'Okinawa', 'Fukuoka'];

const { data, error } = await supabase
  .from('spots')
  .select('id, name, prefecture, is_premium, categories, tags')
  .in('prefecture', targets)
  .order('prefecture')
  .order('name');

if (error) {
  console.error(error);
  process.exit(1);
}

for (const pref of targets) {
  const spots = data.filter(s => s.prefecture === pref);
  console.log(`\n=== ${pref} (${spots.length} total, ${spots.filter(s => s.is_premium).length} premium) ===`);
  for (const s of spots) {
    console.log(`  ${s.is_premium ? '[PRO]' : '     '} ${s.id}  ${s.name}  [${s.categories.join(', ')}]`);
  }
}
