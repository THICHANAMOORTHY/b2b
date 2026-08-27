import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const uniqueId = Math.floor(Math.random() * 1000000) + 10;
  const testResource = {
    id: uniqueId,
    companyId: "c1",
    name: "Copper Scrap Batch #1",
    materialType: "Copper",
    quantity: 1000,
    unit: "kg",
    quality: "Industrial Grade",
    location: "Chennai North",
    availability: "Immediate",
    price: 45
  };
  
  const { data, error } = await supabase.from('listing datas').insert(testResource).select();
  console.log("Insert result with unique id:", { data, error });
}

testInsert();
