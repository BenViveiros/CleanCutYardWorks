import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import type { Quote, Customer } from "@shared/schema";

interface QuoteWithCustomer extends Quote {
  customer?: Customer;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: quotes = [], isLoading: quotesLoading } = useQuery<QuoteWithCustomer[]>({
    queryKey: ["/api/quotes"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Merge quotes with customer data
  const quotesWithCustomers = quotes.map(quote => ({
    ...quote,
    customer: customers.find(c => c.id === quote.customerId)
  }));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getQuotesForDate = (date: Date) => {
    return quotesWithCustomers.filter(quote => {
      const quoteDate = new Date(quote.requestedDate);
      return isSameDay(quoteDate, date);
    });
  };

  const selectedDateQuotes = selectedDate ? getQuotesForDate(selectedDate) : [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (quotesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and track all landscaping projects by date
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigateMonth('prev')}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            onClick={() => navigateMonth('next')}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <CardDescription>
                Click on any date to view project details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const dayQuotes = getQuotesForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <TooltipProvider key={day.toString()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isSelected ? "default" : "ghost"}
                            className={`
                              h-16 p-1 flex flex-col items-center justify-center relative
                              ${isCurrentDay ? 'ring-2 ring-primary' : ''}
                              ${dayQuotes.length > 0 ? 'bg-primary/10 hover:bg-primary/20' : ''}
                            `}
                            onClick={() => setSelectedDate(day)}
                          >
                            <span className="text-sm font-medium">
                              {format(day, 'd')}
                            </span>
                            {dayQuotes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dayQuotes.slice(0, 3).map((quote, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                      quote.status === 'pending' ? 'bg-yellow-500' :
                                      quote.status === 'approved' ? 'bg-green-500' :
                                      quote.status === 'rejected' ? 'bg-red-500' :
                                      'bg-blue-500'
                                    }`}
                                  />
                                ))}
                                {dayQuotes.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{dayQuotes.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(day, 'EEEE, MMMM d')}</p>
                          {dayQuotes.length > 0 && (
                            <p className="text-xs mt-1">
                              {dayQuotes.length} project{dayQuotes.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
              </CardTitle>
              <CardDescription>
                {selectedDate ? 
                  `${selectedDateQuotes.length} project${selectedDateQuotes.length !== 1 ? 's' : ''} scheduled` :
                  'Click on a calendar date to view project details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate && selectedDateQuotes.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateQuotes.map(quote => (
                    <div
                      key={quote.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {quote.customer?.name || 'Unknown Customer'}
                        </h4>
                        <Badge
                          variant="secondary"
                          className={statusColors[quote.status as keyof typeof statusColors]}
                        >
                          {quote.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {quote.projectType}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Quote #{quote.quoteNumber}</span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(Number(quote.amount) || 0)}
                        </span>
                      </div>
                      
                      {quote.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {quote.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No projects scheduled for this date
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Select a date to view project details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Projects</span>
                  <span className="font-medium">
                    {quotesWithCustomers.filter(quote => {
                      const quoteDate = new Date(quote.requestedDate);
                      return quoteDate >= monthStart && quoteDate <= monthEnd;
                    }).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="font-medium text-green-600">
                    {quotesWithCustomers.filter(quote => {
                      const quoteDate = new Date(quote.requestedDate);
                      return quote.status === 'approved' && quoteDate >= monthStart && quoteDate <= monthEnd;
                    }).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {quotesWithCustomers.filter(quote => {
                      const quoteDate = new Date(quote.requestedDate);
                      return quote.status === 'pending' && quoteDate >= monthStart && quoteDate <= monthEnd;
                    }).length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-blue-600">
                    {quotesWithCustomers.filter(quote => {
                      const quoteDate = new Date(quote.requestedDate);
                      return quote.status === 'completed' && quoteDate >= monthStart && quoteDate <= monthEnd;
                    }).length}
                  </span>
                </div>
                
                <hr className="my-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                  <span className="font-medium">
                    {formatCurrency(
                      quotesWithCustomers
                        .filter(quote => {
                          const quoteDate = new Date(quote.requestedDate);
                          return quote.status === 'approved' && quoteDate >= monthStart && quoteDate <= monthEnd;
                        })
                        .reduce((sum, quote) => sum + (Number(quote.amount) || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}