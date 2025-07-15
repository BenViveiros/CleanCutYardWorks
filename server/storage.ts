import { 
  customers, 
  quotes, 
  quoteItems, 
  type Customer, 
  type InsertCustomer, 
  type Quote, 
  type InsertQuote, 
  type QuoteItem, 
  type InsertQuoteItem 
} from "@shared/schema";

export interface IStorage {
  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  
  // Quotes
  getQuote(id: number): Promise<Quote | undefined>;
  getQuoteByNumber(quoteNumber: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  getQuotesByCustomer(customerId: number): Promise<Quote[]>;
  getQuotesByStatus(status: string): Promise<Quote[]>;
  
  // Quote Items
  getQuoteItems(quoteId: number): Promise<QuoteItem[]>;
  addQuoteItem(item: InsertQuoteItem): Promise<QuoteItem>;
  updateQuoteItem(id: number, item: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined>;
  deleteQuoteItem(id: number): Promise<boolean>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalQuotes: number;
    approvedQuotes: number;
    pendingQuotes: number;
    totalRevenue: number;
    monthlyRevenue: { month: string; revenue: number }[];
  }>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private quotes: Map<number, Quote>;
  private quoteItems: Map<number, QuoteItem>;
  private currentCustomerId: number;
  private currentQuoteId: number;
  private currentQuoteItemId: number;
  private currentQuoteNumber: number;

  constructor() {
    this.customers = new Map();
    this.quotes = new Map();
    this.quoteItems = new Map();
    this.currentCustomerId = 1;
    this.currentQuoteId = 1;
    this.currentQuoteItemId = 1;
    this.currentQuoteNumber = 1;
  }

  // Customers
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated: Customer = { ...existing, ...customer };
    this.customers.set(id, updated);
    return updated;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  // Quotes
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getQuoteByNumber(quoteNumber: string): Promise<Quote | undefined> {
    return Array.from(this.quotes.values()).find(q => q.quoteNumber === quoteNumber);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.currentQuoteId++;
    const quoteNumber = `QT-2024-${String(this.currentQuoteNumber++).padStart(3, '0')}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    
    const quote: Quote = {
      id,
      quoteNumber,
      customerId: insertQuote.customerId,
      projectType: insertQuote.projectType,
      propertySize: insertQuote.propertySize,
      budgetRange: insertQuote.budgetRange || null,
      description: insertQuote.description,
      timeline: insertQuote.timeline || null,
      status: insertQuote.status || "pending",
      amount: insertQuote.amount || null,
      validUntil,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existing = this.quotes.get(id);
    if (!existing) return undefined;
    
    const updated: Quote = { ...existing, ...quote, updatedAt: new Date() };
    this.quotes.set(id, updated);
    return updated;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
  }

  async getQuotesByCustomer(customerId: number): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(q => q.customerId === customerId);
  }

  async getQuotesByStatus(status: string): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(q => q.status === status);
  }

  // Quote Items
  async getQuoteItems(quoteId: number): Promise<QuoteItem[]> {
    return Array.from(this.quoteItems.values()).filter(item => item.quoteId === quoteId);
  }

  async addQuoteItem(insertItem: InsertQuoteItem): Promise<QuoteItem> {
    const id = this.currentQuoteItemId++;
    const item: QuoteItem = { ...insertItem, id };
    this.quoteItems.set(id, item);
    return item;
  }

  async updateQuoteItem(id: number, item: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined> {
    const existing = this.quoteItems.get(id);
    if (!existing) return undefined;
    
    const updated: QuoteItem = { ...existing, ...item };
    this.quoteItems.set(id, updated);
    return updated;
  }

  async deleteQuoteItem(id: number): Promise<boolean> {
    return this.quoteItems.delete(id);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    totalQuotes: number;
    approvedQuotes: number;
    pendingQuotes: number;
    totalRevenue: number;
    monthlyRevenue: { month: string; revenue: number }[];
  }> {
    const allQuotes = Array.from(this.quotes.values());
    const approvedQuotes = allQuotes.filter(q => q.status === 'approved');
    const pendingQuotes = allQuotes.filter(q => q.status === 'pending');
    
    const totalRevenue = approvedQuotes.reduce((sum, quote) => {
      return sum + (quote.amount ? parseFloat(quote.amount.toString()) : 0);
    }, 0);

    // Generate mock monthly revenue data
    const monthlyRevenue = [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 22000 },
      { month: 'May', revenue: 25000 },
      { month: 'Jun', revenue: 28000 },
    ];

    return {
      totalQuotes: allQuotes.length,
      approvedQuotes: approvedQuotes.length,
      pendingQuotes: pendingQuotes.length,
      totalRevenue,
      monthlyRevenue,
    };
  }
}

export const storage = new MemStorage();
