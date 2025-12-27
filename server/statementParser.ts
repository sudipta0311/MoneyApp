import { parse as csvParse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import type { InsertTransaction } from '@shared/schema';

// pdf-parse doesn't have proper ESM exports, use dynamic import
async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string }> {
  const pdfParse = await import('pdf-parse');
  const pdf = pdfParse.default || pdfParse;
  return pdf(buffer);
}

interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance?: number;
}

function categorizeTransaction(description: string): { 
  category: InsertTransaction['category']; 
  investmentType?: InsertTransaction['investmentType'];
  merchant?: string;
} {
  const desc = description.toLowerCase();
  
  if (desc.includes('sip') || desc.includes('systematic investment')) {
    return { category: 'Investment', investmentType: 'SIP', merchant: extractMerchant(description) };
  }
  if (desc.includes('mutual fund') || desc.includes('mf ') || desc.includes('axis') || desc.includes('icici pru') || desc.includes('hdfc mf')) {
    return { category: 'Investment', investmentType: 'Mutual Fund', merchant: extractMerchant(description) };
  }
  if (desc.includes('zerodha') || desc.includes('groww') || desc.includes('stock') || desc.includes('shares')) {
    return { category: 'Investment', investmentType: 'Stocks', merchant: extractMerchant(description) };
  }
  if (desc.includes('ppf') || desc.includes('provident fund')) {
    return { category: 'Investment', investmentType: 'PPF', merchant: 'Public Provident Fund' };
  }
  if (desc.includes('nps') || desc.includes('pension')) {
    return { category: 'Investment', investmentType: 'NPS', merchant: 'NPS Trust' };
  }
  if (desc.includes('emi') && (desc.includes('home') || desc.includes('housing') || desc.includes('hdfc ltd'))) {
    return { category: 'EMI Home Loan', merchant: extractMerchant(description) };
  }
  if (desc.includes('emi') && (desc.includes('car') || desc.includes('vehicle') || desc.includes('auto'))) {
    return { category: 'EMI Car Loan', merchant: extractMerchant(description) };
  }
  if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('food') || desc.includes('restaurant') || desc.includes('cafe') || desc.includes('starbucks')) {
    return { category: 'Food', merchant: extractMerchant(description) };
  }
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime') || desc.includes('hotstar') || desc.includes('movie') || desc.includes('entertainment')) {
    return { category: 'Entertainment', merchant: extractMerchant(description) };
  }
  if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas') || desc.includes('utility') || desc.includes('bill pay')) {
    return { category: 'Utilities', merchant: extractMerchant(description) };
  }
  if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('shopping') || desc.includes('retail')) {
    return { category: 'Shopping', merchant: extractMerchant(description) };
  }
  
  return { category: 'Other', merchant: extractMerchant(description) };
}

function extractMerchant(description: string): string {
  const knownMerchants = [
    'Swiggy', 'Zomato', 'Amazon', 'Flipkart', 'Netflix', 'Spotify', 'Starbucks',
    'Zerodha', 'Groww', 'HDFC', 'ICICI', 'Axis', 'SBI', 'Kotak'
  ];
  
  for (const merchant of knownMerchants) {
    if (description.toLowerCase().includes(merchant.toLowerCase())) {
      return merchant;
    }
  }
  
  const words = description.split(/[\s\/\-]+/).filter(w => w.length > 2);
  return words.slice(0, 2).join(' ') || 'Unknown';
}

function detectPaymentMethod(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('upi') || desc.includes('@')) return 'UPI';
  if (desc.includes('neft')) return 'NEFT';
  if (desc.includes('imps')) return 'IMPS';
  if (desc.includes('rtgs')) return 'RTGS';
  if (desc.includes('atm')) return 'ATM';
  if (desc.includes('pos') || desc.includes('card')) return 'Card';
  if (desc.includes('auto') || desc.includes('ecs') || desc.includes('nach')) return 'Auto-Debit';
  return 'Bank Transfer';
}

function generateSummary(tx: ParsedTransaction, category: string, merchant: string): string {
  const typeWord = tx.type === 'credit' ? 'received' : 'paid';
  const amount = `₹${tx.amount.toLocaleString('en-IN')}`;
  
  if (category === 'Investment') {
    return `You invested ${amount} in ${merchant}.`;
  }
  if (category.includes('EMI')) {
    return `Your ${category.replace('EMI ', '')} EMI of ${amount} was debited.`;
  }
  return `You ${typeWord} ${amount} to ${merchant}.`;
}

export async function parsePDF(buffer: Buffer): Promise<ParsedTransaction[]> {
  const data = await parsePdfBuffer(buffer);
  const text = data.text;
  const lines = text.split('\n').filter((line: string) => line.trim());
  
  const transactions: ParsedTransaction[] = [];
  
  const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
  const amountPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
  
  for (const line of lines as string[]) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;
    
    const amounts = line.match(amountPattern);
    if (!amounts || amounts.length === 0) continue;
    
    const amount = parseFloat(amounts[0].replace(/,/g, ''));
    if (isNaN(amount) || amount === 0) continue;
    
    const isCredit = line.toLowerCase().includes('cr') || 
                     line.toLowerCase().includes('credit') ||
                     line.toLowerCase().includes('received');
    
    transactions.push({
      date: parseDate(dateMatch[1]),
      description: line.replace(datePattern, '').replace(amountPattern, '').trim(),
      amount,
      type: isCredit ? 'credit' : 'debit',
      balance: amounts.length > 1 ? parseFloat(amounts[amounts.length - 1].replace(/,/g, '')) : undefined
    });
  }
  
  return transactions;
}

export function parseCSV(buffer: Buffer): ParsedTransaction[] {
  const content = buffer.toString('utf-8');
  const records = csvParse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  const transactions: ParsedTransaction[] = [];
  
  for (const record of records as Record<string, string>[]) {
    const dateCol = findColumn(record, ['date', 'txn date', 'transaction date', 'value date']);
    const descCol = findColumn(record, ['description', 'narration', 'particulars', 'remarks', 'details']);
    const debitCol = findColumn(record, ['debit', 'withdrawal', 'dr', 'debit amount']);
    const creditCol = findColumn(record, ['credit', 'deposit', 'cr', 'credit amount']);
    const amountCol = findColumn(record, ['amount', 'transaction amount', 'txn amount']);
    const balanceCol = findColumn(record, ['balance', 'closing balance', 'available balance']);
    
    if (!dateCol || !descCol) continue;
    
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';
    
    if (debitCol && record[debitCol]) {
      amount = parseFloat(record[debitCol].replace(/[^0-9.-]/g, ''));
      type = 'debit';
    } else if (creditCol && record[creditCol]) {
      amount = parseFloat(record[creditCol].replace(/[^0-9.-]/g, ''));
      type = 'credit';
    } else if (amountCol && record[amountCol]) {
      amount = parseFloat(record[amountCol].replace(/[^0-9.-]/g, ''));
      type = amount < 0 ? 'debit' : 'credit';
      amount = Math.abs(amount);
    }
    
    if (isNaN(amount) || amount === 0) continue;
    
    transactions.push({
      date: parseDate(record[dateCol]),
      description: record[descCol],
      amount,
      type,
      balance: balanceCol ? parseFloat(record[balanceCol].replace(/[^0-9.-]/g, '')) : undefined
    });
  }
  
  return transactions;
}

export function parseExcel(buffer: Buffer): ParsedTransaction[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json(sheet);
  
  const transactions: ParsedTransaction[] = [];
  
  for (const record of records as Record<string, any>[]) {
    const dateCol = findColumn(record, ['date', 'txn date', 'transaction date', 'value date']);
    const descCol = findColumn(record, ['description', 'narration', 'particulars', 'remarks', 'details']);
    const debitCol = findColumn(record, ['debit', 'withdrawal', 'dr', 'debit amount']);
    const creditCol = findColumn(record, ['credit', 'deposit', 'cr', 'credit amount']);
    const amountCol = findColumn(record, ['amount', 'transaction amount', 'txn amount']);
    const balanceCol = findColumn(record, ['balance', 'closing balance', 'available balance']);
    
    if (!dateCol || !descCol) continue;
    
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';
    
    if (debitCol && record[debitCol]) {
      amount = typeof record[debitCol] === 'number' ? record[debitCol] : parseFloat(String(record[debitCol]).replace(/[^0-9.-]/g, ''));
      type = 'debit';
    } else if (creditCol && record[creditCol]) {
      amount = typeof record[creditCol] === 'number' ? record[creditCol] : parseFloat(String(record[creditCol]).replace(/[^0-9.-]/g, ''));
      type = 'credit';
    } else if (amountCol && record[amountCol]) {
      amount = typeof record[amountCol] === 'number' ? record[amountCol] : parseFloat(String(record[amountCol]).replace(/[^0-9.-]/g, ''));
      type = amount < 0 ? 'debit' : 'credit';
      amount = Math.abs(amount);
    }
    
    if (isNaN(amount) || amount === 0) continue;
    
    let dateValue = record[dateCol];
    if (typeof dateValue === 'number') {
      dateValue = XLSX.SSF.parse_date_code(dateValue);
      dateValue = new Date(dateValue.y, dateValue.m - 1, dateValue.d);
    }
    
    transactions.push({
      date: typeof dateValue === 'string' ? parseDate(dateValue) : dateValue,
      description: String(record[descCol]),
      amount,
      type,
      balance: balanceCol ? (typeof record[balanceCol] === 'number' ? record[balanceCol] : parseFloat(String(record[balanceCol]).replace(/[^0-9.-]/g, ''))) : undefined
    });
  }
  
  return transactions;
}

function findColumn(record: Record<string, any>, possibleNames: string[]): string | null {
  const keys = Object.keys(record);
  for (const name of possibleNames) {
    const found = keys.find(k => k.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }
  return null;
}

function parseDate(dateStr: string): Date {
  const formats = [
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})/,
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day, month, year;
      if (format === formats[2]) {
        [, year, month, day] = match.map(Number);
      } else {
        [, day, month, year] = match.map(Number);
        if (year < 100) year += 2000;
      }
      return new Date(year, month - 1, day);
    }
  }
  
  return new Date(dateStr);
}

export function isValidTransaction(parsed: ParsedTransaction): boolean {
  if (!parsed.date || isNaN(parsed.date.getTime())) return false;
  if (!parsed.amount || parsed.amount <= 0) return false;
  if (!parsed.description || parsed.description.trim().length < 3) return false;
  
  const desc = parsed.description.toLowerCase();
  const skipPatterns = [
    'opening balance', 'closing balance', 'total', 'balance b/f', 'balance c/f',
    'statement', 'account number', 'ifsc', 'branch', 'page', 'date', 'particulars',
    'debit', 'credit', 'amount', 'narration', 'transaction details', 'sr no',
    'sl no', 'serial', 'beginning balance', 'ending balance', 'sub total'
  ];
  
  for (const pattern of skipPatterns) {
    if (desc.includes(pattern) && parsed.amount === 0) return false;
    if (desc === pattern) return false;
  }
  
  return true;
}

export function convertToInsertTransaction(parsed: ParsedTransaction, referenceNo?: string): InsertTransaction {
  const { category, investmentType, merchant } = categorizeTransaction(parsed.description);
  const method = detectPaymentMethod(parsed.description);
  const summary = generateSummary(parsed, category, merchant || 'Unknown');
  
  return {
    rawMessage: parsed.description,
    source: 'SMS' as const,
    timestamp: parsed.date,
    category,
    investmentType: investmentType || null,
    summary,
    amount: parsed.amount.toFixed(2),
    currency: '₹',
    type: parsed.type,
    merchant: merchant || null,
    method: method || null,
    referenceNo: referenceNo || `STMT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    balance: parsed.balance ? `₹${parsed.balance.toLocaleString('en-IN')}` : null
  };
}
