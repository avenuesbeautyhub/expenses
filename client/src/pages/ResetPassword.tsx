import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!token) {
      setMessage('Invalid reset token');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await authAPI.resetPassword({ token, newPassword });
      setMessage('Password reset successfully');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            {success ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Lock className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {success ? 'Password Reset' : 'Reset Password'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {success
                ? 'Redirecting to login...'
                : 'Enter your new password'}
            </p>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                success
                  ? 'bg-green-100 text-green-700 border border-green-400'
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}
            >
              {message}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>

              <div className="mb-6">
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
