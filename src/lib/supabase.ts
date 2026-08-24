import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * This client is intentionally limited to the browser-safe Supabase anon key.
 * Server/service-role credentials must never be shipped in the frontend bundle.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const supabaseConfigurationMessage =
  'Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in the Vercel project, then redeploy.';

export interface GlobalHub {
  id: number | string;
  name: string | null;
  country: string | null;
  hub_name: string | null;
  location: string | null;
  contact_email?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  key_contact_person?: string | null;
  specialization_areas: string | null;
  partnership_priority: string | null;
  strategic_value: string | null;
  created_at?: string | null;
}

export interface AiAgent {
  id: string;
  name: string | null;
  configuration: Record<string, unknown> | null;
  created_at: string | null;
}

export interface AgentProjectLink {
  id: string;
  agent_id: string | null;
  project_id: string | null;
  role: string | null;
  permissions: string | null;
  created_at: string | null;
}

export interface LiveStats {
  hubs: number | null;
  agents: number | null;
  projectLinks: number | null;
  aiMessages: number | null;
  appointments: number | null;
  m23mAgents: number | null;
  m23mProjects: number | null;
  m23mTasks: number | null;
}

export const emptyLiveStats: LiveStats = {
  hubs: null,
  agents: null,
  projectLinks: null,
  aiMessages: null,
  appointments: null,
  m23mAgents: null,
  m23mProjects: null,
  m23mTasks: null,
};
