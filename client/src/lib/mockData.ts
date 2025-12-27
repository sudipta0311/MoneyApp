export interface Transaction {
  id: string;
  rawMessage: string;
  source: 'SMS' | 'Email';
  timestamp: Date;
  category: 'Food' | 'Entertainment' | 'EMI Home Loan' | 'EMI Car Loan' | 'Utilities' | 'Shopping' | 'Investment' | 'Other';
  explanation: {
    summary: string;
    amount: number;
    currency: string;
    type: 'debit' | 'credit' | 'alert';
    merchant?: string;
    method?: string;
    referenceNo?: string;
    balance?: string;
  };
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    category: 'Food',
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
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    category: 'EMI Home Loan',
    rawMessage: 'A/c 8901 debited with Rs. 50,000.00 on 27-Dec-24 via Auto-Debit. Ref: EMI-JAN-2025. Bal: Rs 37,900.50.',
    explanation: {
      summary: 'Your home loan EMI of ₹50,000 was debited automatically.',
      amount: 50000.00,
      currency: '₹',
      type: 'debit',
      merchant: 'HDFC Home Loan',
      method: 'Auto-Debit',
      referenceNo: 'EMI-JAN-2025',
      balance: '₹37,900.50'
    }
  },
  {
    id: 'tx-3',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    category: 'Investment',
    rawMessage: 'SIP of Rs 5,000 debited for mutual fund ICICIPRUMF. Ref: SIP-122024. NAV: Rs 45.23',
    explanation: {
      summary: 'Your monthly SIP of ₹5,000 for mutual fund was processed.',
      amount: 5000.00,
      currency: '₹',
      type: 'debit',
      merchant: 'ICICI Prudential MF',
      method: 'SIP',
      referenceNo: 'SIP-122024'
    }
  },
  {
    id: 'tx-4',
    source: 'Email',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    category: 'Entertainment',
    rawMessage: 'Dear Customer, txn of USD 12.99 was done on Credit Card XX4455 at NETFLIX.COM.',
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
    id: 'tx-5',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    category: 'Shopping',
    rawMessage: 'Debit Card XX2234 debited by Rs 3,500 at AMAZON RETAIL. Ref: AMZ-2024. Available Bal: Rs 45,000',
    explanation: {
      summary: 'You paid ₹3,500 via debit card for Amazon shopping.',
      amount: 3500.00,
      currency: '₹',
      type: 'debit',
      merchant: 'Amazon',
      method: 'Debit Card',
      referenceNo: 'AMZ-2024'
    }
  },
  {
    id: 'tx-6',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    category: 'Food',
    rawMessage: 'Sent Rs. 850.00 to Zomato via UPI-556677. Ref: LUNCH-27122024.',
    explanation: {
      summary: 'You paid ₹850 using UPI to Zomato.',
      amount: 850.00,
      currency: '₹',
      type: 'debit',
      merchant: 'Zomato',
      method: 'UPI',
      referenceNo: 'LUNCH-27122024'
    }
  },
  {
    id: 'tx-7',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    category: 'Utilities',
    rawMessage: 'Electricity bill of Rs 2,450 paid successfully for Account 123456789. Ref: ELEC-DEC24.',
    explanation: {
      summary: 'Your electricity bill of ₹2,450 was paid.',
      amount: 2450.00,
      currency: '₹',
      type: 'debit',
      merchant: 'Power Distribution',
      method: 'Online Payment',
      referenceNo: 'ELEC-DEC24'
    }
  },
  {
    id: 'tx-8',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
    category: 'EMI Car Loan',
    rawMessage: 'A/c 8901 debited with Rs. 25,000.00 on 23-Dec-24 via Auto-Debit. Ref: CAR-EMI-DEC24. Bal: Rs 50,000',
    explanation: {
      summary: 'Your car loan EMI of ₹25,000 was debited automatically.',
      amount: 25000.00,
      currency: '₹',
      type: 'debit',
      merchant: 'ICICI Bank Car Loan',
      method: 'Auto-Debit',
      referenceNo: 'CAR-EMI-DEC24'
    }
  },
  {
    id: 'tx-9',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144),
    category: 'Food',
    rawMessage: 'Sent Rs. 1200.00 to Swiggy via UPI-778899. Ref: DINNER-20122024.',
    explanation: {
      summary: 'You paid ₹1,200 using UPI to Swiggy.',
      amount: 1200.00,
      currency: '₹',
      type: 'debit',
      merchant: 'Swiggy',
      method: 'UPI',
      referenceNo: 'DINNER-20122024'
    }
  },
  {
    id: 'tx-10',
    source: 'SMS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168),
    category: 'Investment',
    rawMessage: 'Stock purchase of 10 shares at Rs 2,450 each. Total: Rs 24,500. Broker: ICICI Direct.',
    explanation: {
      summary: 'You purchased stocks worth ₹24,500.',
      amount: 24500.00,
      currency: '₹',
      type: 'debit',
      merchant: 'ICICI Direct',
      method: 'Stock Purchase',
      referenceNo: 'STK-20122024'
    }
  }
];

export type Category = 'Food' | 'Entertainment' | 'EMI Home Loan' | 'EMI Car Loan' | 'Utilities' | 'Shopping' | 'Investment' | 'Other';

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food': '#3B82F6',
  'Entertainment': '#8B5CF6',
  'EMI Home Loan': '#EF4444',
  'EMI Car Loan': '#F97316',
  'Utilities': '#14B8A6',
  'Shopping': '#EC4899',
  'Investment': '#10B981',
  'Other': '#6B7280'
};
