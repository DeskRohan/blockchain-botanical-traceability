import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ShieldCheck, ArrowRight, AlertCircle, KeyRound, Lock } from 'lucide-react';

interface KycAdminLoginScreenProps {
  onLoginSuccess: () => void;
}

export const KycAdminLoginScreen: React.FC<KycAdminLoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('kyc@farmsgo.in');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@farmsgo.in')) {
      setError('Access Restricted. Only official @farmsgo.in email accounts (e.g. kyc@farmsgo.in) are authorized for the KYC Admin Portal.');
      return;
    }

    if (cleanEmail !== 'kyc@farmsgo.in') {
      setError('Access Denied. Only kyc@farmsgo.in is registered as the authorized KYC Verification Officer.');
      return;
    }

    if (password !== '123456') {
      setError('Invalid password for KYC Admin portal. (Password: 123456)');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: cleanEmail, password });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'KYC Admin Login failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-botani-green/10 border border-botani-green/20 text-botani-green text-xs font-semibold uppercase tracking-widest mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>FarmsGo Admin Portal • Restricted</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-botani-text">FarmsGo KYC Login</h1>
          <p className="text-botani-muted text-sm mt-2">
            Strictly restricted to official FarmsGo Quality Officers (@farmsgo.in) to evaluate farmer e-KYC submissions.
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
                FarmsGo Officer Email (@farmsgo.in) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kyc@farmsgo.in"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-2">
                Admin Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none"
              />
              <div className="text-[11px] text-botani-green font-mono mt-1.5 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>Authorized Login: kyc@farmsgo.in / 123456</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-botani-green hover:bg-botani-green-dark text-white font-medium text-sm shadow-card flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying FarmsGo Credentials...' : 'Sign In to KYC Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
