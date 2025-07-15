import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  MapPin
} from "lucide-react";
import type { Customer, Quote } from "@shared/schema";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      customer.address.toLowerCase().includes(searchLower)
    );
  });

  // Get quote count and status for each customer
  const getCustomerStats = (customerId: number) => {
    const customerQuotes = quotes.filter(q => q.customerId === customerId);
    const totalQuotes = customerQuotes.length;
    const approvedQuotes = customerQuotes.filter(q => q.status === "approved").length;
    const pendingQuotes = customerQuotes.filter(q => q.status === "pending").length;
    const totalValue = customerQuotes
      .filter(q => q.status === "approved" && q.amount)
      .reduce((sum, q) => sum + parseFloat(q.amount!.toString()), 0);

    return {
      totalQuotes,
      approvedQuotes,
      pendingQuotes,
      totalValue
    };
  };

  if (customersLoading) {
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
              <CardTitle className="text-2xl">Customer Management</CardTitle>
              <p className="text-muted-foreground">Manage customer information and history</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Customer</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Search customers"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No customers found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => {
                    const stats = getCustomerStats(customer.id);
                    return (
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Customer since {new Date(customer.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{customer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{customer.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {stats.totalQuotes} Total
                            </Badge>
                            {stats.approvedQuotes > 0 && (
                              <Badge className="bg-success text-success-foreground text-xs">
                                {stats.approvedQuotes} Approved
                              </Badge>
                            )}
                            {stats.pendingQuotes > 0 && (
                              <Badge className="bg-warning text-warning-foreground text-xs">
                                {stats.pendingQuotes} Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${stats.totalValue.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`View customer ${customer.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit customer ${customer.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
