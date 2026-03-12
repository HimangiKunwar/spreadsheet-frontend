import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';

// Auth Pages (keep eager loading for initial pages)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Lazy load feature pages
const DatasetsListPage = lazy(() => import('./pages/datasets/DatasetsListPage'));
const DatasetUploadPage = lazy(() => import('./pages/datasets/DatasetUploadPage'));
const DatasetDetailPage = lazy(() => import('./pages/datasets/DatasetDetailPage'));

const ReconciliationListPage = lazy(() => import('./pages/reconciliation/ReconciliationListPage'));
const NewReconciliationPage = lazy(() => import('./pages/reconciliation/NewReconciliationPage'));
const ReconciliationDetailPage = lazy(() => import('./pages/reconciliation/ReconciliationDetailPage'));

const BulkOperationsPage = lazy(() => import('./pages/bulk/BulkOperationsPage'));
const SavedRulesPage = lazy(() => import('./pages/bulk/SavedRulesPage'));

const ReportsListPage = lazy(() => import('./pages/reports/ReportsListPage'));
const ReportCreatePage = lazy(() => import('./pages/reports/ReportCreatePage'));
const ReportDetailPage = lazy(() => import('./pages/reports/ReportDetailPage'));
const ReportEditPage = lazy(() => import('./pages/reports/ReportEditPage'));

const WorkflowsPage = lazy(() => import('./pages/workflows/WorkflowsPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Datasets */}
              <Route path="datasets" element={
                <Suspense fallback={<PageLoader />}>
                  <DatasetsListPage />
                </Suspense>
              } />
              <Route path="datasets/upload" element={
                <Suspense fallback={<PageLoader />}>
                  <DatasetUploadPage />
                </Suspense>
              } />
              <Route path="datasets/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <DatasetDetailPage />
                </Suspense>
              } />
              
              {/* Reconciliation */}
              <Route path="reconciliation" element={
                <Suspense fallback={<PageLoader />}>
                  <ReconciliationListPage />
                </Suspense>
              } />
              <Route path="reconciliation/new" element={
                <Suspense fallback={<PageLoader />}>
                  <NewReconciliationPage />
                </Suspense>
              } />
              <Route path="reconciliation/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <ReconciliationDetailPage />
                </Suspense>
              } />
              
              {/* Bulk Operations */}
              <Route path="bulk" element={
                <Suspense fallback={<PageLoader />}>
                  <SavedRulesPage />
                </Suspense>
              } />
              <Route path="bulk/:datasetId" element={
                <Suspense fallback={<PageLoader />}>
                  <BulkOperationsPage />
                </Suspense>
              } />
              
              {/* Workflows */}
              <Route path="workflows" element={
                <Suspense fallback={<PageLoader />}>
                  <WorkflowsPage />
                </Suspense>
              } />
              
              {/* Reports */}
              <Route path="reports" element={
                <Suspense fallback={<PageLoader />}>
                  <ReportsListPage />
                </Suspense>
              } />
              <Route path="reports/new" element={
                <Suspense fallback={<PageLoader />}>
                  <ReportCreatePage />
                </Suspense>
              } />
              <Route path="reports/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <ReportDetailPage />
                </Suspense>
              } />
              <Route path="reports/:id/edit" element={
                <Suspense fallback={<PageLoader />}>
                  <ReportEditPage />
                </Suspense>
              } />
            </Route>
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;