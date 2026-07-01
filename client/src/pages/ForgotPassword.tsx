import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await authAPI.forgotPassword({ email });
      setMessage(response.data.message);
      setSuccess(true);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        <div className="card">
          <div className="text-center mb-8">
            {success ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {success ? 'Check Your Email' : 'Forgot Password'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {success
                ? 'We have sent a password reset link to your email'
                : 'Enter your email to receive a password reset link'}
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
              <div className="mb-6">
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {success && (
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setMessage('');
              }}
              className="btn btn-primary w-full"
            >
              Send Another Link
            </button>
          )}

          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
