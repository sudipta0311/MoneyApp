import { storage } from '../server/storage';
import { MOCK_TRANSACTIONS } from '../client/src/lib/mockData';

async function seed() {
  console.log('Seeding database with mock transactions...');
  
  try {
    // Insert all mock transactions
    for (const mockTx of MOCK_TRANSACTIONS) {
      await storage.createTransaction({
        rawMessage: mockTx.rawMessage,
        source: mockTx.source,
        timestamp: mockTx.timestamp,
        category: mockTx.category,
        investmentType: mockTx.investmentType || null,
        summary: mockTx.explanation.summary,
        amount: mockTx.explanation.amount.toString(),
        currency: mockTx.explanation.currency,
        type: mockTx.explanation.type,
        merchant: mockTx.explanation.merchant || null,
        method: mockTx.explanation.method || null,
        referenceNo: mockTx.explanation.referenceNo || null,
        balance: mockTx.explanation.balance || null,
      });
    }
    
    console.log(`Successfully seeded ${MOCK_TRANSACTIONS.length} transactions!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
