import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
  || 'https://udlemqqrugqupctlhxct.supabase.co'

const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbGVtcXFydWdxdXBjdGxoeGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NzM4NTcsImV4cCI6MjA5NDA0OTg1N30.9Y-0VmjsVJ57JOqbytzn4w4ofwXasGg3A6YPAYHStD4'

export const supabase = createClient(url, key)
