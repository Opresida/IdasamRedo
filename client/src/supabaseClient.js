import { createClient } from '@supabase/supabase-js'

// Lê as variáveis de ambiente dos "Secrets" do Replit
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase para ser usado em todo o app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
