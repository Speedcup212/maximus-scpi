import { createClient } from '@supabase/supabase-js';

// FORCE BRUTE - Valeurs hardcodées pour contourner le cache Vite
const supabaseUrl = "https://ygvsddcpohsnaowofuwc.supabase.co";
const supabaseAnonKey = "sb_publishable_Nto8vq-qBsKWvRCSQEgWdg_aNYyweuk";

console.log("DEBUG - FORCE BRUTE ACTIVE: ", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
