import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// Se usan las credenciales proporcionadas directamente para asegurar que funcione sin configurar variables de entorno en Vercel inmediatamente.
const supabaseUrl = process.env.SUPABASE_URL || 'https://cxtyacjabjjeendhafsr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dHlhY2phYmpqZWVuZGhhZnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzgyMjQsImV4cCI6MjA4MDgxNDIyNH0.-V6T73N5wU5OF3SSujLw79TErvgJfLopCC0bOUM0pT8';

export const supabase = createClient(supabaseUrl, supabaseKey);