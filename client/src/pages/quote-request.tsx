import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/components/accessibility-provider";
import { apiRequest } from "@/lib/queryClient";
import { quoteRequestSchema, type QuoteRequest } from "@shared/schema";

export default function QuoteRequest() {
  const { toast } = useToast();
  const { announceToScreenReader } = useAccessibility();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuoteRequest>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      projectType: "",
      propertySize: 0,
      budgetRange: "",
      description: "",
      timeline: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: QuoteRequest) => {
      const response = await apiRequest("POST", "/api/quotes/request", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted",
        description: "Your quote request has been submitted successfully. We'll get back to you soon!",
      });
      announceToScreenReader("Quote request submitted successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
      announceToScreenReader("Failed to submit quote request");
    },
  });

  const onSubmit = async (data: QuoteRequest) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    toast({
      title: "Draft Saved",
      description: "Your quote request has been saved as a draft.",
    });
    announceToScreenReader("Draft saved successfully");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Request a Quote</CardTitle>
          <p className="text-muted-foreground">
            Fill out the form below to get a customized landscaping quote
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div role="region" aria-labelledby="customer-info-heading">
                <h2 id="customer-info-heading" className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
                  Customer Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            aria-describedby="customer-name-help"
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email address" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="(555) 123-4567" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter property address" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div role="region" aria-labelledby="project-details-heading">
                <h2 id="project-details-heading" className="text-lg font-semibold text-foreground mb-4 pb-2 border-b">
                  Project Details
                </h2>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lawn-care">Lawn Care</SelectItem>
                            <SelectItem value="garden-design">Garden Design</SelectItem>
                            <SelectItem value="hardscaping">Hardscaping</SelectItem>
                            <SelectItem value="tree-services">Tree Services</SelectItem>
                            <SelectItem value="irrigation">Irrigation System</SelectItem>
                            <SelectItem value="maintenance">Maintenance Services</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="propertySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Size (sq ft) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter property size" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage role="alert" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under-1000">Under $1,000</SelectItem>
                              <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                              <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                              <SelectItem value="over-25000">Over $25,000</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage role="alert" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your landscaping project in detail..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Please provide as much detail as possible about your vision, preferred materials, timeline, and any specific requirements.
                        </FormDescription>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Timeline</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asap">ASAP</SelectItem>
                            <SelectItem value="1-month">Within 1 month</SelectItem>
                            <SelectItem value="3-months">Within 3 months</SelectItem>
                            <SelectItem value="6-months">Within 6 months</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 space-y-4 sm:space-y-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
