import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 