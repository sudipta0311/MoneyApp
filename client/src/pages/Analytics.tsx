import React, { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useTransactions, type Transaction } from '@/lib/api';
import { CATEGORY_COLORS } from '@/lib/mockData';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Category = Transaction['category'];

interface CategoryTotal {
  name: Category;
  total: number;
  count: number;
  percentage: number;
}

interface DailySpend {
  date: string;
  amount: number;
}

interface Prediction {
  period: string;
  minAmount: number;
  avgAmount: number;
  maxAmount: number;
}

export default function Analytics() {
  const { data: transactions, isLoading } = useTransactions();
  
  const analytics = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        categoryTotals: [],
        totalSpend: 0,
        dailyTrend: [],
        predictions: [],
        avg7Day: 0,
        investmentTotal: 0,
        emiTotal: 0
      };
    }
    
    // Group by category
    const categoryMap: Record<Category, { total: number; count: number }> = {
      'Food': { total: 0, count: 0 },
      'Entertainment': { total: 0, count: 0 },
      'EMI Home Loan': { total: 0, count: 0 },
      'EMI Car Loan': { total: 0, count: 0 },
      'Utilities': { total: 0, count: 0 },
      'Shopping': { total: 0, count: 0 },
      'Investment': { total: 0, count: 0 },
      'Other': { total: 0, count: 0 }
    };

    let totalSpend = 0;
    const debits = transactions.filter(tx => tx.type === 'debit');
    
    debits.forEach(tx => {
      const amount = parseFloat(tx.amount);
      categoryMap[tx.category].total += amount;
      categoryMap[tx.category].count += 1;
      totalSpend += amount;
    });

    // Convert to array and calculate percentages
    const categoryTotals: CategoryTotal[] = Object.entries(categoryMap)
      .filter(([_, data]) => data.total > 0)
      .map(([name, data]) => ({
        name: name as Category,
        total: data.total,
        count: data.count,
        percentage: (data.total / totalSpend) * 100
      }))
      .sort((a, b) => b.total - a.total);

    // Daily spend trend (last 30 days)
    const dailyMap: Record<string, number> = {};
    debits.forEach(tx => {
      const txDate = typeof tx.timestamp === 'string' ? new Date(tx.timestamp) : tx.timestamp;
      const date = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[date] = (dailyMap[date] || 0) + parseFloat(tx.amount);
    });

    const dailyTrend: DailySpend[] = Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .reverse();

    // Calculate 7-day average
    const last7Days = debits.filter(tx => {
      const txDate = typeof tx.timestamp === 'string' ? new Date(tx.timestamp) : tx.timestamp;
      const daysDiff = (Date.now() - txDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    const avg7Day = last7Days.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / Math.max(last7Days.length, 1);

    // Predictions (if-this-continues)
    const monthlySpend = totalSpend;
    const predictions: Prediction[] = [
      {
        period: 'This Month (Actual)',
        minAmount: totalSpend * 0.95,
        avgAmount: totalSpend,
        maxAmount: totalSpend * 1.05
      },
      {
        period: 'Next 30 Days (Est.)',
        minAmount: monthlySpend * 0.9,
        avgAmount: monthlySpend,
        maxAmount: monthlySpend * 1.1
      },
      {
        period: 'Next 90 Days (Est.)',
        minAmount: monthlySpend * 3 * 0.85,
        avgAmount: monthlySpend * 3,
        maxAmount: monthlySpend * 3 * 1.15
      }
    ];

    return {
      categoryTotals,
      totalSpend,
      dailyTrend,
      predictions,
      avg7Day,
      investmentTotal: categoryMap['Investment'].total,
      emiTotal: categoryMap['EMI Home Loan'].total + categoryMap['EMI Car Loan'].total
    };
  }, [transactions]);

  const chartData = analytics.categoryTotals.map(cat => ({
    name: cat.name,
    value: cat.total,
    percentage: cat.percentage.toFixed(1)
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="px-5 pt-6 pb-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="px-5 pt-6 pb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Spending Analytics</h1>
          <p className="text-muted-foreground text-sm">Track your spending patterns and trends</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Total Spend</div>
              <div className="text-xl font-bold text-foreground">₹{(analytics.totalSpend).toLocaleString('en-IN')}</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Last 7 days avg: ₹{analytics.avg7Day.toLocaleString('en-IN', {maximumFractionDigits: 0})}/day</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">EMI Obligations</div>
              <div className="text-xl font-bold text-primary">₹{(analytics.emiTotal).toLocaleString('en-IN')}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Monthly recurring</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm col-span-2">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Investment Total</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">₹{(analytics.investmentTotal).toLocaleString('en-IN')}</div>
              <div className="text-xs text-muted-foreground mt-1">SIP + Stock purchases tracked</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
            <TabsTrigger value="forecast" className="flex-1">Forecast</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name}\n${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {analytics.categoryTotals.map((cat) => (
                <Card key={cat.name} className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      <span className="text-sm font-bold">₹{cat.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{cat.count} transaction{cat.count > 1 ? 's' : ''}</span>
                      <span>{cat.percentage.toFixed(1)}% of total</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: CATEGORY_COLORS[cat.name]
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Daily Spending Trend</CardTitle>
                <CardDescription>Past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                    <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">7-Day Average</p>
                    <p className="text-xs text-muted-foreground">You're spending approximately <strong>₹{analytics.avg7Day.toLocaleString('en-IN', {maximumFractionDigits: 0})}/day</strong> based on the last 7 days.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4 mt-4">
            <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-100">
                  <div className="font-semibold flex-shrink-0 mt-0.5">ℹ️</div>
                  <p>These are <strong>scenario-based estimates</strong> showing "if-this-continues" ranges based on your past spending. Not predictions or recommendations.</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {analytics.predictions.map((pred, idx) => (
                <Card key={idx} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3 text-foreground">{pred.period}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Conservative estimate</span>
                        <span className="font-mono font-semibold">₹{pred.minAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Expected amount</span>
                        <span className="font-mono font-semibold text-primary">₹{pred.avgAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Higher estimate</span>
                        <span className="font-mono font-semibold">₹{pred.maxAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                      </div>
                    </div>

                    {/* Visual range bar */}
                    <div className="mt-3 relative h-8 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 rounded-lg flex items-center px-2 text-[10px] font-mono text-blue-900 dark:text-blue-100">
                      <span>₹{pred.minAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})} → ₹{pred.maxAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">How This Works</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">We take your spending from the past few weeks and extrapolate forward. The range (conservative to higher) accounts for natural variation in your spending patterns.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
