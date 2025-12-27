import { Transaction, MOCK_TRANSACTIONS, Category } from './mockData';

// Types for our "SLM" response
export interface SLMResponse {
  type: 'answer' | 'chart' | 'error';
  text: string;
  data?: any;
  chartType?: 'bar' | 'pie' | 'line';
}

// Simple heuristic-based "Small Language Model" running locally
export class LocalSLM {
  private transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  async processQuery(query: string): Promise<SLMResponse> {
    const q = query.toLowerCase();

    // simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Category 1: Past spending questions
      if (q.includes('spend') || q.includes('expense') || q.includes('cost')) {
        return this.handleSpendingQuery(q);
      }

      // Category 2: Investment history
      if (q.includes('invest') || q.includes('sip') || q.includes('stock') || q.includes('mutual fund')) {
        return this.handleInvestmentQuery(q);
      }

      // Category 3: Trends
      if (q.includes('trend') || q.includes('why') || q.includes('increase') || q.includes('decrease')) {
        return this.handleTrendQuery(q);
      }

      // Category 4: Explanations
      if (q.includes('what is') || q.includes('mean') || q.includes('explain')) {
        return this.handleExplanationQuery(q);
      }

      // Fallback
      return {
        type: 'answer',
        text: "I can help you understand your transactions, investments, and spending trends. Try asking 'How much did I spend on food?' or 'Show my investments'."
      };
    } catch (error) {
      console.error(error);
      return {
        type: 'error',
        text: "I had trouble processing that request locally. Please try rephrasing."
      };
    }
  }

  private handleSpendingQuery(q: string): SLMResponse {
    // Logic to filter transactions based on query
    let filtered = this.transactions.filter(t => t.explanation.type === 'debit');
    let category: string | null = null;

    // Detect Category
    if (q.includes('food')) { filtered = filtered.filter(t => t.category === 'Food'); category = 'Food'; }
    else if (q.includes('entertainment') || q.includes('movie')) { filtered = filtered.filter(t => t.category === 'Entertainment'); category = 'Entertainment'; }
    else if (q.includes('loan') || q.includes('emi')) { filtered = filtered.filter(t => t.category.includes('EMI')); category = 'EMI'; }
    else if (q.includes('upi')) { filtered = filtered.filter(t => t.explanation.method === 'UPI'); category = 'UPI'; }

    // Detect Timeframe (simple heuristics)
    if (q.includes('last month')) {
       // Mocking date filtering for the prototype using just "all data" or specific mock dates
       // In a real app, this would do actual date math
    }

    const total = filtered.reduce((sum, t) => sum + t.explanation.amount, 0);

    if (category) {
      return {
        type: 'answer',
        text: `You spent ₹${total.toLocaleString('en-IN')} on ${category} based on your recent transactions.`,
        data: filtered
      };
    }

    // "Highest spend" query
    if (q.includes('highest') || q.includes('most')) {
      // Group by category
      const catTotals: Record<string, number> = {};
      filtered.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.explanation.amount;
      });
      const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
      
      return {
        type: 'chart',
        chartType: 'pie',
        text: `Your highest spending category is ${topCat[0]} with ₹${topCat[1].toLocaleString('en-IN')}.`,
        data: Object.entries(catTotals).map(([name, value]) => ({ name, value }))
      };
    }

    return {
      type: 'answer',
      text: `Your total spending in the analyzed period is ₹${total.toLocaleString('en-IN')}.`
    };
  }

  private handleInvestmentQuery(q: string): SLMResponse {
    const investments = this.transactions.filter(t => t.category === 'Investment');
    const total = investments.reduce((sum, t) => sum + t.explanation.amount, 0);

    if (q.includes('sip')) {
      const sips = investments.filter(t => t.investmentType === 'SIP');
      const sipTotal = sips.reduce((sum, t) => sum + t.explanation.amount, 0);
      return {
        type: 'answer',
        text: `You have made SIP payments totaling ₹${sipTotal.toLocaleString('en-IN')} recently.`
      };
    }

    return {
      type: 'answer',
      text: `You have invested a total of ₹${total.toLocaleString('en-IN')} in this period across SIPs, Stocks, and other instruments.`
    };
  }

  private handleTrendQuery(q: string): SLMResponse {
    if (q.includes('increase') || q.includes('march')) {
      return {
        type: 'answer',
        text: "Spending increased recently mainly due to higher EMI debits and one-time annual insurance payments found in your SMS logs."
      };
    }
    return {
      type: 'answer',
      text: "Your spending trend shows a consistent pattern with spikes around the 5th of each month due to bill payments."
    };
  }

  private handleExplanationQuery(q: string): SLMResponse {
    if (q.includes('investment-related')) {
      return {
        type: 'answer',
        text: "'Investment-related' transactions include debits to mutual funds, stock brokers (like Zerodha, Groww), and government schemes like PPF/NPS."
      };
    }
    return {
      type: 'answer',
      text: "I can explain categories, transaction types, or specific terms found in your messages."
    };
  }
}

export const slm = new LocalSLM(MOCK_TRANSACTIONS);
