import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { Leaf, ArrowRight, CheckCircle2, AlertCircle, Sprout, Compass } from 'lucide-react';

interface RegisterScreenProps {
  onNavigate: (screen: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Farmer');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [phoneFieldError, setPhoneFieldError] = useState<string | null>(null);
  
  const [emailShake, setEmailShake] = useState(false);
  const [phoneShake, setPhoneShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailFieldError(null);
    setPhoneFieldError(null);

    let hasValidationError = false;

    if (!name || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    // Client-side email domain validation
    if (!email.trim().toLowerCase().endsWith('@farmsgo.in')) {
      setEmailFieldError('Email address must end with @farmsgo.in');
      setEmailShake(true);
      setTimeout(() => setEmailShake(false), 500);
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name, email, phone, role, password });
      onNavigate('dashboard');
    } catch (err: any) {
      const msg: string = err?.message || 'Registration failed.';

      if (msg.toLowerCase().includes('phone')) {
        setPhoneFieldError('Phone number already exists');
        setPhoneShake(true);
        setTimeout(() => setPhoneShake(false), 500);
      } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('@farmsgo.in')) {
        setEmailFieldError('Email address must end with @farmsgo.in');
        setEmailShake(true);
        setTimeout(() => setEmailShake(false), 500);
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botani-green/10 border border-botani-green/20 text-botani-green text-xs font-medium uppercase tracking-widest mb-3">
            <Leaf className="w-3.5 h-3.5" />
            <span>FarmsGo Collector Onboarding</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-botani-text">Collector Registration</h1>
          <p className="text-botani-muted text-sm mt-2">
            Register your botanical collection entity to start issuing geo-tagged batch provenance.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-elevated">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-2">
                Primary Botanical Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Farmer')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'Farmer'
                      ? 'bg-botani-green/10 border-botani-green text-botani-text ring-1 ring-botani-green'
                      : 'bg-botani-bg border-botani-border text-botani-muted hover:border-botani-green/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Sprout className={`w-5 h-5 ${role === 'Farmer' ? 'text-botani-green' : 'text-botani-muted'}`} />
                    {role === 'Farmer' && <CheckCircle2 className="w-4 h-4 text-botani-green" />}
                  </div>
                  <div className="font-semibold text-sm text-botani-text">Farmer</div>
                  <div className="text-[11px] text-botani-muted mt-0.5">Cultivates medicinal plants in registered organic farms</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Wild Collector')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'Wild Collector'
                      ? 'bg-botani-green/10 border-botani-green text-botani-text ring-1 ring-botani-green'
                      : 'bg-botani-bg border-botani-border text-botani-muted hover:border-botani-green/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Compass className={`w-5 h-5 ${role === 'Wild Collector' ? 'text-botani-green' : 'text-botani-muted'}`} />
                    {role === 'Wild Collector' && <CheckCircle2 className="w-4 h-4 text-botani-green" />}
                  </div>
                  <div className="font-semibold text-sm text-botani-text">Wild Collector</div>
                  <div className="text-[11px] text-botani-muted mt-0.5">Harvests naturally grown herbs from verified forest zones</div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                Full Name / Organization *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar Patel"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green focus:ring-1 focus:ring-botani-green text-botani-text text-sm transition-all outline-none"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailFieldError) setEmailFieldError(null);
                  }}
                  placeholder="ramesh@farmsgo.in"
                  className={`w-full px-4 py-3 rounded-xl bg-botani-bg border text-botani-text text-sm transition-all outline-none ${
                    emailFieldError
                      ? 'border-red-500 ring-2 ring-red-200'
                      : 'border-botani-border focus:border-botani-green focus:ring-1 focus:ring-botani-green'
                  } ${emailShake ? 'animate-shake' : ''}`}
                />
                {emailFieldError && (
                  <div className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailFieldError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneFieldError) setPhoneFieldError(null);
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full px-4 py-3 rounded-xl bg-botani-bg border text-botani-text text-sm transition-all outline-none ${
                    phoneFieldError
                      ? 'border-red-500 ring-2 ring-red-200'
                      : 'border-botani-border focus:border-botani-green focus:ring-1 focus:ring-botani-green'
                  } ${phoneShake ? 'animate-shake' : ''}`}
                />
                {phoneFieldError && (
                  <div className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneFieldError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                Account Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green focus:ring-1 focus:ring-botani-green text-botani-text text-sm transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-botani-text hover:bg-botani-green-dark text-white font-medium text-sm shadow-card flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Link back to login */}
        <div className="text-center mt-6 text-sm text-botani-muted">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-medium text-botani-green hover:underline"
          >
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
};
