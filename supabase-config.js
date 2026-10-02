import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://txiterlxsxpymfgqmvwm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aXRlcmx4c3hweW1mZ3FtdndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODkxODEsImV4cCI6MjEwNDM2NTE4MX0._i81CvvG6XEdRtSlwebCp7Jr-mpcTKQGLIyK29LeGwM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
