import React, { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api';
import { Expense, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../types';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async (page = 1) => {
    try {
      const response = await expenseAPI.getExpenses({ page, limit: pagination.limit });
      setExpenses(response.data.expenses || response.data);
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(id);
        loadExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
        <button
          onClick={() => {
            setEditingExpense(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Payment Method
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{expense.title}</p>
                      {expense.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{expense.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {currencySymbol}{expense.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {expense.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadExpenses(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => loadExpenses(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => {
            setShowModal(false);
            setEditingExpense(null);
          }}
          onSave={() => {
            loadExpenses();
            setShowModal(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

const ExpenseModal: React.FC<{
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ expense, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || 0,
    category: expense?.category || EXPENSE_CATEGORIES[0],
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: expense?.paymentMethod || PAYMENT_METHODS[0],
    notes: expense?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (expense) {
        await expenseAPI.updateExpense(expense._id, formData);
      } else {
        await expenseAPI.createExpense(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {expense ? 'Edit Expense' : 'Add Expense'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="input"
                required
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {expense ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Expenses;
