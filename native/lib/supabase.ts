import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// ENV 確認
console.log('dotenv', {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
})
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
    'https://uxmylsxhcgzcgbezcgsn.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bXlsc3hoY2d6Y2diZXpjZ3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1Nzc3NzAsImV4cCI6MjAzMDE1Mzc3MH0.SqNFja7PfYV-Gtq-1F4TT6ewrMdKxvr1nLLMFWks1tI',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)
