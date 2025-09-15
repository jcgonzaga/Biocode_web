import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxygmwsmtilzwiartmif.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54eWdtd3NtdGlszendpYXJ0bWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY0Mjc0OSwiZXhwIjoyMDcyMjE4NzQ5fQ.G9QjRj5f0GEQtS8_g5gpsrXeqmuzuBaEvU6LcgW6C30'; // service_role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function getLatestNewsletterId() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id')
    .order('publication_date', { ascending: false }) // Assuming 'publication_date' is the column to order by
    .limit(1);

  if (error) {
    console.error('Error fetching latest newsletter ID:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Latest Newsletter ID:', data[0].id);
  } else {
    console.log('No newsletters found.');
  }
}

getLatestNewsletterId();