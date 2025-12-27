import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      const debits = transactions.filter(t => t.type === 'debit');
      
      // Group by category and calculate totals
      const categoryMap: Record<string, { total: number; count: number }> = {};
      let totalSpend = 0;
      
      debits.forEach(tx => {
        const amount = parseFloat(tx.amount);
        if (!categoryMap[tx.category]) {
          categoryMap[tx.category] = { total: 0, count: 0 };
        }
        categoryMap[tx.category].total += amount;
        categoryMap[tx.category].count += 1;
        totalSpend += amount;
      });
      
      // Convert to array with percentages
      const categoryTotals = Object.entries(categoryMap)
        .map(([name, data]) => ({
          name,
          total: data.total,
          count: data.count,
          percentage: (data.total / totalSpend) * 100
        }))
        .sort((a, b) => b.total - a.total);
      
      res.json({
        totalSpend,
        categories: categoryTotals
      });
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/investments", async (req, res) => {
    try {
      const investments = await storage.getInvestmentTransactions();
      
      // Group by investment type
      const investmentMap: Record<string, { total: number; count: number }> = {};
      let totalInvestment = 0;
      
      investments.forEach(inv => {
        const amount = parseFloat(inv.amount);
        const type = inv.investmentType || 'Other';
        
        if (!investmentMap[type]) {
          investmentMap[type] = { total: 0, count: 0 };
        }
        
        investmentMap[type].total += amount;
        investmentMap[type].count += 1;
        totalInvestment += amount;
      });
      
      // Convert to array with percentages
      const investmentTotals = Object.entries(investmentMap)
        .map(([type, data]) => ({
          type,
          total: data.total,
          count: data.count,
          percentage: totalInvestment > 0 ? (data.total / totalInvestment) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);
      
      res.json({
        totalInvestment,
        investments: investmentTotals,
        transactions: investments
      });
    } catch (error) {
      console.error("Error fetching investment analytics:", error);
      res.status(500).json({ error: "Failed to fetch investment analytics" });
    }
  });

  return httpServer;
}
