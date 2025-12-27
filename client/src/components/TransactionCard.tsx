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
import { Transaction } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { explanation, rawMessage, source, timestamp } = transaction;

  const getIcon = () => {
    switch (explanation.method) {
      case 'UPI': return <Smartphone className="w-5 h-5" />;
      case 'Card': 
      case 'Credit Card': return <CreditCard className="w-5 h-5" />;
      case 'Bank Transfer': return <Landmark className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAmountColor = () => {
    if (explanation.type === 'credit') return 'text-green-600 dark:text-green-400';
    if (explanation.type === 'alert') return 'text-orange-600 dark:text-orange-400';
    return 'text-primary';
  };

  return (
    <Card className="mb-4 overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div 
          className="p-5 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                {getIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg leading-tight">
                  {explanation.merchant || 'Unknown Merchant'}
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {source} • {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className={cn("text-lg font-bold font-mono tracking-tight", getAmountColor())}>
              {explanation.type === 'credit' ? '+' : ''}
              {explanation.currency}{explanation.amount.toLocaleString()}
            </div>
          </div>

          {/* Simple Explanation Preview */}
          <div className="mt-4 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
              {explanation.summary}
            </p>
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
              <div className="p-5 space-y-4">
                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Payment Method</span>
                    <span className="font-medium">{explanation.method}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Reference No.</span>
                    <span className="font-mono text-xs">{explanation.referenceNo}</span>
                  </div>
                  {explanation.balance && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-xs mb-1">Updated Balance</span>
                      <span className="font-medium">{explanation.balance}</span>
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

                {/* Privacy Badge */}
                <div className="flex items-center gap-2 justify-center pt-2">
                  <Badge variant="outline" className="bg-background/50 text-[10px] text-muted-foreground font-normal gap-1 hover:bg-background">
                    <Check className="w-3 h-3" /> Processed locally on device
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Indicator */}
        <div 
          className="h-1 bg-muted/50 w-full flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Decorative bar */}
        </div>
      </CardContent>
    </Card>
  );
}
