import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Download, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";
import type { Quote, Customer } from "@shared/schema";

interface DashboardStats {
  totalQuotes: number;
  approvedQuotes: number;
  pendingQuotes: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function Reports() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Calculate additional metrics
  const calculateMetrics = () => {
    const approvedQuotes = quotes.filter(q => q.status === "approved");
    const rejectedQuotes = quotes.filter(q => q.status === "rejected");
    const pendingQuotes = quotes.filter(q => q.status === "pending");

    const conversionRate = quotes.length > 0 ? (approvedQuotes.length / quotes.length) * 100 : 0;
    const averageQuoteValue = approvedQuotes.length > 0 
      ? approvedQuotes.reduce((sum, q) => sum + (q.amount ? parseFloat(q.amount.toString()) : 0), 0) / approvedQuotes.length 
      : 0;

    // Project type breakdown
    const projectTypes = quotes.reduce((acc, quote) => {
      acc[quote.projectType] = (acc[quote.projectType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      conversionRate,
      averageQuoteValue,
      projectTypes,
      rejectedCount: rejectedQuotes.length,
      pendingCount: pendingQuotes.length,
    };
  };

  const metrics = calculateMetrics();

  // Recent quotes for table
  const recentQuotes = quotes
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "completed":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleExportReport = () => {
    // TODO: Implement detailed report export
    const data = {
      stats,
      quotes,
      customers,
      metrics,
      generated: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landscaping-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <Button onClick={handleExportReport} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Quote Value</p>
                <p className="text-2xl font-bold text-foreground">${metrics.averageQuoteValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
              </div>
              <FileText className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats?.monthlyRevenue?.[stats.monthlyRevenue.length - 1]?.revenue.toLocaleString() || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-md">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Revenue chart visualization</p>
                <div className="mt-4 space-y-2">
                  {stats?.monthlyRevenue?.slice(-3).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{item.month}</span>
                      <span>${item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Project Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.projectTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / quotes.length) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No quotes available.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentQuotes.map((quote) => {
                    const customer = customers.find(c => c.id === quote.customerId);
                    return (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>{customer?.name || "Unknown"}</TableCell>
                        <TableCell className="capitalize">{quote.projectType.replace('-', ' ')}</TableCell>
                        <TableCell>
                          {quote.amount ? `$${parseFloat(quote.amount.toString()).toLocaleString()}` : "TBD"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(quote.createdAt!).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
