// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tnrtxjyliuegzrwqrwli.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucnR4anlsaXVlZ3pyd3Fyd2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MzUzMzAsImV4cCI6MjA1ODIxMTMzMH0.7gfuOhMTfuV4ViSw6mYNRkH7Y9g7kvgciOcQrShJEsM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);