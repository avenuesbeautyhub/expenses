import React, { useEffect, useState } from 'react';
import { analyticsAPI, debtAPI, savingsGoalAPI } from '../services/api';
import { DashboardData } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ArrowDownCircle, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  const [debtSummary, setDebtSummary] = useState({ borrowed: 0, lent: 0, net: 0 });
  const [savingsSummary, setSavingsSummary] = useState({ totalTarget: 0, totalSaved: 0, completed: 0 });
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadDashboardData();
    loadDebtSummary();
    loadSavingsSummary();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard({ period });
      setData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDebtSummary = async () => {
    try {
      const response = await debtAPI.getDebts({ limit: 100 });
      const debts = response.data.debts || response.data;

      let borrowed = 0;
      let borrowedReturned = 0;
      let lent = 0;
      let lentReceived = 0;

      debts.forEach((debt: any) => {
        if (debt.type === 'borrow') {
          // If status is returned, this is a repayment entry (legacy data)
          if (debt.status === 'returned') {
            borrowedReturned += debt.amount;
          } else {
            // This is an actual borrow entry
            borrowed += debt.amount;
            // Use returnedAmount if available
            if (debt.returnedAmount > 0) {
              borrowedReturned += debt.returnedAmount;
            }
          }
        } else if (debt.type === 'lend') {
          // If status is returned, this is a repayment entry (legacy data)
          if (debt.status === 'returned') {
            lentReceived += debt.amount;
          } else {
            // This is an actual lend entry
            lent += debt.amount;
            // Use returnedAmount if available
            if (debt.returnedAmount > 0) {
              lentReceived += debt.returnedAmount;
            }
          }
        } else if (debt.type === 'return') {
          // New return type entry - add as repayment for borrowed money
          borrowedReturned += debt.amount;
        }
      });

      // Net: (owed to you) - (you owe)
      // Owed to you = lent - lentReceived (money they borrowed - money they returned)
      // You owe = borrowed - borrowedReturned (money you borrowed - money you returned)
      const owedToYou = lent - lentReceived;
      const youOwe = borrowed - borrowedReturned;
      const net = owedToYou - youOwe;

      setDebtSummary({ borrowed: youOwe, lent: owedToYou, net });
    } catch (error) {
      console.error('Failed to load debt summary:', error);
    }
  };

  const loadSavingsSummary = async () => {
    try {
      const response = await savingsGoalAPI.getSavingsGoals({ limit: 100 });
      const goals = response.data.goals || response.data;

      const totalTarget = goals.reduce((sum: number, g: any) => sum + g.targetAmount, 0);
      const totalSaved = goals.reduce((sum: number, g: any) => sum + g.currentAmount, 0);
      const completed = goals.filter((g: any) => g.status === 'completed').length;

      setSavingsSummary({ totalTarget, totalSaved, completed });
    } catch (error) {
      console.error('Failed to load savings summary:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const categoryData = Object.entries(data.categoryBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const StatCard = ({ title, value, icon: Icon, trend, isPositive }: any) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{currencySymbol}{value.toLocaleString()}</p>
          {trend && (
            <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={isPositive ? 'text-green-600' : 'text-red-600'} size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'year'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={data.totalBalance}
          icon={Wallet}
          isPositive={data.totalBalance >= 0}
        />
        <StatCard
          title="Total Income"
          value={data.totalIncome}
          icon={ArrowUpRight}
          isPositive={true}
        />
        <StatCard
          title="Total Expenses"
          value={data.totalExpense}
          icon={ArrowDownRight}
          isPositive={false}
        />
        <StatCard
          title="Savings"
          value={data.savings}
          icon={DollarSign}
          isPositive={data.savings >= 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">You Owe</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{currencySymbol}{debtSummary.borrowed.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <ArrowDownCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Owed to You</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{currencySymbol}{debtSummary.lent.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <ArrowUpRight className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Debt</p>
              <p className={`text-2xl font-bold mt-1 ${debtSummary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencySymbol}{debtSummary.net.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${debtSummary.net >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <ArrowDownCircle className={debtSummary.net >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Savings Target</p>
              <p className="text-2xl font-bold mt-1">{currencySymbol}{savingsSummary.totalTarget.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{currencySymbol}{savingsSummary.totalSaved.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</p>
              <p className="text-2xl font-bold mt-1">{savingsSummary.completed}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Target className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Expense by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${currencySymbol}${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: 'This Month', Income: data.totalIncome, Expenses: data.totalExpense }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" />
              <Bar dataKey="Expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h2>
        <div className="space-y-3">
          {data.recentTransactions.slice(0, 5).map((transaction: any) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="text-green-600" size={20} />
                  ) : (
                    <TrendingDown className="text-red-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.type === 'expense' ? transaction.category : transaction.source}
                  </p>
                </div>
              </div>
              <p
                className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
