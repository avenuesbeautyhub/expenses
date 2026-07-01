import React, { useEffect, useState } from 'react';
import { reminderAPI } from '../services/api';
import { Plus, Edit2, Trash2, Bell, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';

const REMINDER_CATEGORIES = ['Rent', 'EMI', 'Utilities', 'Insurance', 'Subscription', 'Credit Card', 'Loan', 'Others'];

interface Reminder {
  _id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  recurringPeriod?: string;
  isPaid: boolean;
  notes?: string;
}

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadReminders();
    loadUpcomingReminders();
  }, [filterStatus]);

  const loadReminders = async () => {
    try {
      const response = await reminderAPI.getReminders({ status: filterStatus === 'all' ? undefined : filterStatus });
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingReminders = async () => {
    try {
      const response = await reminderAPI.getUpcoming({ days: 7 });
      setUpcomingReminders(response.data);
    } catch (error) {
      console.error('Failed to load upcoming reminders:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await reminderAPI.deleteReminder(id);
        loadReminders();
        loadUpcomingReminders();
      } catch (error) {
        console.error('Failed to delete reminder:', error);
      }
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await reminderAPI.updateReminder(id, { isPaid: true });
      loadReminders();
      loadUpcomingReminders();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (days: number) => {
    if (days < 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-green-600';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bill Reminders</h1>
        <button
          onClick={() => {
            setEditingReminder(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Reminder
        </button>
      </div>

      {upcomingReminders.length > 0 && (
        <div className="card bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Bills (Next 7 Days)</h2>
          </div>
          <div className="space-y-3">
            {upcomingReminders.map((reminder) => {
              const days = getDaysUntilDue(reminder.dueDate);
              return (
                <div key={reminder._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-orange-600" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{reminder.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due in {days} day{days !== 1 ? 's' : ''} • {currencySymbol}{reminder.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkAsPaid(reminder._id)}
                    className="btn btn-primary btn-sm"
                  >
                    Mark as Paid
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Reminders</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No reminders found
            </div>
          ) : (
            reminders.map((reminder) => {
              const days = getDaysUntilDue(reminder.dueDate);
              return (
                <div
                  key={reminder._id}
                  className={`p-4 rounded-lg border ${
                    reminder.isPaid
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {reminder.isPaid ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <Calendar className="text-gray-600 dark:text-gray-400" size={24} />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{reminder.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reminder.category} • {currencySymbol}{reminder.amount.toLocaleString()}
                        </p>
                        <p className={`text-sm ${getDueDateColor(days)}`}>
                          {reminder.isPaid ? 'Paid' : days < 0 ? `Overdue by ${Math.abs(days)} days` : `Due in ${days} days`}
                        </p>
                        {reminder.isRecurring && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Recurring: {reminder.recurringPeriod}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!reminder.isPaid && (
                        <button
                          onClick={() => handleMarkAsPaid(reminder._id)}
                          className="btn btn-primary btn-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingReminder(reminder);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <ReminderModal
          reminder={editingReminder}
          onClose={() => {
            setShowModal(false);
            setEditingReminder(null);
          }}
          onSave={() => {
            loadReminders();
            loadUpcomingReminders();
            setShowModal(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
};

const ReminderModal: React.FC<{
  reminder: Reminder | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ reminder, onClose, onSave }) => {
  const now = new Date();
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    amount: reminder?.amount || 0,
    dueDate: reminder?.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: reminder?.category || 'Rent',
    isRecurring: reminder?.isRecurring || false,
    recurringPeriod: reminder?.recurringPeriod || 'monthly',
    notes: reminder?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (reminder) {
        await reminderAPI.updateReminder(reminder._id, formData);
      } else {
        await reminderAPI.createReminder(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save reminder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {reminder ? 'Edit Reminder' : 'Add Reminder'}
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
                placeholder="e.g., Rent Payment"
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
              <label className="label">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
                required
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
                {REMINDER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isRecurring" className="text-sm text-gray-700 dark:text-gray-300">
                Recurring Bill
              </label>
            </div>
            {formData.isRecurring && (
              <div>
                <label className="label">Recurring Period</label>
                <select
                  value={formData.recurringPeriod}
                  onChange={(e) => setFormData({ ...formData, recurringPeriod: e.target.value })}
                  className="input"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
            <div>
              <label className="label">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
                placeholder="Add any notes..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {reminder ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reminders;
