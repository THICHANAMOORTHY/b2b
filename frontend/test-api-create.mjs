import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateResource() {
  const resourceData = {
    companyId: "c1",
    name: "Aluminium Scrap Batch #5",
    materialType: "Aluminium",
    quantity: 500,
    unit: "kg",
    quality: "6061",
    location: "Chennai North",
    availability: "Immediate",
    price: 30
  };

  const numericId = Math.floor(Math.random() * 900000) + 100000;
  
  // Try writing to 'listing datas'
  const { data, error } = await supabase
    .from('listing datas')
    .insert({ id: numericId, ...resourceData })
    .select()
    .single();

  console.log("Result inserting to 'listing datas':", { data, error });
}

testCreateResource();
