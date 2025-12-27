export interface Transaction {
  id: string;
  rawMessage: string;
  source: 'SMS' | 'Email';
  timestamp: Date;
  explanation: {
    summary: string;
    amount: number;
    currency: string;
    type: 'debit' | 'credit' | 'alert';
    merchant?: string;
    method?: string; // UPI, Card, NEFT
    referenceNo?: string;
    balance?: string;
  };
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    rawMessage: 'Acct XX8901 debited by Rs. 450.00 on 27-Dec-24. Info: UPI/3456789012/Starbucks. Avl Bal: Rs 12,450.50.',
    explanation: {
      summary: 'You paid ₹450 using UPI to Starbucks.',
      amount: 450.00,
      currency: '₹',
      type: 'debit',
      merchant: 'Starbucks',
      method: 'UPI',
      referenceNo: '3456789012',
      balance: '₹12,450.50'
    }
  },
  {
    id: 'tx-2',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    rawMessage: 'A/c 8901 credited with Rs. 25,000.00 on 27-Dec-24 via NEFT-HDFC0001234. Ref: SALARY DEC 2025. Bal: Rs 37,900.50.',
    explanation: {
      summary: 'You received ₹25,000 via bank transfer as salary.',
      amount: 25000.00,
      currency: '₹',
      type: 'credit',
      merchant: 'Employer (NEFT)',
      method: 'Bank Transfer',
      referenceNo: 'SALARY DEC 2025',
      balance: '₹37,900.50'
    }
  },
  {
    id: 'tx-3',
    source: 'Email',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    rawMessage: 'Dear Customer, txn of USD 12.99 was done on Credit Card XX4455 at NETFLIX.COM. If not done by you, call 1800-123-456.',
    explanation: {
      summary: 'You paid $12.99 using your credit card to Netflix.',
      amount: 12.99,
      currency: '$',
      type: 'debit',
      merchant: 'Netflix',
      method: 'Credit Card',
      referenceNo: 'XX4455'
    }
  },
  {
    id: 'tx-4',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    rawMessage: 'OTP for txn of Rs 1,200.00 at AMAZON RETAIL is 456789. Do not share this OTP with anyone.',
    explanation: {
      summary: 'You initiated a payment of ₹1,200 at Amazon. An OTP was sent to confirm this payment.',
      amount: 1200.00,
      currency: '₹',
      type: 'alert',
      merchant: 'Amazon',
      method: 'OTP Required',
      referenceNo: '456789'
    }
  }
];
