import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { NotificationCenter } from './NotificationCenter.js';
import { Leaf, LogOut, User as UserIcon, MapPin, PlusCircle, ShieldCheck, Clock, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const isKycAdmin = isAuthenticated && user && (user.role === 'KYC Admin' || user.email === 'kyc@farmsgo.in' || user.isAdmin);
  const status = user?.verificationStatus || 'NOT_SUBMITTED';

  return (
    <header className="sticky top-0 z-50 h-20 bg-botani-surface/90 backdrop-blur-md border-b border-botani-border transition-all">
      <div className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(isKycAdmin ? 'kyc-admin' : 'dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-botani-green/10 border border-botani-green/30 flex items-center justify-center text-botani-green group-hover:bg-botani-green group-hover:text-white transition-all">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold tracking-tight text-botani-text group-hover:text-botani-green transition-colors flex items-center gap-2">
              <span>FarmsGo</span>
              {isKycAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-botani-green text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                  KYC Officer Portal
                </span>
              )}
            </div>
            <div className="text-[11px] uppercase tracking-widest text-botani-muted font-medium">
              {isKycAdmin ? 'Government & Collector Audit Unit' : 'Ayurvedic Traceability • Module 1'}
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3 md:gap-5">
          {isAuthenticated && user ? (
            isKycAdmin ? (
              /* DEDICATED KYC OFFICER HEADER */
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-botani-border">
                  <div className="w-9 h-9 rounded-xl bg-botani-green/15 border border-botani-green/30 text-botani-green flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-botani-text flex items-center gap-1.5 justify-end">
                      <span>KYC Verification Officer</span>
                    </div>
                    <div className="text-[11px] text-botani-muted font-mono">
                      kyc@farmsgo.in
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full border border-botani-border text-botani-muted hover:text-red-600 hover:border-red-300 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Admin Session</span>
                </button>
              </div>
            ) : (
              /* STANDARD FARMER / COLLECTOR HEADER */
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3.5 py-2 text-xs md:text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    currentScreen === 'dashboard'
                      ? 'bg-botani-green text-white shadow-sm'
                      : 'text-botani-text hover:bg-botani-bg'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Batches</span>
                </button>

                <button
                  onClick={() => onNavigate('new-batch')}
                  className={`px-3.5 py-2 text-xs md:text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    currentScreen === 'new-batch'
                      ? 'bg-botani-green text-white shadow-sm'
                      : 'bg-botani-text text-white hover:bg-botani-green-dark shadow-card'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Batch</span>
                </button>

                <button
                  onClick={() => onNavigate('profile')}
                  className={`px-3.5 py-2 text-xs md:text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    currentScreen === 'profile'
                      ? 'bg-botani-green text-white shadow-sm'
                      : 'text-botani-text hover:bg-botani-bg border border-botani-border'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Profile & KYC</span>
                </button>

                {/* Notification Center Bell Icon */}
                <NotificationCenter userId={user.userId} onNavigate={onNavigate} />

                {/* User Profile Pill */}
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-botani-border">
                  <div className="text-right">
                    <div className="text-sm font-medium text-botani-text flex items-center gap-1 justify-end">
                      <span>{user.name}</span>
                      {status === 'APPROVED' ? (
                        <span title="Verified Collector"><CheckCircle2 className="w-4 h-4 text-botani-green" /></span>
                      ) : status === 'UNDER_REVIEW' ? (
                        <span title="KYC Under Review"><Clock className="w-4 h-4 text-amber-600" /></span>
                      ) : (
                        <span title="Unverified"><ShieldAlert className="w-4 h-4 text-botani-muted" /></span>
                      )}
                    </div>
                    <div className="text-[11px] text-botani-muted flex items-center justify-end gap-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        status === 'APPROVED' ? 'bg-botani-green' : status === 'UNDER_REVIEW' ? 'bg-amber-500' : 'bg-botani-muted'
                      }`}></span>
                      <span>{user.role} • {status === 'APPROVED' ? 'Verified' : status}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 rounded-full text-botani-muted hover:text-botani-text hover:bg-botani-bg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="px-5 py-2.5 text-sm font-medium text-botani-text hover:text-botani-green transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-2.5 text-sm font-medium text-white bg-botani-text hover:bg-botani-green-dark rounded-full shadow-card transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
