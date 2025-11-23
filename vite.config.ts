/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas grandes separadas
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'icons': ['lucide-react'],
          'ui': ['sonner'],
          // AI e ML - separar por serem grandes
          'ai-ml': ['@xenova/transformers', 'onnxruntime-web'],
          // Zustand e estado
          'state': ['zustand'],
        },
      },
    },
    // Aumentar limite de warning para 600kb (ainda alertando, mas menos agressivo)
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
