
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('VITE_SUPABASE_URL não está definida. Configure suas variáveis de ambiente.');
}

if (!supabaseKey || supabaseKey === 'your-anon-key') {
  console.warn('VITE_SUPABASE_ANON_KEY não está definida. Configure suas variáveis de ambiente.');
}

import { createClient } from '@supabase/supabase-js'

// Criar uma única instância do cliente Supabase
let supabaseInstance: any = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
export default supabase;
