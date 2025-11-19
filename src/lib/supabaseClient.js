// supabaseClient.js (o como se llame tu archivo)
import { createClient } from '@supabase/supabase-js'

// Usar variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación opcional (recomendada)
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL no está definida')
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY no está definida')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)