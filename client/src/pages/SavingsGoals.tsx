import React, { useEffect, useState } from 'react';
import { savingsGoalAPI } from '../services/api';
import { SavingsGoal } from '../types';
import { Plus, Edit2, Trash2, Target, TrendingUp, Calendar, CheckCircle, PauseCircle, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';
import Modal from '../components/Modal';

const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const currencySymbol = getCurrencySymbol(user?.currency);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await savingsGoalAPI.getSavingsGoals({ limit: 100 });
      setGoals(response.data.goals || response.data);
    } catch (error) {
      console.error('Failed to load savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const filteredGoals = goals.filter(goal => {
    if (filterStatus === 'all') return true;
    return goal.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'paused':
        return <PauseCircle size={14} />;
      default:
        return null;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await savingsGoalAPI.deleteSavingsGoal(id);
        loadGoals();
      } catch (error) {
        console.error('Failed to delete savings goal:', error);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Target</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{goals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CheckCircle className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {goals.filter(g => g.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'active'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'completed'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilterStatus('paused')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'paused'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Paused
        </button>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Target size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No savings goals yet</p>
          <p className="text-sm">Create your first savings goal to start tracking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysRemaining = calculateDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;

            return (
              <div key={goal._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{goal.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(goal.status)}`}>
                    {getStatusIcon(goal.status)}
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {currencySymbol}{goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {currencySymbol}{goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progress >= 100 ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{progress.toFixed(1)}% complete</p>
                </div>

                {/* Target Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar size={16} />
                  <span>
                    {isOverdue
                      ? `Overdue by ${Math.abs(daysRemaining)} days`
                      : daysRemaining === 0
                      ? 'Due today'
                      : `${daysRemaining} days remaining`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {goal.status === 'active' && (
                    <button
                      onClick={() => {
                        setContributingGoal(goal);
                        setShowContributeModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Add Money
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false);
            setEditingGoal(null);
          }}
          onSave={() => {
            loadGoals();
            setShowModal(false);
            setEditingGoal(null);
          }}
        />
      )}

      {/* Contribute Modal */}
      {showContributeModal && contributingGoal && (
        <ContributeModal
          goal={contributingGoal}
          onClose={() => {
            setShowContributeModal(false);
            setContributingGoal(null);
          }}
          onSave={() => {
            loadGoals();
            setShowContributeModal(false);
            setContributingGoal(null);
          }}
        />
      )}
    </div>
  );
};

const GoalModal: React.FC<{
  goal: SavingsGoal | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ goal, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    targetAmount: goal?.targetAmount || 0,
    currentAmount: goal?.currentAmount || 0,
    category: goal?.category || '',
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
    status: goal?.status || 'active',
    description: goal?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        description: formData.description || undefined,
      };

      if (goal) {
        await savingsGoalAPI.updateSavingsGoal(goal._id, dataToSubmit);
      } else {
        await savingsGoalAPI.createSavingsGoal(dataToSubmit);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save savings goal:', error);
    }
  };

  return (
    <Modal onClose={onClose} title={goal ? 'Edit Savings Goal' : 'Add Savings Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="label">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input"
            required
            placeholder="e.g., Emergency Fund, Vacation, New Car"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Target Amount</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
              className="input"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="label">Current Amount</label>
            <input
              type="number"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div>
          <label className="label">Target Date</label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'completed' | 'paused' })}
            className="input"
            required
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="label">Description (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows={3}
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button type="submit" className="flex-1 btn-primary">
            {goal ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ContributeModal: React.FC<{
  goal: SavingsGoal;
  onClose: () => void;
  onSave: () => void;
}> = ({ goal, onClose, onSave }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savingsGoalAPI.addContribution(goal._id, { amount: parseFloat(amount) });
      onSave();
    } catch (error) {
      console.error('Failed to add contribution:', error);
    }
  };

  const currencySymbol = getCurrencySymbol(localStorage.getItem('currency') || 'INR');

  return (
    <Modal onClose={onClose} title={`Add to ${goal.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Contribution Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input pl-8"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Current: {currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}
            {goal.targetAmount.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button type="submit" className="flex-1 btn-primary">
            Add Contribution
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SavingsGoals;
