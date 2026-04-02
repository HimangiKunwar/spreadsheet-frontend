import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          'feature-datasets': [
            './src/pages/datasets/DatasetsListPage.tsx',
            './src/pages/datasets/DatasetUploadPage.tsx',
            './src/pages/datasets/DatasetDetailPage.tsx',
          ],
          'feature-reconciliation': [
            './src/pages/reconciliation/ReconciliationListPage.tsx',
            './src/pages/reconciliation/NewReconciliationPage.tsx',
            './src/pages/reconciliation/ReconciliationDetailPage.tsx',
          ],
          'feature-reports': [
            './src/pages/reports/ReportsListPage.tsx',
            './src/pages/reports/ReportCreatePage.tsx',
            './src/pages/reports/ReportDetailPage.tsx',
            './src/pages/reports/ReportEditPage.tsx',
          ],
        },
      },
    },
  },
})