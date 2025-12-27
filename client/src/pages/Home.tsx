import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { TransactionCard } from '@/components/TransactionCard';
import { MOCK_TRANSACTIONS, Transaction } from '@/lib/mockData';
import { Bell, Search, Filter, Plus, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import logoImage from '@assets/generated_images/minimalist_logo_for_financial_clarity_app.png';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const simulateNewMessage = () => {
    toast({
      title: "Scanning Messages...",
      description: "Found 1 new transaction from SMS.",
    });
    
    setTimeout(() => {
      const newTx: Transaction = {
        id: `new-${Date.now()}`,
        source: 'SMS',
        timestamp: new Date(),
        rawMessage: 'Sent Rs. 1500.00 to Zomato via UPI-556677. Ref: LUNCH ORDER.',
        explanation: {
          summary: 'Payment to Zomato for food order.',
          amount: 1500.00,
          currency: '₹',
          type: 'debit',
          merchant: 'Zomato',
          method: 'UPI',
          referenceNo: 'LUNCH ORDER',
          balance: '₹10,950.50'
        }
      };
      setTransactions([newTx, ...transactions]);
      toast({
        title: "New Transaction Parsed",
        description: "Zomato payment of ₹1,500 recorded.",
        className: "bg-green-50 dark:bg-green-900 border-green-200"
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="px-6 pt-6 pb-4 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-border/40">
        <header className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
                <img src={logoImage} alt="ClearText Logo" className="w-full h-full object-cover" />
             </div>
             <div>
               <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">ClearText</h1>
               <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Financial Clarity</p>
             </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
        </header>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9 bg-secondary/30 border-none h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary transition-all hover:bg-secondary/50"
          />
        </div>
      </div>

      {/* Main Feed */}
      <div className="px-6 space-y-2 pt-4 min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80 px-2 hover:bg-primary/5 rounded-full">
            <Filter className="w-3 h-3 mr-1.5" /> Filter
          </Button>
        </div>

        {transactions.map((tx) => (
          <TransactionCard key={tx.id} transaction={tx} />
        ))}

        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground">All caught up!</p>
        </div>
      </div>

      {/* Floating Action Button for Demo */}
      <div className="fixed bottom-24 right-6 md:absolute md:bottom-20 md:right-6 z-50">
        <Button 
          onClick={simulateNewMessage}
          className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <ScanLine className="w-6 h-6 text-primary-foreground" />
        </Button>
      </div>
    </Layout>
  );
}
