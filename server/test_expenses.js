import { connectDatabase } from './config/db.js';
import { getExpensesByUser, getTotalExpenses, getCategoryTotals, getMonthlyTotals } from './models/expenseModel.js';

const main = async () => {
  await connectDatabase();
  const expenses = await getExpensesByUser({ userId: 8, limit: 20, offset: 0 });
  console.log('expenses', expenses);
  console.log('total', await getTotalExpenses(8));
  console.log('categories', await getCategoryTotals(8));
  console.log('monthly', await getMonthlyTotals(8, 6));
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
