import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { HerbBatch } from '../types/index.js';
import { apiService } from '../services/api.js';
import { Leaf, Plus, Search, MapPin, Calendar, Tag, ShieldCheck, RefreshCw, ArrowUpRight, AlertTriangle, Clock, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

interface FarmerDashboardProps {
  onNavigate: (screen: string) => void;
  onSelectBatch: (batchId: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onNavigate, onSelectBatch }) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<HerbBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'mine'>('all');
  const [showKycPrompt, setShowKycPrompt] = useState(false);

  const status = user?.verificationStatus || 'NOT_SUBMITTED';

  const fetchBatches = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      // Fetch ONLY batches registered by this specific farmer/collector per PRD spec GET /batches/user/:userId
      const res = await apiService.getBatchesByUserId(user.userId);
      setBatches(res.batches || []);
    } catch (err) {
      console.error('Failed to load user batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [user]);

  const handleRegisterBatchClick = () => {
    if (status === 'APPROVED') {
      onNavigate('new-batch');
    } else {
      setShowKycPrompt(true);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.herbName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-10">
      
      {/* Top Verification Alert Banner if unverified */}
      {status !== 'APPROVED' && (
        <div className={`p-6 rounded-3xl border shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          status === 'UNDER_REVIEW'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
            : status === 'REJECTED'
            ? 'bg-red-500/10 border-red-500/30 text-red-950'
            : 'bg-botani-surface border-botani-border text-botani-text'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-botani-bg text-botani-muted'
            }`}>
              {status === 'UNDER_REVIEW' ? <Clock className="w-6 h-6 animate-spin" /> : <ShieldAlert className="w-6 h-6 text-botani-green" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="font-serif font-bold text-lg text-botani-text">
                {status === 'UNDER_REVIEW'
                  ? 'e-KYC Application Under Manual Review'
                  : status === 'REJECTED'
                  ? 'e-KYC Verification Action Required'
                  : 'Farmer / Collector e-KYC Verification Required'}
              </h4>
              <p className="text-xs text-botani-muted">
                {status === 'UNDER_REVIEW'
                  ? 'Your identity documents are under review by Quality Admins. You will be notified once approved.'
                  : status === 'REJECTED'
                  ? `Application remarks: ${user?.verificationRemarks || 'Please resubmit clear ID documents.'}`
                  : 'Complete e-KYC verification to unlock geo-tagged herb batch registration rights.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="px-6 py-2.5 rounded-full bg-botani-text hover:bg-botani-green-dark text-white font-medium text-xs shadow-card flex items-center gap-2 transition-all shrink-0"
          >
            <span>{status === 'UNDER_REVIEW' ? 'View Status' : 'Complete e-KYC'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Welcome Card */}
      <div className="bg-botani-surface p-8 md:p-10 rounded-3xl border border-botani-border shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botani-green/10 border border-botani-green/20 text-botani-green text-xs font-semibold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5" />
            <span>Collector Portal • Source Origin</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-botani-text">
            Welcome, {user?.name || 'Botanical Collector'}
          </h1>
          <p className="text-botani-muted text-sm leading-relaxed flex items-center gap-2">
            <span>Role: <strong className="text-botani-green">{user?.role || 'Farmer'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-botani-text">
              Status: {status === 'APPROVED' ? (
                <span className="text-botani-green flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </span>
              ) : (
                <span className="text-amber-700">{status}</span>
              )}
            </span>
          </p>
        </div>

        <button
          onClick={handleRegisterBatchClick}
          className="px-6 py-4 rounded-full bg-botani-text hover:bg-botani-green-dark text-white font-medium text-sm shadow-elevated flex items-center gap-2.5 transition-all group shrink-0"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Register New Batch</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-botani-surface p-6 rounded-2xl border border-botani-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-medium">Total Batches</div>
            <div className="text-3xl font-serif font-bold text-botani-text mt-1">{batches.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-botani-green/10 border border-botani-green/20 text-botani-green flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-botani-surface p-6 rounded-2xl border border-botani-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-medium">Batch Status</div>
            <div className="text-3xl font-serif font-bold text-botani-green mt-1">COLLECTED</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-botani-green/10 border border-botani-green/20 text-botani-green flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-botani-surface p-6 rounded-2xl border border-botani-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-medium">Collector Verification</div>
            <div className="text-2xl font-serif font-bold text-botani-text mt-1 uppercase">
              {status === 'APPROVED' ? 'Verified' : status}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-botani-green/10 border border-botani-green/20 text-botani-green flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-botani-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by herb name, species, batch ID..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-botani-surface border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={fetchBatches}
            title="Refresh Batches"
            className="p-3 rounded-full bg-botani-surface border border-botani-border text-botani-muted hover:text-botani-green transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="py-16 text-center text-botani-muted space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-botani-green" />
          <p className="text-sm font-medium">Fetching verified herb collection records from Firestore...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-botani-surface border border-dashed border-botani-border p-12 rounded-3xl text-center space-y-4">
          <Leaf className="w-12 h-12 text-botani-muted mx-auto opacity-50" />
          <h3 className="text-xl font-serif font-bold text-botani-text">No Herb Batches Found</h3>
          <p className="text-sm text-botani-muted max-w-md mx-auto">
            {searchQuery
              ? `No batches matching "${searchQuery}"`
              : 'You have not registered any botanical herb collections yet.'}
          </p>
          <button
            onClick={handleRegisterBatchClick}
            className="px-6 py-2.5 rounded-full bg-botani-green text-white text-sm font-medium hover:bg-botani-green-dark transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Batch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <div
              key={batch.batchId}
              onClick={() => onSelectBatch(batch.batchId)}
              className="group bg-botani-surface rounded-3xl border border-botani-border overflow-hidden hover:border-botani-green/50 shadow-card hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-botani-bg">
                  <img
                    src={batch.imageUrl}
                    alt={batch.herbName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute(
                        'src',
                        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
                      );
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-botani-surface/90 backdrop-blur-md px-3 py-1 rounded-full border border-botani-border text-[11px] font-bold tracking-wider text-botani-green flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-botani-green animate-pulse"></span>
                    <span>{batch.status}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-botani-text/80 backdrop-blur-md text-white font-mono text-xs px-2.5 py-1 rounded-lg">
                    {batch.batchId}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-botani-text group-hover:text-botani-green transition-colors">
                      {batch.herbName}
                    </h3>
                    <div className="text-xs font-serif italic text-botani-muted">
                      {batch.species}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-botani-border text-xs text-botani-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-botani-green" />
                      <span>Collection Date: {batch.collectionDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-botani-green" />
                      <span>
                        GPS: {batch.latitude.toFixed(4)}°, {batch.longitude.toFixed(4)}°
                      </span>
                    </div>

                    {batch.collectorName && (
                      <div className="flex items-center gap-2 text-botani-text font-medium pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-botani-green"></span>
                        <span>Collector: {batch.collectorName} ({batch.collectorRole || 'Farmer'})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-botani-bg/50 border-t border-botani-border flex items-center justify-between text-xs font-semibold text-botani-green group-hover:bg-botani-green group-hover:text-white transition-colors">
                <span>View Full Batch Provenance</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unverified e-KYC Modal Prompt */}
      {showKycPrompt && (
        <div className="fixed inset-0 bg-botani-text/40 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
          <div className="bg-botani-surface max-w-md w-full rounded-3xl border border-botani-border p-8 shadow-elevated space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-botani-text">e-KYC Verification Required</h3>
              <p className="text-xs text-botani-muted leading-relaxed">
                To issue verified geo-tagged botanical provenance records, your farmer/collector identity profile must be verified first.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-botani-bg border border-botani-border text-xs text-left text-botani-text space-y-1">
              <div className="font-semibold text-botani-green">Current Status: {status}</div>
              {status === 'UNDER_REVIEW' ? (
                <div>Your e-KYC submission is currently under manual review by Quality Admins.</div>
              ) : (
                <div>Please submit your Kisan Card / Government ID details in your Profile section.</div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowKycPrompt(false)}
                className="w-1/2 py-3 rounded-full border border-botani-border text-xs font-medium text-botani-text hover:bg-botani-bg transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setShowKycPrompt(false);
                  onNavigate('profile');
                }}
                className="w-1/2 py-3 rounded-full bg-botani-green text-white text-xs font-medium shadow-card hover:bg-botani-green-dark transition-all"
              >
                Go to Profile & KYC
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
