
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwblwuzihcozkfwuarzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Ymx3dXppaGNvemtmd3Vhcnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NjEzNDcsImV4cCI6MjA2MTUzNzM0N30.PywHzNf2ONsdHH84yXDWDBgQVSSAQj6v_-MThF8Ywwo';

export const supabase = createClient(supabaseUrl, supabaseKey);
