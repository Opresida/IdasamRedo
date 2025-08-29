
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

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export default supabase;
