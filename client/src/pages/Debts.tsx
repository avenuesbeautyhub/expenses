import React, { useEffect, useState } from 'react';
import { debtAPI } from '../services/api';
import { Debt } from '../types';
import { Plus, Edit2, Trash2, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currency';
import Modal from '../components/Modal';

const DEBT_TYPES = ['borrow', 'lend'] as const;
const DEBT_STATUSES = ['pending', 'partially_returned', 'returned'] as const;

const Debts: React.FC = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [returningDebt, setReturningDebt] = useState<Debt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [summaryFilter, setSummaryFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async (page = 1) => {
    try {
      const response = await debtAPI.getDebts({ page, limit: 100 }); // Load all debts for accurate summary
      setDebts(response.data.debts || response.data);
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (error) {
      console.error('Failed to load debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        await debtAPI.deleteDebt(id);
        loadDebts();
      } catch (error) {
        console.error('Failed to delete debt:', error);
      }
    }
  };

  const filteredDebts = debts.filter((debt) => {
    const matchesSearch = debt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (debt.notes && debt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filterType || debt.type === filterType;
    const matchesStatus = !filterStatus || debt.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'partially_returned':
        return 'bg-blue-100 text-blue-700';
      case 'returned':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'borrow' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
  };

  // Calculate remaining balance per person
  const getPersonSummary = () => {
    const summary: Record<string, { borrowed: number; borrowedReturned: number; lent: number; lentReceived: number; net: number }> = {};

    debts.forEach(debt => {
      if (!summary[debt.personName]) {
        summary[debt.personName] = { borrowed: 0, borrowedReturned: 0, lent: 0, lentReceived: 0, net: 0 };
      }

      if (debt.type === 'borrow') {
        // If status is returned, this is a repayment entry (legacy data)
        if (debt.status === 'returned') {
          summary[debt.personName].borrowedReturned += debt.amount;
        } else {
          // This is an actual borrow entry
          summary[debt.personName].borrowed += debt.amount;
          // Use returnedAmount if available
          if (debt.returnedAmount > 0) {
            summary[debt.personName].borrowedReturned += debt.returnedAmount;
          }
        }
      } else if (debt.type === 'lend') {
        // If status is returned, this is a repayment entry (legacy data)
        if (debt.status === 'returned') {
          summary[debt.personName].lentReceived += debt.amount;
        } else {
          // This is an actual lend entry
          summary[debt.personName].lent += debt.amount;
          // Use returnedAmount if available
          if (debt.returnedAmount > 0) {
            summary[debt.personName].lentReceived += debt.returnedAmount;
          }
        }
      }

      // Net: (owed to you) - (you owe)
      // Owed to you = lent - lentReceived (money they borrowed - money they returned)
      // You owe = borrowed - borrowedReturned (money you borrowed - money you returned)
      const owedToYou = summary[debt.personName].lent - summary[debt.personName].lentReceived;
      const youOwe = summary[debt.personName].borrowed - summary[debt.personName].borrowedReturned;
      summary[debt.personName].net = owedToYou - youOwe;
    });

    return summary;
  };

  const personSummary = getPersonSummary();

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debts</h1>
        <button
          onClick={() => {
            setEditingDebt(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Debt
        </button>
      </div>

      {/* Person Summary Section */}
      {Object.keys(personSummary).length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Summary by Person</h2>
            <div className="flex gap-2">
              <select
                value={summaryFilter}
                onChange={(e) => setSummaryFilter(e.target.value)}
                className="input text-sm py-1"
              >
                <option value="all">All</option>
                <option value="owing">Owing</option>
                <option value="owed">Owed</option>
                <option value="settled">Settled</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white dark:bg-gray-800">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Person
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Borrowed
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Returned
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Lent
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Received
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Net Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(personSummary)
                  .filter(([_, data]) => {
                    if (summaryFilter === 'owing') return data.net < 0;
                    if (summaryFilter === 'owed') return data.net > 0;
                    if (summaryFilter === 'settled') return data.net === 0;
                    return true;
                  })
                  .map(([personName, data]) => (
                    <tr key={personName} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {personName}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {currencySymbol}{data.borrowed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600">
                        {currencySymbol}{data.borrowedReturned.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600">
                        {currencySymbol}{data.lent.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-purple-600">
                        {currencySymbol}{data.lentReceived.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.net >= 0 ? '+' : ''}{currencySymbol}{data.net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search debts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 py-3 text-lg"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input"
          >
            <option value="">All Types</option>
            {DEBT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            {DEBT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Person
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Returned
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Remaining
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map((debt) => (
                <tr key={debt._id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{debt.title}</p>
                      {debt.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{debt.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${debt.status === 'returned' ? 'bg-green-100 text-green-700' : getTypeColor(debt.type)}`}>
                      {debt.status === 'returned' ? (
                        <span className="flex items-center gap-1">
                          <ArrowUpCircle size={14} />
                          Repayment
                        </span>
                      ) : debt.type === 'borrow' ? (
                        <span className="flex items-center gap-1">
                          <ArrowDownCircle size={14} />
                          Borrow
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ArrowDownCircle size={14} />
                          Lend
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {debt.personName}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {currencySymbol}{debt.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {debt.status === 'returned'
                      ? currencySymbol + debt.amount.toLocaleString()
                      : currencySymbol + (debt.returnedAmount || 0).toLocaleString()
                    }
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {debt.status === 'returned'
                      ? currencySymbol + '0'
                      : currencySymbol + (debt.amount - (debt.returnedAmount || 0)).toLocaleString()
                    }
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(debt.status)}`}>
                      {debt.status.charAt(0).toUpperCase() + debt.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(debt.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {debt.status !== 'returned' && (
                        <button
                          onClick={() => {
                            setReturningDebt(debt);
                            setShowReturnModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Return debt"
                        >
                          <ArrowUpCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingDebt(debt);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(debt._id)}
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} debts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadDebts(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => loadDebts(pagination.page + 1)}
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
        <DebtModal
          debt={editingDebt}
          onClose={() => {
            setShowModal(false);
            setEditingDebt(null);
          }}
          onSave={() => {
            loadDebts();
            setShowModal(false);
            setEditingDebt(null);
          }}
        />
      )}

      {showReturnModal && returningDebt && (
        <ReturnModal
          debt={returningDebt}
          currencySymbol={currencySymbol}
          onClose={() => {
            setShowReturnModal(false);
            setReturningDebt(null);
          }}
          onSave={() => {
            loadDebts();
            setShowReturnModal(false);
            setReturningDebt(null);
          }}
        />
      )}
    </div>
  );
};

const DebtModal: React.FC<{
  debt: Debt | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ debt, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: debt?.title || '',
    amount: debt?.amount || 0,
    type: debt?.type || 'borrow',
    personName: debt?.personName || '',
    date: debt?.date ? new Date(debt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: debt?.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
    notes: debt?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting debt data:', formData);
      // Remove empty strings from optional fields
      const dataToSubmit = {
        ...formData,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      };
      if (debt) {
        await debtAPI.updateDebt(debt._id, dataToSubmit);
      } else {
        await debtAPI.createDebt(dataToSubmit);
      }
      onSave();
    } catch (error: any) {
      console.error('Failed to save debt:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {debt ? 'Edit Debt' : 'Add Debt'}
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value ? parseFloat(e.target.value) : 0 })}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'borrow' | 'lend' })}
                className="input"
                required
              >
                <option value="borrow">Borrow (you owe someone)</option>
                <option value="lend">Lend (someone owes you)</option>
              </select>
            </div>
            <div>
              <label className="label">Person Name</label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                className="input"
                required
              />
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
              <label className="label">Due Date (Optional)</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
              />
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
              {debt ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const ReturnModal: React.FC<{
  debt: Debt;
  currencySymbol: string;
  onClose: () => void;
  onSave: () => void;
}> = ({ debt, currencySymbol, onClose, onSave }) => {
  const [returnedAmount, setReturnedAmount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await debtAPI.returnDebt(debt._id, { returnedAmount });
      onSave();
    } catch (error) {
      console.error('Failed to return debt:', error);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Return Debt
        </h2>
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Debt:</strong> {debt.title}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Total Amount:</strong> {currencySymbol}{debt.amount.toLocaleString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Already Returned:</strong> {currencySymbol}{(debt.returnedAmount || 0).toLocaleString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Remaining:</strong> {currencySymbol}{(debt.amount - (debt.returnedAmount || 0)).toLocaleString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Person:</strong> {debt.personName}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Amount to Return</label>
              <input
                type="number"
                value={returnedAmount}
                onChange={(e) => setReturnedAmount(parseFloat(e.target.value))}
                className="input"
                required
                min="0"
                step="0.01"
                max={debt.amount - (debt.returnedAmount || 0)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum: {currencySymbol}{(debt.amount - (debt.returnedAmount || 0)).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Return
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default Debts;
