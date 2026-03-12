import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Database, GitCompare, FileText, Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { datasetsApi } from '../../api/datasets';
import { reconciliationApi } from '../../api/reconciliation';
import { reportsApi } from '../../api/reports';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'dataset' | 'reconciliation' | 'report';
  name: string;
  action: string;
  timestamp: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useTheme();

  // Fetch real data from APIs - use specific functions that don't accept parameters
  const { data: datasetsData, isLoading: isDatasetsLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetsApi.list(),
  });

  const { data: reconciliationsData, isLoading: isReconciliationsLoading } = useQuery({
    queryKey: ['reconciliations'],
    queryFn: () => reconciliationApi.list(),
  });

  const { data: reportsData, isLoading: isReportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.list(),
  });

  const isLoading = isDatasetsLoading || isReconciliationsLoading || isReportsLoading;

  // Debug logging
  console.log('Dashboard - API URL being called');
  console.log('Dashboard - Raw reconcile data:', reconciliationsData);
  console.log('Dashboard - Reconcile count:', reconciliationsData?.count);
  console.log('Dashboard - Datasets data:', datasetsData);
  console.log('Dashboard - Reports data:', reportsData);

  // Calculate real stats from paginated responses
  const stats = [
    { 
      name: 'Datasets', 
      value: (datasetsData?.count ?? 0).toString(), 
      icon: Database, 
      href: '/datasets' 
    },
    { 
      name: 'Reconciliations', 
      value: (reconciliationsData?.count ?? 0).toString(), 
      icon: GitCompare, 
      href: '/reconciliation' 
    },
    { 
      name: 'Reports', 
      value: (reportsData?.count ?? 0).toString(), 
      icon: FileText, 
      href: '/reports' 
    },
  ];

  // Get recent datasets (first 3)
  const recentDatasets = datasetsData?.results?.slice(0, 3) || [];

  // Combine all activities and sort by timestamp
  const recentActivity = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add datasets
    const datasets = datasetsData?.results || [];
    datasets.forEach((dataset: any) => {
      activities.push({
        id: dataset.id,
        type: 'dataset',
        name: dataset.name,
        action: 'Dataset uploaded',
        timestamp: dataset.created_at,
      });
    });

    // Add reconciliations
    const reconciliations = reconciliationsData?.results || [];
    reconciliations.forEach((recon: any) => {
      activities.push({
        id: recon.id,
        type: 'reconciliation',
        name: recon.name,
        action: 'Reconciliation completed',
        timestamp: recon.created_at,
      });
    });

    // Add reports
    const reports = reportsData?.results || [];
    reports.forEach((report: any) => {
      activities.push({
        id: report.id,
        type: 'report',
        name: report.name,
        action: 'Report created',
        timestamp: report.created_at,
      });
    });

    // Sort by timestamp descending and take top 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [datasetsData, reconciliationsData, reportsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${theme.colors.text}`}>
          Welcome back, {user?.first_name}!
        </h1>
        <p className={`text-sm sm:text-base transition-colors duration-300 ${theme.colors.textMuted}`}>Here's what's happening with your data today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors duration-300 ${theme.colors.accent}`} />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${theme.colors.text}`}>{stat.value}</p>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 ${theme.colors.textMuted}`}>{stat.name}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Datasets */}
        <Card 
          title="Recent Datasets" 
          actions={
            <Link to="/datasets">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">View All →</Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {recentDatasets.length === 0 ? (
              <p className={`text-center py-4 text-sm transition-colors duration-300 ${theme.colors.textMuted}`}>
                No datasets yet. Upload your first dataset!
              </p>
            ) : (
              recentDatasets.map((dataset) => (
                <div key={dataset.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg space-y-2 sm:space-y-0 transition-colors duration-300 ${theme.colors.bgSecondary}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate transition-colors duration-300 ${theme.colors.text}`}>{dataset.name}</p>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${theme.colors.textMuted}`}>
                      {dataset.row_count.toLocaleString()} rows • {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Link to={`/datasets/${dataset.id}`} className="flex-shrink-0">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">Open</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className={`text-center py-4 text-sm transition-colors duration-300 ${theme.colors.textMuted}`}>
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className={`flex items-start p-3 rounded-lg transition-colors duration-300 ${theme.colors.bgSecondary}`}>
                  <span className="text-lg sm:text-xl mr-3 flex-shrink-0">
                    {activity.type === 'dataset' && '📁'}
                    {activity.type === 'reconciliation' && '🔄'}
                    {activity.type === 'report' && '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate transition-colors duration-300 ${theme.colors.text}`}>{activity.name}</p>
                    <p className={`text-xs sm:text-sm transition-colors duration-300 ${theme.colors.textMuted}`}>{activity.action}</p>
                    <p className={`text-xs transition-colors duration-300 ${theme.colors.textMuted}`}>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link to="/datasets/upload">
            <Button className="w-full h-12" leftIcon={<Plus className="h-4 w-4" />}>
              Upload Dataset
            </Button>
          </Link>
          <Link to="/reconciliation/new">
            <Button variant="outline" className="w-full h-12" leftIcon={<GitCompare className="h-4 w-4" />}>
              New Reconciliation
            </Button>
          </Link>
          <Link to="/reports/new" className="sm:col-span-2 lg:col-span-1">
            <Button variant="outline" className="w-full h-12" leftIcon={<FileText className="h-4 w-4" />}>
              Create Report
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;