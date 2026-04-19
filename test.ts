import { supabase } from './src/lib/supabase.ts';
async function run() {
  const { data, error } = await supabase.from('user_tasks').upsert({ user_id: 6864672507, task_id: 'active_status_date', status: '2026-04-10' }).select();
  console.dir(error || data, { depth: null });
}
run();
