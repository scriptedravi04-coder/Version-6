import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ozqdefczzkkfekkjzikp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1oXLPrlDJPss2sHdX2YetQ_pnad39Wy';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("=== CHECKING ALL VISIBLE TABLES VIA RPC ===");
  const { data, error } = await supabase.rpc('get_tables_list');
  if (error) {
    console.log("RPC Error:", error.message);
    // Let's try to query an arbitrary query from a table
    console.log("Trying direct select on standard tables...");
  } else {
    console.log("Visible tables:", data);
  }

  const tables = [
    'users', 'creator_profiles', 'brand_profiles', 'campaigns', 'waves', 'collabs',
    'team_activity_logs', 'verifications', 'reports', 'notifications', 'chat_messages',
    'campaign_performance', 'ybex_sync', 'applications', 'campaign_applications', 'earnings',
    'gst_invoices'
  ];

  for (const table of tables) {
    const { data: records, error: tableErr } = await supabase.from(table).select('count', { count: 'exact', head: true }).limit(1);
    if (tableErr) {
      console.log(`❌ Table '${table}' Error:`, tableErr.message);
    } else {
      console.log(`✅ Table '${table}' EXISTS!`);
    }
  }
}
run();

