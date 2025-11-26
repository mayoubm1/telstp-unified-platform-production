import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrfyjirddfdnwuffzqhb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZnlqaXJkZGZkbnd1ZmZ6cWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDYwNjMsImV4cCI6MjA3NTQ4MjA2M30.glgJwI2yIqUFG8ZtWJk2esxGdXw6nFp5eQ8aANbRAvE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface Platform {
  id: string
  name: string
  type: string
  status: 'enabled' | 'disabled'
  description: string
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  visibility: 'public' | 'private'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  workspace_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  workspace_id: string
  title: string
  participants: string[]
  created_at: string
  updated_at: string
}
