import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          
          // Feature chunks - group related pages
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
          'feature-bulk': [
            './src/pages/bulk/BulkOperationsPage.tsx',
            './src/pages/bulk/SavedRulesPage.tsx',
          ],
          'feature-reports': [
            './src/pages/reports/ReportsListPage.tsx',
            './src/pages/reports/ReportCreatePage.tsx',
            './src/pages/reports/ReportDetailPage.tsx',
            './src/pages/reports/ReportEditPage.tsx',
          ],
          'feature-workflows': [
            './src/pages/workflows/WorkflowsPage.tsx',
          ],
        },
      },
    },
  },
})