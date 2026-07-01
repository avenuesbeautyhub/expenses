import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { ReportData, MonthlyTrend } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [useCustomRange, setUseCustomRange] = useState(false);
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadReportData();
    loadMonthlyTrend();
  }, [selectedPeriod, useCustomRange, customRange]);

  const loadReportData = async () => {
    try {
      let params: any = { type: selectedPeriod };
      if (useCustomRange && customRange.startDate && customRange.endDate) {
        params = {
          startDate: customRange.startDate,
          endDate: customRange.endDate
        };
      }
      const response = await analyticsAPI.getReports(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyTrend = async () => {
    try {
      const response = await analyticsAPI.getMonthlyTrend();
      setMonthlyTrend(response.data);
    } catch (error) {
      console.error('Failed to load monthly trend:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={useCustomRange}
              onChange={(e) => setUseCustomRange(e.target.checked)}
              className="rounded"
            />
            Custom Range
          </label>
          {useCustomRange && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customRange.startDate}
                onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                className="input"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customRange.endDate}
                onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                className="input"
              />
            </div>
          )}
          {!useCustomRange && (
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input w-48"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}
        </div>
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Income</h3>
              <p className="text-3xl font-bold text-green-600">{currencySymbol}{reportData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Expenses</h3>
              <p className="text-3xl font-bold text-red-600">{currencySymbol}{reportData.totalExpense.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Net Savings</h3>
              <p className={`text-3xl font-bold ${reportData.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencySymbol}{reportData.savings.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Category Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(reportData.categoryBreakdown).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">{category}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{currencySymbol}{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {reportData.highestExpense && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Highest Expense</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{reportData.highestExpense.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{reportData.highestExpense.category}</p>
                </div>
                <p className="text-xl font-bold text-red-600">{currencySymbol}{reportData.highestExpense.amount.toLocaleString()}</p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Monthly Trend</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expenses" />
            <Line type="monotone" dataKey="savings" stroke="#0ea5e9" name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;
