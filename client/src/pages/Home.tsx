import React from 'react';
import { Layout } from '@/components/Layout';
import { TransactionCard } from '@/components/TransactionCard';
import { useTransactions, useCreateTransaction, type Transaction as APITransaction } from '@/lib/api';
import { Bell, Search, Filter, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: transactions, isLoading } = useTransactions();
  const createTransaction = useCreateTransaction();

  const simulateNewMessage = () => {
    toast({
      title: "Scanning Messages...",
      description: "Reading SMS for transactions.",
    });
    
    setTimeout(() => {
      createTransaction.mutate({
        rawMessage: 'Sent Rs. 1500.00 to Zomato via UPI-556677. Ref: LUNCH ORDER.',
        source: 'SMS',
        timestamp: new Date(),
        category: 'Food',
        summary: 'You paid ₹1,500 using UPI to Zomato.',
        amount: '1500.00',
        currency: '₹',
        type: 'debit',
        merchant: 'Zomato',
        method: 'UPI',
        referenceNo: 'LUNCH ORDER',
        balance: '₹10,950.50'
      }, {
        onSuccess: () => {
          toast({
            title: "Transaction Explained",
            description: "Zomato payment of ₹1,500 added to your list.",
          });
        }
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="px-5 pt-6 pb-4 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border/40">
        <header className="flex justify-between items-center mb-4">
          <div>
             <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">Explain My Money</h1>
             <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">Understand your transactions</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted h-9 w-9">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
        </header>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9 bg-secondary/30 border-none h-9 rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all hover:bg-secondary/50 text-sm"
          />
        </div>
      </div>

      {/* Main Feed */}
      <div className="px-5 space-y-2 pt-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Transactions</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          transactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        ) : (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        )}

        <div className="py-4 text-center">
          <p className="text-xs text-muted-foreground">All recent transactions shown above</p>
        </div>
      </div>

      {/* Floating Action Button for Demo */}
      <div className="fixed bottom-24 right-5 md:absolute md:bottom-20 md:right-6 z-50">
        <Button 
          onClick={simulateNewMessage}
          className="h-12 w-12 rounded-full shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          title="Scan for new messages"
        >
          <ScanLine className="w-5 h-5 text-primary-foreground" />
        </Button>
      </div>
    </Layout>
  );
}
