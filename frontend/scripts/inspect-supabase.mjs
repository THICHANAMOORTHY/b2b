import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('Inspecting tables in Supabase...');
  
  const tablesToTest = ['companies', 'resources', 'requirements', 'matches', 'listings', 'listing', 'listing_datas', 'listing_data', 'listing datas'];
  
  for (const table of tablesToTest) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.log(`Table '${table}': NOT FOUND or ERROR (${error.message})`);
    } else {
      console.log(`Table '${table}': FOUND! Row count = ${data.length}`, data);
    }
  }
}

inspect();
