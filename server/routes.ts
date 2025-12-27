import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { parsePDF, parseCSV, parseExcel, convertToInsertTransaction, isValidTransaction } from "./statementParser";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

const updateUserSettingsSchema = z.object({
  country: z.string().min(2).max(3),
  currency: z.string().min(3).max(3),
  currencySymbol: z.string().min(1).max(5),
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication first
  await setupAuth(app);
  registerAuthRoutes(app);

  // User settings route
  app.put("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const result = updateUserSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid settings data", details: result.error.issues });
      }
      
      const { country, currency, currencySymbol } = result.data;
      const user = await storage.updateUserSettings(userId, country, currency, currencySymbol);
      res.json(user);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

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

  app.post("/api/upload-statement", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { buffer, originalname, mimetype } = req.file;
      const ext = originalname.toLowerCase().split('.').pop();
      
      let parsedTransactions: any[] = [];
      
      if (ext === 'pdf' || mimetype === 'application/pdf') {
        parsedTransactions = await parsePDF(buffer);
      } else if (ext === 'csv' || mimetype === 'text/csv') {
        parsedTransactions = parseCSV(buffer);
      } else if (ext === 'xlsx' || ext === 'xls' || mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
        parsedTransactions = parseExcel(buffer);
      } else {
        return res.status(400).json({ error: "Unsupported file format. Please upload PDF, CSV, or Excel files." });
      }

      const validTransactions = parsedTransactions.filter(isValidTransaction);
      
      if (validTransactions.length === 0) {
        return res.status(400).json({ 
          error: "No valid transactions found in the uploaded file. Please check the file format.",
          totalParsed: parsedTransactions.length
        });
      }

      const savedTransactions = [];
      const errors = [];
      
      for (const parsed of validTransactions) {
        try {
          const insertData = convertToInsertTransaction(parsed);
          const validatedData = insertTransactionSchema.parse(insertData);
          const saved = await storage.createTransaction(validatedData);
          savedTransactions.push(saved);
        } catch (err) {
          errors.push({ description: parsed.description, error: 'Validation failed' });
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${savedTransactions.length} transactions from your bank statement.`,
        count: savedTransactions.length,
        skipped: errors.length,
        transactions: savedTransactions
      });
    } catch (error) {
      console.error("Error processing statement upload:", error);
      res.status(500).json({ error: "Failed to process the uploaded file. Please try again." });
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
