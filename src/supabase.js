import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://bibrkqrscdrazpjqwsiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYnJrcXJzY2RyYXpwanF3c2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODY4ODMsImV4cCI6MjA5MjI2Mjg4M30.b21-CADdfjvPR8VndGoa4DbnV5YRpXPuJMJNNCRvXRE'
)
