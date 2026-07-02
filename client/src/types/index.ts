export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  language: string;
  token?: string;
}

export interface Expense {
  _id: string;
  user: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  receipt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  _id: string;
  user: string;
  title: string;
  amount: number;
  source: string;
  date: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  user: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  isExceeded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  _id: string;
  user: string;
  title: string;
  amount: number;
  type: 'borrow' | 'lend';
  personName: string;
  date: string;
  dueDate?: string;
  status: 'pending' | 'partially_returned' | 'returned';
  returnedAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
  monthlySpending: number;
  categoryBreakdown: Record<string, number>;
  recentTransactions: Array<Expense | Income & { type: 'expense' | 'income' }>;
}

export interface ReportData {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalIncome: number;
  totalExpense: number;
  savings: number;
  categoryBreakdown: Record<string, number>;
  highestExpense: Expense | null;
  lowestExpense: Expense | null;
}

export interface MonthlyTrend {
  month: number;
  monthName: string;
  income: number;
  expense: number;
  savings: number;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Grocery',
  'Fuel',
  'Rent',
  'Shopping',
  'Entertainment',
  'Medical',
  'Education',
  'EMI',
  'Bills',
  'Travel',
  'Insurance',
  'Gifts',
  'Investment',
  'Others',
] as const;

export const INCOME_SOURCES = [
  'Salary',
  'Business',
  'Freelance',
  'Bonus',
  'Investment',
  'Others',
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Wallet',
  'Others',
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
] as const;
