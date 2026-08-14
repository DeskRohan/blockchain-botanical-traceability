import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User } from '../types/index.js';
import { firebaseService } from '../services/firebaseService.js';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  UserCheck,
  AlertCircle,
  UserX,
  Search,
  Maximize2,
  X,
  Award,
  Users,
  FileCheck,
  Percent,
} from 'lucide-react';

interface KycAdminPanelProps {
  onNavigate?: (screen: string) => void;
}

export const KycAdminPanel: React.FC<KycAdminPanelProps> = () => {
  const { user: currentUser, setUserDirectly } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('UNDER_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState<{ [userId: string]: string }>({});
  const [selectedDocUser, setSelectedDocUser] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchKycUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await firebaseService.getAllPendingKycUsers();
      setUsers(data);
    } catch (e: any) {
      console.warn('Error fetching KYC applications:', e);
      // Suppress raw permission warnings so UI stays clean
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycUsers();
  }, []);

  const handleApprove = async (targetUserId: string) => {
    setProcessingId(targetUserId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updatedUser = await firebaseService.updateKycStatus(
        targetUserId,
        'APPROVED',
        'Verified by Quality Assurance Admin'
      );

      setUsers((prev) =>
        prev.map((u) => (u.userId === targetUserId ? updatedUser : u))
      );

      if (currentUser && currentUser.userId === targetUserId) {
        setUserDirectly(updatedUser);
      }

      setSuccessMsg(`APPROVED verification for ${updatedUser.name}! Collector profile verified.`);
      if (selectedDocUser?.userId === targetUserId) {
        setSelectedDocUser(null);
      }
    } catch (e: any) {
      console.error('Approval failed:', e);
      setErrorMsg(e.message || 'Failed to update Firestore document.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (targetUserId: string) => {
    const remarks = rejectRemarks[targetUserId] || 'ID document unreadable or incomplete details';
    setProcessingId(targetUserId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updatedUser = await firebaseService.updateKycStatus(targetUserId, 'REJECTED', remarks);

      setUsers((prev) =>
        prev.map((u) => (u.userId === targetUserId ? updatedUser : u))
      );

      if (currentUser && currentUser.userId === targetUserId) {
        setUserDirectly(updatedUser);
      }

      setSuccessMsg(`Marked application as REJECTED for ${updatedUser.name}.`);
      if (selectedDocUser?.userId === targetUserId) {
        setSelectedDocUser(null);
      }
    } catch (e: any) {
      console.error('Rejection failed:', e);
      setErrorMsg(e.message || 'Failed to update status in Firestore.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevokeVerification = async (targetUserId: string) => {
    const remarks = rejectRemarks[targetUserId] || 'Verification status revoked by Quality Admin';
    setProcessingId(targetUserId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updatedUser = await firebaseService.updateKycStatus(targetUserId, 'REJECTED', remarks);

      setUsers((prev) =>
        prev.map((u) => (u.userId === targetUserId ? updatedUser : u))
      );

      if (currentUser && currentUser.userId === targetUserId) {
        setUserDirectly(updatedUser);
      }

      setSuccessMsg(`Revoked verification credentials for ${updatedUser.name}.`);
      if (selectedDocUser?.userId === targetUserId) {
        setSelectedDocUser(null);
      }
    } catch (e: any) {
      console.error('Revoke failed:', e);
      setErrorMsg(e.message || 'Failed to revoke verification status.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = users.filter((u) => u.verificationStatus === 'UNDER_REVIEW').length;
  const approvedCount = users.filter((u) => u.verificationStatus === 'APPROVED').length;
  const rejectedCount = users.filter((u) => u.verificationStatus === 'REJECTED').length;
  const totalProcessed = approvedCount + rejectedCount;
  const approvalRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 100) : 100;

  const filteredUsers = users
    .filter((u) => u.verificationStatus === activeTab)
    .filter((u) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.kisanId && u.kisanId.toLowerCase().includes(q))
      );
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      
      {/* Top Officer Title Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-botani-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-botani-green/10 border border-botani-green/20 text-botani-green text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Official Identity & Permit Audit Dashboard</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-botani-text">
            Collector Verification Management
          </h1>
          <p className="text-botani-muted text-sm mt-1">
            Audit submitted Kisan Cards, Government ID photos, and control botanical batch creation privileges.
          </p>
        </div>

        <button
          onClick={fetchKycUsers}
          className="px-5 py-2.5 rounded-full bg-botani-surface border border-botani-border text-botani-text text-xs font-semibold hover:border-botani-green transition-all flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-botani-green ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Verification Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-botani-surface p-6 rounded-3xl border border-botani-border shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-semibold">Pending Review</div>
            <div className="text-3xl font-serif font-bold text-amber-600 mt-1">{pendingCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-botani-surface p-6 rounded-3xl border border-botani-border shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-semibold">Verified Collectors</div>
            <div className="text-3xl font-serif font-bold text-botani-green mt-1">{approvedCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-botani-green/10 border border-botani-green/30 text-botani-green flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-botani-surface p-6 rounded-3xl border border-botani-border shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-semibold">Rejected / Revoked</div>
            <div className="text-3xl font-serif font-bold text-red-600 mt-1">{rejectedCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-botani-surface p-6 rounded-3xl border border-botani-border shadow-card flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-botani-muted font-semibold">Approval Rate</div>
            <div className="text-3xl font-serif font-bold text-botani-text mt-1">{approvalRate}%</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-botani-bg border border-botani-border text-botani-text flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-botani-green" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs and Collector Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-botani-border pb-1">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('UNDER_REVIEW')}
            className={`px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'UNDER_REVIEW'
                ? 'border-botani-green text-botani-green bg-botani-surface'
                : 'border-transparent text-botani-muted hover:text-botani-text'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Review ({pendingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'APPROVED'
                ? 'border-botani-green text-botani-green bg-botani-surface'
                : 'border-transparent text-botani-muted hover:text-botani-text'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Collectors ({approvedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-5 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'REJECTED'
                ? 'border-red-600 text-red-600 bg-botani-surface'
                : 'border-transparent text-botani-muted hover:text-botani-text'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Rejected / Revoked ({rejectedCount})</span>
          </button>
        </div>

        {/* Collector Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-botani-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, Kisan ID..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-botani-surface border border-botani-border focus:border-botani-green text-xs text-botani-text outline-none"
          />
        </div>

      </div>

      {/* Main Applicant List */}
      {loading ? (
        <div className="py-20 text-center text-botani-muted space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-botani-green" />
          <p className="text-sm font-medium">Fetching e-KYC applications from Firestore database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-botani-surface border border-dashed border-botani-border p-12 rounded-3xl text-center space-y-4">
          <UserCheck className="w-12 h-12 text-botani-muted mx-auto opacity-50" />
          <h3 className="text-xl font-serif font-bold text-botani-text">No Matching Applicant Records</h3>
          <p className="text-sm text-botani-muted max-w-md mx-auto">
            {searchQuery
              ? `No applicants found matching "${searchQuery}"`
              : activeTab === 'UNDER_REVIEW'
              ? 'No pending e-KYC applications waiting for review.'
              : activeTab === 'APPROVED'
              ? 'No verified collectors in database.'
              : 'No rejected or revoked profiles.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredUsers.map((u) => (
            <div
              key={u.userId}
              className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            >
              
              {/* Applicant Profile & Metadata */}
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-botani-green/10 border border-botani-green/30 text-botani-green flex items-center justify-center font-bold font-serif text-xl">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-botani-text flex items-center gap-2">
                      <span>{u.name}</span>
                      {u.verificationStatus === 'APPROVED' && <ShieldCheck className="w-5 h-5 text-botani-green" />}
                    </h3>
                    <div className="text-xs text-botani-muted flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-botani-green">{u.role}</span>
                      <span>•</span>
                      <span>{u.email}</span>
                      <span>•</span>
                      <span>{u.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-botani-border">
                  <div>
                    <span className="text-botani-muted">Kisan / Permit ID: </span>
                    <span className="font-mono font-semibold text-botani-text">{u.kisanId || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-botani-muted">Submission Date: </span>
                    <span className="font-medium text-botani-text">
                      {u.submittedAt ? new Date(u.submittedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Status & Remarks */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-botani-muted">Verification Status:</span>
                    {u.verificationStatus === 'APPROVED' && (
                      <span className="px-3 py-1 rounded-full bg-botani-green/15 text-botani-green text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED COLLECTOR</span>
                      </span>
                    )}
                    {u.verificationStatus === 'UNDER_REVIEW' && (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>UNDER REVIEW</span>
                      </span>
                    )}
                    {u.verificationStatus === 'REJECTED' && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>REJECTED / REVOKED</span>
                      </span>
                    )}
                  </div>
                  {u.verificationRemarks && (
                    <div className="text-xs text-botani-muted italic pt-1">
                      Auditor Remarks: "{u.verificationRemarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* ID Document Preview & High-Res Inspector Trigger */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                
                {/* Clickable Image Document Preview */}
                {u.idDocumentUrl ? (
                  <div
                    onClick={() => setSelectedDocUser(u)}
                    className="relative w-44 h-32 rounded-2xl overflow-hidden border border-botani-border bg-botani-bg cursor-pointer group shrink-0"
                    title="Click to Inspect Document Image"
                  >
                    <img src={u.idDocumentUrl} alt="Govt ID" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>Inspect Document</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-44 h-32 rounded-2xl border border-dashed border-botani-border bg-botani-bg flex items-center justify-center text-xs text-botani-muted shrink-0">
                    No document photo
                  </div>
                )}

                {/* Audit Action Buttons */}
                <div className="space-y-3 w-full sm:w-52 shrink-0">
                  {u.verificationStatus === 'APPROVED' ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Revocation reason..."
                        value={rejectRemarks[u.userId] || ''}
                        onChange={(e) => setRejectRemarks({ ...rejectRemarks, [u.userId]: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-botani-bg border border-botani-border text-[11px] text-botani-text outline-none"
                      />
                      <button
                        onClick={() => handleRevokeVerification(u.userId)}
                        disabled={processingId === u.userId}
                        className="w-full py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-card flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <UserX className="w-4 h-4" />
                        <span>{processingId === u.userId ? 'Revoking...' : 'Revoke Verification'}</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(u.userId)}
                        disabled={processingId === u.userId}
                        className="w-full py-3 px-4 rounded-full bg-botani-green hover:bg-botani-green-dark text-white font-medium text-xs shadow-card flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{processingId === u.userId ? 'Approving...' : 'Approve Verification'}</span>
                      </button>

                      {u.verificationStatus === 'UNDER_REVIEW' && (
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            value={rejectRemarks[u.userId] || ''}
                            onChange={(e) => setRejectRemarks({ ...rejectRemarks, [u.userId]: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-botani-bg border border-botani-border text-[11px] text-botani-text outline-none"
                          />
                          <button
                            onClick={() => handleReject(u.userId)}
                            disabled={processingId === u.userId}
                            className="w-full py-2 px-4 rounded-full border border-red-300 text-red-700 hover:bg-red-50 font-medium text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject Application</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* High-Resolution Document Inspection Modal */}
      {selectedDocUser && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-botani-surface border border-botani-border rounded-3xl max-w-2xl w-full p-8 space-y-6 relative overflow-hidden shadow-elevated">
            
            <button
              onClick={() => setSelectedDocUser(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-botani-muted hover:text-botani-text hover:bg-botani-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-botani-green/10 text-botani-green flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-botani-text">Government ID Document Inspection</h3>
                <p className="text-xs text-botani-muted">Applicant: {selectedDocUser.name} ({selectedDocUser.email})</p>
              </div>
            </div>

            {/* High-res Document View */}
            <div className="max-h-[350px] overflow-hidden rounded-2xl border border-botani-border bg-black/5 flex items-center justify-center">
              {selectedDocUser.idDocumentUrl ? (
                <img
                  src={selectedDocUser.idDocumentUrl}
                  alt="Govt ID Document"
                  className="w-full h-full object-contain max-h-[350px]"
                />
              ) : (
                <div className="p-12 text-botani-muted text-xs">No image provided</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-botani-bg p-4 rounded-xl border border-botani-border">
              <div>
                <span className="text-botani-muted">Kisan / Permit ID: </span>
                <span className="font-mono font-bold text-botani-text">{selectedDocUser.kisanId || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-botani-muted">Phone Number: </span>
                <span className="font-medium text-botani-text">{selectedDocUser.phone}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDocUser(null)}
                className="px-5 py-2.5 rounded-full border border-botani-border text-xs font-semibold text-botani-muted hover:text-botani-text"
              >
                Close Preview
              </button>

              {selectedDocUser.verificationStatus !== 'APPROVED' ? (
                <button
                  onClick={() => handleApprove(selectedDocUser.userId)}
                  disabled={processingId === selectedDocUser.userId}
                  className="px-6 py-2.5 rounded-full bg-botani-green text-white text-xs font-semibold shadow-card hover:bg-botani-green-dark transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Applicant</span>
                </button>
              ) : (
                <button
                  onClick={() => handleRevokeVerification(selectedDocUser.userId)}
                  disabled={processingId === selectedDocUser.userId}
                  className="px-6 py-2.5 rounded-full bg-red-600 text-white text-xs font-semibold shadow-card hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>Revoke Access</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
