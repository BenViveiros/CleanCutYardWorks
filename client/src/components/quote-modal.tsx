import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Printer, Download, Leaf } from "lucide-react";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { useAccessibility } from "./accessibility-provider";
import type { Quote, Customer, QuoteItem } from "@shared/schema";

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: number | null;
}

export function QuoteModal({ open, onOpenChange, quoteId }: QuoteModalProps) {
  const { announceToScreenReader } = useAccessibility();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: quote, isLoading: quoteLoading } = useQuery<Quote>({
    queryKey: ["/api/quotes", quoteId],
    enabled: !!quoteId,
  });

  const { data: customer, isLoading: customerLoading } = useQuery<Customer>({
    queryKey: ["/api/customers", quote?.customerId],
    enabled: !!quote?.customerId,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<QuoteItem[]>({
    queryKey: ["/api/quotes", quoteId, "items"],
    enabled: !!quoteId,
  });

  const isLoading = quoteLoading || customerLoading || itemsLoading;

  const handlePrint = () => {
    window.print();
    announceToScreenReader("Quote is being printed");
  };

  const handleDownloadPDF = async () => {
    if (!quote || !customer || !items) return;
    
    setIsGeneratingPDF(true);
    try {
      await generateQuotePDF(quote, customer, items);
      announceToScreenReader("PDF downloaded successfully");
    } catch (error) {
      announceToScreenReader("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);
  const tax = subtotal * 0.0825; // 8.25% tax
  const total = subtotal + tax;

  if (!quote || !customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Quote Details - {quote.quoteNumber}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Company Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Leaf className="text-primary text-3xl mr-3" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-foreground">Clean Cut Yard Works</h2>
              </div>
              <p className="text-muted-foreground">Professional Landscaping Services</p>
              <p className="text-sm text-muted-foreground">
                123 Garden Street, Green Valley, CA 90210 | (555) 123-4567
              </p>
            </div>

            {/* Quote and Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Quote Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Quote ID: {quote.quoteNumber}</p>
                  <p>Date: {new Date(quote.createdAt!).toLocaleDateString()}</p>
                  <p>Valid Until: {new Date(quote.validUntil!).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-2">
                    <span>Status:</span>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Customer Information</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{customer.name}</p>
                  <p>{customer.email}</p>
                  <p>{customer.phone}</p>
                  <p>{customer.address}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Project Details</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Project Type:</span> {quote.projectType}
                  </div>
                  <div>
                    <span className="font-medium">Property Size:</span> {quote.propertySize.toLocaleString()} sq ft
                  </div>
                  {quote.timeline && (
                    <div>
                      <span className="font-medium">Timeline:</span> {quote.timeline}
                    </div>
                  )}
                  {quote.budgetRange && (
                    <div>
                      <span className="font-medium">Budget Range:</span> {quote.budgetRange}
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Description:</span>
                  <p className="mt-1">{quote.description}</p>
                </div>
              </div>
            </div>

            {/* Quote Breakdown */}
            {items.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Quote Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Item</th>
                          <th className="text-left p-2 font-medium">Quantity</th>
                          <th className="text-left p-2 font-medium">Unit Price</th>
                          <th className="text-left p-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-2 text-sm">{item.item}</td>
                            <td className="p-2 text-sm">{item.quantity}</td>
                            <td className="p-2 text-sm">${parseFloat(item.unitPrice.toString()).toFixed(2)}</td>
                            <td className="p-2 text-sm">${parseFloat(item.total.toString()).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Subtotal: ${subtotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tax (8.25%): ${tax.toFixed(2)}
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      Total: ${total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Terms & Conditions */}
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Terms & Conditions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>50% deposit required upon acceptance</li>
                <li>Balance due upon completion</li>
                <li>Quote valid for 30 days from date issued</li>
                <li>Weather delays may affect timeline</li>
                <li>Client responsible for utility markings</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 print-hidden">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isGeneratingPDF ? "Generating..." : "Download PDF"}</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
