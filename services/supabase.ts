
import { createClient } from '@supabase/supabase-js';

// Configuração derivada da chave API fornecida
const SUPABASE_PROJECT_REF = 'gfqlbzpnnbubqyqtwyo';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWxienBubmJydWJxeXF0d3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTUwODAsImV4cCI6MjA3ODk5MTA4MH0.PVZiO8UYQnNvQw-cMpoDBbCHwXG0GwemKeHrWJqoHp0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
