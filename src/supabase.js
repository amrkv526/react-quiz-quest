import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://swccdmvjckwltkyvodvn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Y2NkbXZqY2t3bHRreXZvZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzgzNzk1MTUsImV4cCI6MTk5Mzk1NTUxNX0.HITXhwIic0UlKzEHiUJWmGZnZmIqiZ86lTRm2BR_5ck";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
