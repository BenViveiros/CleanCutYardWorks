import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { QuoteModal } from "@/components/quote-modal";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/components/accessibility-provider";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Printer, 
  Check, 
  X 
} from "lucide-react";
import type { Quote, Customer } from "@shared/schema";

interface QuoteWithCustomer extends Quote {
  customer?: Customer;
}

export default function QuoteManagement() {
  const { toast } = useToast();
  const { announceToScreenReader } = useAccessibility();
  const queryClient = useQueryClient();
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      const response = await apiRequest("POST", `/api/quotes/${id}/approve`, { amount });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Approved",
        description: "The quote has been approved successfully.",
      });
      announceToScreenReader("Quote approved successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/quotes/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Rejected",
        description: "The quote has been rejected.",
      });
      announceToScreenReader("Quote rejected");
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create quotes with customer data
  const quotesWithCustomers: QuoteWithCustomer[] = quotes.map(quote => ({
    ...quote,
    customer: customers.find(c => c.id === quote.customerId)
  }));

  // Filter quotes based on search and filters
  const filteredQuotes = quotesWithCustomers.filter(quote => {
    const matchesSearch = !searchTerm || 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || quote.status === statusFilter;
    
    // TODO: Implement date filtering
    const matchesDate = !dateFilter || true;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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

  const handleViewQuote = (id: number) => {
    setSelectedQuoteId(id);
    setIsModalOpen(true);
  };

  const handleApprove = (id: number) => {
    // TODO: Add amount input dialog
    const amount = parseFloat(prompt("Enter quote amount:") || "0");
    if (amount > 0) {
      approveMutation.mutate({ id, amount });
    }
  };

  const handleReject = (id: number) => {
    if (confirm("Are you sure you want to reject this quote?")) {
      rejectMutation.mutate(id);
    }
  };

  const handlePrint = (id: number) => {
    handleViewQuote(id);
    // Print functionality is handled in the modal
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export Started",
      description: "Your quotes are being exported to CSV.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Quote Management</CardTitle>
              <p className="text-muted-foreground">Manage and track all customer quotes</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button 
                className="flex items-center space-x-2"
                onClick={() => window.location.href = "/quote-request"}
              >
                <Plus className="h-4 w-4" />
                <span>New Quote</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6 p-4 bg-muted rounded-lg">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search quotes..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Search quotes"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quotes Table */}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No quotes found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.customer?.name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            {quote.customer?.email || "No email"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{quote.projectType}</TableCell>
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
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewQuote(quote.id)}
                            aria-label={`View quote ${quote.quoteNumber}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(quote.id)}
                            aria-label={`Print quote ${quote.quoteNumber}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {quote.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(quote.id)}
                                aria-label={`Approve quote ${quote.quoteNumber}`}
                                className="text-success hover:text-success"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(quote.id)}
                                aria-label={`Reject quote ${quote.quoteNumber}`}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredQuotes.length} of {quotes.length} results
            </div>
            {/* TODO: Implement pagination */}
          </div>
        </CardContent>
      </Card>

      <QuoteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        quoteId={selectedQuoteId}
      />
    </div>
  );
}
