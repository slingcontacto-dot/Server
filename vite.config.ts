import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Intenta encontrar la clave en API_KEY o VITE_API_KEY
  const apiKey = env.API_KEY || env.VITE_API_KEY || '';
  const supabaseUrl = env.SUPABASE_URL || '';
  const supabaseKey = env.SUPABASE_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Exponemos las variables de forma robusta
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_KEY': JSON.stringify(supabaseKey)
    }
  };
});