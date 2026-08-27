import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('companies').select('*');
  if (error) {
    console.error('Supabase query error:', error.message);
    console.log('Tip: If the table does not exist yet, make sure to run the SQL in supabase_schema.sql in your Supabase SQL Editor!');
  } else {
    console.log('Successfully connected to Supabase!');
    console.log('Companies found:', data);
  }
}

testConnection();
