import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { RegisterScreen } from './screens/RegisterScreen.js';
import { FarmerDashboard } from './screens/FarmerDashboard.js';
import { NewBatchScreen } from './screens/NewBatchScreen.js';
import { BatchDetailsScreen } from './screens/BatchDetailsScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { KycAdminPanel } from './screens/KycAdminPanel.js';
import { KycAdminLoginScreen } from './screens/KycAdminLoginScreen.js';

const MainContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isKycUrl, setIsKycUrl] = useState(false);

  // Check URL pathname for /kyc route (e.g. http://localhost:9600/kyc)
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/kyc' || path.startsWith('/kyc')) {
        setIsKycUrl(true);
        setCurrentScreen('kyc-admin');
      } else {
        setIsKycUrl(false);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  const handleNavigate = (screen: string) => {
    if (screen === 'kyc-admin') {
      window.history.pushState({}, '', '/kyc');
      setIsKycUrl(true);
    } else {
      if (window.location.pathname.toLowerCase().startsWith('/kyc')) {
        window.history.pushState({}, '', '/');
      }
      setIsKycUrl(false);
    }
    setCurrentScreen(screen);
    if (screen !== 'batch-details') {
      setSelectedBatchId(null);
    }
  };

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCurrentScreen('batch-details');
  };

  const handleBatchCreated = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCurrentScreen('batch-details');
  };

  // Dedicated Route for /kyc (http://localhost:9600/kyc)
  if (isKycUrl || currentScreen === 'kyc-admin') {
    const isAuthorizedAdmin = isAuthenticated && user && (user.email === 'kyc@farmsgo.in' || user.role === 'KYC Admin');

    return (
      <div className="min-h-screen bg-botani-bg text-botani-text flex flex-col font-sans">
        <Header currentScreen={currentScreen} onNavigate={handleNavigate} />

        <main className="flex-grow pb-16">
          {isAuthorizedAdmin ? (
            <KycAdminPanel onNavigate={handleNavigate} />
          ) : (
            <KycAdminLoginScreen onLoginSuccess={() => setCurrentScreen('kyc-admin')} />
          )}
        </main>

        <footer className="bg-botani-surface border-t border-botani-border py-8 px-6 text-center text-xs text-botani-muted">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div><span className="font-serif font-semibold text-botani-text">FarmsGo</span> • KYC Admin Verification Portal</div>
            <div>Authorized Admin Access • kyc@farmsgo.in</div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botani-bg text-botani-text flex flex-col font-sans">
      <Header currentScreen={currentScreen} onNavigate={handleNavigate} />

      <main className="flex-grow pb-16">
        {!isAuthenticated ? (
          currentScreen === 'register' ? (
            <RegisterScreen onNavigate={handleNavigate} />
          ) : (
            <LoginScreen onNavigate={handleNavigate} />
          )
        ) : user?.role === 'KYC Admin' || user?.email === 'kyc@farmsgo.in' ? (
          <KycAdminPanel onNavigate={handleNavigate} />
        ) : (
          <>
            {(currentScreen === 'dashboard' || currentScreen === 'kyc-admin') && (
              <FarmerDashboard
                onNavigate={handleNavigate}
                onSelectBatch={handleSelectBatch}
              />
            )}

            {currentScreen === 'new-batch' && (
              <NewBatchScreen
                onNavigate={handleNavigate}
                onBatchCreated={handleBatchCreated}
              />
            )}

            {currentScreen === 'batch-details' && selectedBatchId && (
              <BatchDetailsScreen
                batchId={selectedBatchId}
                onNavigate={handleNavigate}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileScreen onNavigate={handleNavigate} />
            )}
          </>
        )}
      </main>

      {/* Editorial Footer matching design spec */}
      <footer className="bg-botani-surface border-t border-botani-border py-8 px-6 md:px-12 text-center text-xs text-botani-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-serif font-semibold text-botani-text text-sm">FarmsGo</span> • Blockchain-Based Botanical Traceability
          </div>
          <div>
            Module 1 — User, Herb Collection & e-KYC Verification Management
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
