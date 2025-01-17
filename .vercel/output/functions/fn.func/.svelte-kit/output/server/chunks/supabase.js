import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://fodqbncqvugtdiugukgv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZHFibmNxdnVndGRpdWd1a2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDYxMzksImV4cCI6MjA1MDk4MjEzOX0.bKcQoYy_XprQ1krc8Ox8yf7ihmEgxl9_aQUaKzG7LoU";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
export {
  supabase as s
};
