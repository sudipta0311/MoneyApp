import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Landmark, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  MessageSquare,
  Check
} from 'lucide-react';
import type { Transaction } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!transaction) {
    return null;
  }
  
  const { rawMessage, source, timestamp, method, type, merchant, summary, amount, currency, referenceNo, balance } = transaction;

  const getIcon = () => {
    switch (method) {
      case 'UPI': return <Smartphone className="w-5 h-5" />;
      case 'Card': 
      case 'Credit Card': return <CreditCard className="w-5 h-5" />;
      case 'Bank Transfer': return <Landmark className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAmountColor = () => {
    if (type === 'credit') return 'text-green-600 dark:text-green-400';
    if (type === 'alert') return 'text-orange-600 dark:text-orange-400';
    return 'text-primary';
  };

  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return dateObj.toLocaleDateString();
  };

  return (
    <Card className="mb-3 overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground flex-shrink-0">
                {getIcon()}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight">
                  {merchant || 'Transaction'}
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {source} • {formatTime(timestamp)}
                </p>
              </div>
            </div>
            <div className={cn("text-base font-bold font-mono tracking-tight ml-2 flex-shrink-0", getAmountColor())}>
              {type === 'credit' ? '+' : ''}
              {currency}{parseFloat(amount).toLocaleString()}
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="text-sm font-medium text-foreground/85 leading-relaxed">
            {summary}
          </div>
        </div>

        {/* Expanded Details Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-muted/30 border-t border-border"
            >
              <div className="p-4 space-y-4">
                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {method && (
                    <div>
                      <span className="text-muted-foreground block font-medium mb-1">Payment Method</span>
                      <span className="text-foreground">{method}</span>
                    </div>
                  )}
                  {referenceNo && (
                    <div>
                      <span className="text-muted-foreground block font-medium mb-1">Reference</span>
                      <span className="font-mono text-[11px]">{referenceNo}</span>
                    </div>
                  )}
                  {balance && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block font-medium mb-1">Updated Balance</span>
                      <span className="text-foreground font-medium">{balance}</span>
                    </div>
                  )}
                </div>

                {/* Raw Message View */}
                <div className="bg-background border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <MessageSquare className="w-3 h-3" />
                    Original Message
                  </div>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed break-words">
                    {rawMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
