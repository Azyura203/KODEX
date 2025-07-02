import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    define: {
      // Only define specific environment variables we need
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://ihsabhhmussuyoibfmxw.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2FiaGhtdXNzdXlvaWJmbXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU5NTMsImV4cCI6MjA2Njk2MTk1M30.IbGPus17lyScuMqd7q77PT5cBj96Eu4wVjT4Se5ju2M'),
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL || 'https://ihsabhhmussuyoibfmxw.supabase.co'),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2FiaGhtdXNzdXlvaWJmbXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU5NTMsImV4cCI6MjA2Njk2MTk1M30.IbGPus17lyScuMqd7q77PT5cBj96Eu4wVjT4Se5ju2M'),
    },
    envPrefix: ['VITE_', 'PUBLIC_']
  },
  // Ensure public assets are properly handled
  publicDir: './public'
});