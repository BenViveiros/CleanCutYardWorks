import jsPDF from "jspdf";
import type { Quote, Customer, QuoteItem } from "@shared/schema";

export async function generateQuotePDF(quote: Quote, customer: Customer, items: QuoteItem[]) {
  const doc = new jsPDF();
  
  // Company header
  doc.setFontSize(20);
  doc.text("Clean Cut Yard Works", 20, 20);
  doc.setFontSize(12);
  doc.text("Professional Landscaping Services", 20, 30);
  doc.text("123 Garden Street, Green Valley, CA 90210 | (555) 123-4567", 20, 40);
  
  // Quote information
  doc.setFontSize(14);
  doc.text("Quote Information", 20, 60);
  doc.setFontSize(10);
  doc.text(`Quote ID: ${quote.quoteNumber}`, 20, 70);
  doc.text(`Date: ${new Date(quote.createdAt!).toLocaleDateString()}`, 20, 80);
  doc.text(`Valid Until: ${new Date(quote.validUntil!).toLocaleDateString()}`, 20, 90);
  doc.text(`Status: ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}`, 20, 100);
  
  // Customer information
  doc.setFontSize(14);
  doc.text("Customer Information", 120, 60);
  doc.setFontSize(10);
  doc.text(customer.name, 120, 70);
  doc.text(customer.email, 120, 80);
  doc.text(customer.phone, 120, 90);
  doc.text(customer.address, 120, 100);
  
  // Project details
  doc.setFontSize(14);
  doc.text("Project Details", 20, 120);
  doc.setFontSize(10);
  doc.text(`Project Type: ${quote.projectType}`, 20, 130);
  doc.text(`Property Size: ${quote.propertySize.toLocaleString()} sq ft`, 20, 140);
  if (quote.timeline) {
    doc.text(`Timeline: ${quote.timeline}`, 20, 150);
  }
  if (quote.budgetRange) {
    doc.text(`Budget Range: ${quote.budgetRange}`, 20, 160);
  }
  
  // Description
  doc.text("Description:", 20, 180);
  const descriptionLines = doc.splitTextToSize(quote.description, 170);
  doc.text(descriptionLines, 20, 190);
  
  let yPosition = 190 + (descriptionLines.length * 10) + 20;
  
  // Quote breakdown if items exist
  if (items.length > 0) {
    doc.setFontSize(14);
    doc.text("Quote Breakdown", 20, yPosition);
    yPosition += 20;
    
    // Table headers
    doc.setFontSize(10);
    doc.text("Item", 20, yPosition);
    doc.text("Qty", 100, yPosition);
    doc.text("Unit Price", 130, yPosition);
    doc.text("Total", 170, yPosition);
    yPosition += 10;
    
    // Table rows
    items.forEach((item) => {
      doc.text(item.item, 20, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`$${parseFloat(item.unitPrice.toString()).toFixed(2)}`, 130, yPosition);
      doc.text(`$${parseFloat(item.total.toString()).toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Totals
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;
    
    yPosition += 10;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 170, yPosition);
    yPosition += 10;
    doc.text(`Tax (8.25%): $${tax.toFixed(2)}`, 170, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total: $${total.toFixed(2)}`, 170, yPosition);
  }
  
  // Terms & Conditions
  yPosition += 30;
  doc.setFontSize(10);
  doc.text("Terms & Conditions:", 20, yPosition);
  yPosition += 10;
  const terms = [
    "• 50% deposit required upon acceptance",
    "• Balance due upon completion",
    "• Quote valid for 30 days from date issued",
    "• Weather delays may affect timeline",
    "• Client responsible for utility markings"
  ];
  
  terms.forEach((term) => {
    doc.text(term, 20, yPosition);
    yPosition += 10;
  });
  
  // Save the PDF
  doc.save(`quote-${quote.quoteNumber}.pdf`);
}
