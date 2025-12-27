import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the Transaction type based on the backend schema
export interface Transaction {
  id: number;
  rawMessage: string;
  source: 'SMS' | 'Email';
  timestamp: string | Date;
  category: 'Food' | 'Entertainment' | 'EMI Home Loan' | 'EMI Car Loan' | 'Utilities' | 'Shopping' | 'Investment' | 'Other';
  investmentType?: 'SIP' | 'Mutual Fund' | 'Stocks' | 'PPF' | 'NPS' | 'Bonds' | 'Other' | null;
  summary: string;
  amount: string;
  currency: string;
  type: 'debit' | 'credit' | 'alert';
  merchant?: string | null;
  method?: string | null;
  referenceNo?: string | null;
  balance?: string | null;
  createdAt: string | Date;
}

export interface NewTransaction {
  rawMessage: string;
  source: 'SMS' | 'Email';
  timestamp: Date;
  category: Transaction['category'];
  investmentType?: Transaction['investmentType'];
  summary: string;
  amount: string;
  currency: string;
  type: 'debit' | 'credit' | 'alert';
  merchant?: string;
  method?: string;
  referenceNo?: string;
  balance?: string;
}

// API functions
async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch('/api/transactions');
  if (!response.ok) throw new Error('Failed to fetch transactions');
  const data = await response.json();
  // Convert timestamp strings to Date objects
  return data.map((tx: any) => ({
    ...tx,
    timestamp: new Date(tx.timestamp),
    createdAt: new Date(tx.createdAt)
  }));
}

async function createTransaction(transaction: NewTransaction): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}

async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
}

// React Query hooks
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
