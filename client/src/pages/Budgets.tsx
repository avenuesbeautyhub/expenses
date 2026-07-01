import React, { useEffect, useState } from 'react';
import { budgetAPI } from '../services/api';
import { Budget, EXPENSE_CATEGORIES } from '../types';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const response = await budgetAPI.getBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.deleteBudget(id);
        loadBudgets();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <button
          onClick={() => {
            setEditingBudget(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div key={budget._id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{budget.category}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBudget(budget);
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(budget._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Budget</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currencySymbol}{budget.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Spent</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currencySymbol}{(budget.spent || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                <span
                  className={`font-semibold ${
                    (budget.remaining || 0) < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {currencySymbol}{(budget.remaining || 0).toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className={`h-2.5 rounded-full ${
                      (budget.percentage || 0) > 100
                        ? 'bg-red-600'
                        : (budget.percentage || 0) > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {budget.percentage?.toFixed(1)}% used
                </p>
              </div>

              {budget.isExceeded && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle size={16} />
                  <span>Budget exceeded!</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => {
            setShowModal(false);
            setEditingBudget(null);
          }}
          onSave={() => {
            loadBudgets();
            setShowModal(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
};

const BudgetModal: React.FC<{
  budget: Budget | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ budget, onClose, onSave }) => {
  const now = new Date();
  const [formData, setFormData] = useState({
    category: budget?.category || EXPENSE_CATEGORIES[0],
    amount: budget?.amount || 0,
    month: budget?.month || now.getMonth() + 1,
    year: budget?.year || now.getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (budget) {
        await budgetAPI.updateBudget(budget._id, formData);
      } else {
        await budgetAPI.createBudget(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {budget ? 'Edit Budget' : 'Add Budget'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              <label className="label">Month</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="input"
                required
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="input"
                required
                min="2020"
                max="2100"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {budget ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Budgets;
