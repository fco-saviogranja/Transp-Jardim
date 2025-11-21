import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabaseClient = createClient(supabaseUrl, publicAnonKey);

export const useSupabaseClient = () => {
  return supabaseClient;
};
