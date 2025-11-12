import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzduyyiludvgyidhgyod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZHV5eWlsdWR2Z3lpZGhneW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODk2MDEsImV4cCI6MjA3ODM2NTYwMX0.DvuL2bAJFJYCExdFc2Rla7z1Gb56xzjM_zT_DYytxSw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
