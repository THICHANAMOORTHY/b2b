import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findColumns() {
  const fields = ['id', 'created_at', 'name', 'title', 'description', 'price', 'quantity', 'unit', 'location', 'material', 'materialType', 'material_type', 'quality', 'company_id', 'companyId', 'status'];
  
  for (const f of fields) {
    const payload = {};
    payload[f] = f === 'id' ? 1 : (f === 'price' || f === 'quantity' ? 10 : 'test');
    const { error } = await supabase.from('listing datas').insert(payload);
    if (!error) {
      console.log(`Column '${f}': EXISTS!`);
    } else if (error.message.includes(`Could not find the '${f}' column`)) {
      console.log(`Column '${f}': DOES NOT EXIST`);
    } else {
      console.log(`Column '${f}': EXISTS (or other error: ${error.message})`);
    }
  }
}

findColumns();
