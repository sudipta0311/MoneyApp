import React, { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useTransactions, type Transaction } from '@/lib/api';
import { INVESTMENT_COLORS } from '@/lib/mockData';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type InvestmentType = NonNullable<Transaction['investmentType']>;

interface InvestmentTotal {
  type: InvestmentType;
  total: number;
  count: number;
  percentage: number;
}

interface MonthlyInvestment {
  month: string;
  amount: number;
}

export default function Investments() {
  const { data: transactions, isLoading } = useTransactions();
  
  const investmentData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        investmentTotals: [],
        totalInvestment: 0,
        monthlyTrend: [],
        avgMonthlyInvestment: 0,
        investments: [],
        sipTotal: 0,
        sipCount: 0,
        avgMonthlySIP: 0
      };
    }
    
    const investments = transactions.filter(tx => tx.category === 'Investment');

    // Group by investment type
    const investmentMap: Record<InvestmentType, { total: number; count: number }> = {
      'SIP': { total: 0, count: 0 },
      'Mutual Fund': { total: 0, count: 0 },
      'Stocks': { total: 0, count: 0 },
      'PPF': { total: 0, count: 0 },
      'NPS': { total: 0, count: 0 },
      'Bonds': { total: 0, count: 0 },
      'Other': { total: 0, count: 0 }
    };

    let totalInvestment = 0;

    investments.forEach(inv => {
      const type = inv.investmentType || 'Other';
      const amount = parseFloat(inv.amount);
      investmentMap[type].total += amount;
      investmentMap[type].count += 1;
      totalInvestment += amount;
    });

    // Convert to array and calculate percentages
    const investmentTotals: InvestmentTotal[] = Object.entries(investmentMap)
      .filter(([_, data]) => data.total > 0)
      .map(([type, data]) => ({
        type: type as InvestmentType,
        total: data.total,
        count: data.count,
        percentage: (data.total / totalInvestment) * 100
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly investment trend
    const monthlyMap: Record<string, number> = {};
    investments.forEach(inv => {
      const txDate = typeof inv.timestamp === 'string' ? new Date(inv.timestamp) : inv.timestamp;
      const date = txDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[date] = (monthlyMap[date] || 0) + parseFloat(inv.amount);
    });

    const monthlyTrend: MonthlyInvestment[] = Object.entries(monthlyMap)
      .map(([month, amount]) => ({ month, amount }))
      .reverse();

    // Calculate average monthly investment
    const avgMonthlyInvestment = monthlyTrend.length > 0 
      ? monthlyTrend.reduce((sum, m) => sum + m.amount, 0) / monthlyTrend.length 
      : 0;

    // SIP calculation
    const sipTransactions = investments.filter(inv => inv.investmentType === 'SIP');
    const sipTotal = sipTransactions.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    const sipCount = sipTransactions.length;
    const avgMonthlySIP = sipCount > 0 ? sipTotal / sipCount : 0;

    return {
      investmentTotals,
      totalInvestment,
      monthlyTrend,
      avgMonthlyInvestment,
      investments,
      sipTotal,
      sipCount,
      avgMonthlySIP
    };
  }, [transactions]);

  const chartData = investmentData.investmentTotals.map(inv => ({
    name: inv.type,
    value: inv.total,
    percentage: inv.percentage.toFixed(1)
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="px-5 pt-6 pb-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
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
          <h1 className="text-2xl font-bold mb-1">Investment Tracking</h1>
          <p className="text-muted-foreground text-sm">Monitor your investment contributions and patterns</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Total Invested</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                ₹{investmentData.totalInvestment.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {investmentData.investments.length} transactions
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Monthly Avg</div>
              <div className="text-xl font-bold text-primary">
                ₹{investmentData.avgMonthlyInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {investmentData.monthlyTrend.length} months tracked
              </div>
            </CardContent>
          </Card>

          {investmentData.sipCount > 0 && (
            <Card className="border-none shadow-sm col-span-2">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1">Active SIPs</div>
                <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  ₹{investmentData.avgMonthlySIP.toLocaleString('en-IN', {maximumFractionDigits: 0})}/month
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {investmentData.sipCount} SIP transactions recorded
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="breakdown" className="flex-1">Breakdown</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
          </TabsList>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-4 mt-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, percentage }) => `${name}\n${percentage}%`} 
                      outerRadius={80} 
                      fill="#8884d8" 
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={INVESTMENT_COLORS[entry.name as InvestmentType]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {investmentData.investmentTotals.map((inv) => (
                <Card key={inv.type} className="border-none shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{inv.type}</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        ₹{inv.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                      <span>{inv.count} transaction{inv.count > 1 ? 's' : ''}</span>
                      <span>{inv.percentage.toFixed(1)}% of total</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{
                          width: `${inv.percentage}%`,
                          backgroundColor: INVESTMENT_COLORS[inv.type]
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
                <CardTitle className="text-base">Monthly Investment Trend</CardTitle>
                <CardDescription>Past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={investmentData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                    <Bar dataKey="amount" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Your Investment Pattern</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You're investing an average of <strong>₹{investmentData.avgMonthlyInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}/month</strong> across all investment types. This includes SIPs, mutual fund purchases, and direct stock purchases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-950/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-100">
                  <div className="font-semibold flex-shrink-0 mt-0.5">ℹ️</div>
                  <p>This section tracks your investment contributions from SMS/email messages. It shows <strong>what you invested</strong> and <strong>when</strong>, not performance or returns. No recommendations or advice.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Investment Method Breakdown */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Recent Investments</h2>
          <div className="space-y-2">
            {investmentData.investments.map((inv) => (
              <Card key={inv.id} className="border-none shadow-sm">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.investmentType}</p>
                      <p className="text-xs text-muted-foreground">{inv.merchant}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">₹{parseFloat(inv.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {(typeof inv.timestamp === 'string' ? new Date(inv.timestamp) : inv.timestamp).toLocaleDateString('en-IN')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
