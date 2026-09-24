import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
const envText = fs.readFileSync(envPath, 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2 && !line.startsWith('#')) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    env[k] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client = createClient(url, key);

const commentId = 'a248fafd-0eba-4ea5-9a82-60c812551f62';

const { data, error } = await client
  .from('comments')
  .update({ status: 'approved' })
  .eq('id', commentId)
  .select();

if (error) {
  console.error('Error approving comment:', error);
} else {
  console.log('APPROVED_SUCCESS:', JSON.stringify(data, null, 2));
}
