import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Leaf, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botani-green/10 border border-botani-green/20 text-botani-green text-xs font-medium uppercase tracking-widest mb-3">
            <Leaf className="w-3.5 h-3.5" />
            <span>Source Authentication • Module 1</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-botani-text">Welcome Back</h1>
          <p className="text-botani-muted text-sm mt-2">
            Sign in to your botanical collector account to manage verified herb collections.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-elevated">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-2">
                Email Address or Mobile Phone Number
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@farm.com or +91 9876543210"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green focus:ring-1 focus:ring-botani-green text-botani-text text-sm transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green focus:ring-1 focus:ring-botani-green text-botani-text text-sm transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-botani-text hover:bg-botani-green-dark text-white font-medium text-sm shadow-card flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating with Firebase...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Footer link to Register */}
        <div className="text-center mt-6 text-sm text-botani-muted">
          Don't have a collector profile?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-medium text-botani-green hover:underline"
          >
            Register New Account
          </button>
        </div>

      </div>
    </div>
  );
};
