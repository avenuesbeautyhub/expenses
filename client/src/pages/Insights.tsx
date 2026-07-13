import React, { useEffect, useState } from 'react';
import { insightsAPI } from '../services/api';
import { Lightbulb, AlertTriangle, TrendingUp, DollarSign, PiggyBank, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Insights: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadInsights();
  }, [period]);

  const loadInsights = async () => {
    try {
      const response = await insightsAPI.getInsights({ period });
      setData(response.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Insights</h1>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{data.summary.totalExpense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{data.summary.totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <PiggyBank className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Budgets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.budgetCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={24} />
            Warnings
          </h2>
          {data.warnings.map((warning: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                warning.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}
            >
              <p className="text-gray-900 dark:text-white">{warning.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-600" size={24} />
            Insights
          </h2>
          {data.insights.map((insight: any, index: number) => (
            <div key={index} className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <p className="text-gray-900 dark:text-white">{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-green-600" size={24} />
            Recommendations
          </h2>
          {data.recommendations.map((recommendation: any, index: number) => (
            <div key={index} className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <p className="text-gray-900 dark:text-white">{recommendation.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top Spending Categories */}
      {data.topCategories && data.topCategories.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Spending Categories</h2>
          <div className="space-y-4">
            {data.topCategories.map(([category, amount]: [string, number], index: number) => {
              const percentage = (amount / data.summary.totalExpense) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 dark:text-white font-medium">{category}</span>
                    <span className="text-gray-900 dark:text-white">
                      {currencySymbol}{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {data.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Category Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(data.categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-900 dark:text-white">{category}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currencySymbol}{Number(amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
