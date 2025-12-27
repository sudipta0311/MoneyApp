import { type User, type UpsertUser, type Transaction, type InsertTransaction, type UserSettings, type InsertUserSettings, users, transactions, userSettings } from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSettings(userId: string, country: string, currency: string, currencySymbol: string): Promise<User>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<boolean>;
  getTransactionsByCategory(category: string): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  getInvestmentTransactions(): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSettings(userId: string, country: string, currency: string, currencySymbol: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ country, currency, currencySymbol, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.timestamp));
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result.length > 0;
  }
  
  async getTransactionsByCategory(category: Transaction['category']): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.category, category))
      .orderBy(desc(transactions.timestamp));
  }
  
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(
        gte(transactions.timestamp, startDate),
        lte(transactions.timestamp, endDate)
      ))
      .orderBy(desc(transactions.timestamp));
  }
  
  async getInvestmentTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.category, "Investment"))
      .orderBy(desc(transactions.timestamp));
  }
}

export const storage = new DatabaseStorage();
