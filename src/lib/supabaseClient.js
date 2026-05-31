import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('INSIRA_AQUI')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Falha ao inicializar o cliente do Supabase:', error);
  }
} else {
  console.log('Supabase não configurado. O aplicativo usará a API local (localhost).');
}

export const supabase = supabaseInstance;
export default supabase;
