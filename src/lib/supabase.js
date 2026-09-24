import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
  let val;
  try {
    if (import.meta && import.meta.env && import.meta.env[key]) val = import.meta.env[key];
  } catch {}
  if (!val) {
    try {
      if (process && process.env && process.env[key]) val = process.env[key];
    } catch {}
  }
  if (typeof val === 'string') {
    return val.trim().replace(/^["']|["']$/g, '');
  }
  return undefined;
};

const rawUrl = getEnv('PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL');
const rawAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_KEY');

const isValidUrl = (url) => typeof url === 'string' && url.startsWith('http') && !url.includes('tu-proyecto');
const isValidKey = (key) => typeof key === 'string' && key.length > 10 && !key.includes('tu-anon-key');

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : null;
const supabaseAnonKey = isValidKey(rawAnonKey) ? rawAnonKey : null;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Creates an admin client using the service role key (for server-side/MCP operations)
 */
export function getAdminSupabase() {
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('tu-service-role')) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados en el archivo .env con valores reales');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
