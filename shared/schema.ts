import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, decimal, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  country: varchar("country").default("IN"),
  currency: varchar("currency").default("INR"),
  currencySymbol: varchar("currency_symbol").default("₹"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  country: varchar("country").notNull().default("IN"),
  currency: varchar("currency").notNull().default("INR"),
  currencySymbol: varchar("currency_symbol").notNull().default("₹"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

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
