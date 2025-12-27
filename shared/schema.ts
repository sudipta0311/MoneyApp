import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  rawMessage: text("raw_message").notNull(),
  source: text("source", { enum: ["SMS", "Email"] }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  category: text("category", { 
    enum: ["Food", "Entertainment", "EMI Home Loan", "EMI Car Loan", "Utilities", "Shopping", "Investment", "Other"] 
  }).notNull(),
  investmentType: text("investment_type", { 
    enum: ["SIP", "Mutual Fund", "Stocks", "PPF", "NPS", "Bonds", "Other"] 
  }),
  
  // Explanation fields
  summary: text("summary").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("₹"),
  type: text("type", { enum: ["debit", "credit", "alert"] }).notNull(),
  merchant: text("merchant"),
  method: text("method"),
  referenceNo: text("reference_no"),
  balance: text("balance"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
