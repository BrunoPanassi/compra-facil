// plugins/supabase.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const supabase = createClient(
    'https://tkidlfsnvlagjxdnrlkq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraWRsZnNudmxhZ2p4ZG5ybGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDU0NjksImV4cCI6MjA3NTY4MTQ2OX0.yz_jMQfIffvahVfCHrXPsNLEBCFlZLTuUjsUy7osM-I'
  )
  nuxtApp.provide('supabase', supabase)
  return {
    provide: { supabase }
  }
})
