import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertQuoteSchema, quoteRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByEmail(validatedData.email);
      if (existingCustomer) {
        return res.status(409).json({ error: "Customer with this email already exists" });
      }

      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const { status, customerId } = req.query;
      let quotes;
      
      if (status) {
        quotes = await storage.getQuotesByStatus(status as string);
      } else if (customerId) {
        quotes = await storage.getQuotesByCustomer(parseInt(customerId as string));
      } else {
        quotes = await storage.getAllQuotes();
      }
      
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  app.get("/api/quotes/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await storage.getQuoteItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quote items" });
    }
  });

  app.post("/api/quotes/request", async (req, res) => {
    try {
      const validatedData = quoteRequestSchema.parse(req.body);
      
      // Create or find customer
      let customer = await storage.getCustomerByEmail(validatedData.customerEmail);
      if (!customer) {
        customer = await storage.createCustomer({
          name: validatedData.customerName,
          email: validatedData.customerEmail,
          phone: validatedData.customerPhone,
          address: validatedData.customerAddress,
        });
      }

      // Create quote
      const quote = await storage.createQuote({
        customerId: customer.id,
        projectType: validatedData.projectType,
        propertySize: validatedData.propertySize,
        budgetRange: validatedData.budgetRange,
        description: validatedData.description,
        timeline: validatedData.timeline,
        requestedDate: new Date(),
        status: "pending",
        amount: null,
      });

      res.status(201).json({ quote, customer });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create quote request" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const quote = await storage.updateQuote(id, updates);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quote" });
    }
  });

  app.post("/api/quotes/:id/items", async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      const itemData = req.body;
      
      const item = await storage.addQuoteItem({
        quoteId,
        ...itemData,
      });
      
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add quote item" });
    }
  });

  // Quote actions
  app.post("/api/quotes/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { amount } = req.body;
      
      const quote = await storage.updateQuote(id, { 
        status: "approved", 
        amount: amount?.toString() 
      });
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve quote" });
    }
  });

  app.post("/api/quotes/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const quote = await storage.updateQuote(id, { status: "rejected" });
      
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject quote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
