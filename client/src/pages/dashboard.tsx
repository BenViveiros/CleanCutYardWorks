import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Edit
} from "lucide-react";

interface DashboardStats {
  totalQuotes: number;
  approvedQuotes: number;
  pendingQuotes: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your landscaping business performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Quotes"
          value={stats?.totalQuotes || 0}
          icon={FileText}
          iconColor="text-primary"
        />
        <StatsCard
          title="Approved"
          value={stats?.approvedQuotes || 0}
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatsCard
          title="Pending"
          value={stats?.pendingQuotes || 0}
          icon={Clock}
          iconColor="text-warning"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          iconColor="text-accent"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-md">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Chart visualization will be implemented here
                </p>
                {stats?.monthlyRevenue && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    Latest: ${stats.monthlyRevenue[stats.monthlyRevenue.length - 1]?.revenue.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    Quote #QT-2024-001 approved
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-info rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    New quote request from Sarah Johnson
                  </p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-warning rounded-full flex items-center justify-center">
                    <Edit className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    Quote #QT-2024-012 updated
                  </p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
