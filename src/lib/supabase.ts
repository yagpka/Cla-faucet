import { createClient } from '@supabase/supabase-js';

// Using the provided credentials as fallbacks if environment variables are not set
const supabaseUrl = 'https://iexrrlwtutrfctdyntdl.supabase.co';
const supabaseAnonKey = 'sb_publishable_dyovDA1GvS3VrZsmtf0FYQ_p09SIvwQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
