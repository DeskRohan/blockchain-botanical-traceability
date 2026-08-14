import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { firebaseService } from '../services/firebaseService.js';
import { Leaf, ShieldCheck, Clock, AlertTriangle, Upload, ArrowLeft, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { user, setUserDirectly } = useAuth();

  const [kisanId, setKisanId] = useState(user?.kisanId || '');
  const [idDocumentUrl, setIdDocumentUrl] = useState(user?.idDocumentUrl || '');
  const [idDocPreview, setIdDocPreview] = useState<string | null>(user?.idDocumentUrl || null);
  const [landDocumentUrl, setLandDocumentUrl] = useState(user?.landDocumentUrl || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-botani-text">Authentication Required</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 rounded-full bg-botani-text text-white text-sm font-medium hover:bg-botani-green-dark transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  let effectiveStatus = user.verificationStatus || 'NOT_SUBMITTED';
  let effectiveRemarks = user.verificationRemarks;

  try {
    const kycMapRaw = localStorage.getItem('farmsgo_kyc_statuses') || '{}';
    const kycMap = JSON.parse(kycMapRaw);
    if (kycMap[user.userId]) {
      effectiveStatus = kycMap[user.userId].verificationStatus;
      effectiveRemarks = kycMap[user.userId].verificationRemarks;
    }
  } catch (e) {}

  const status = effectiveStatus;

  const handleIdDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setIdDocPreview(result);
        setIdDocumentUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!kisanId) {
      setError('Please provide your Kisan Card / Aadhaar / Forest Permit ID Number.');
      return;
    }

    if (!idDocumentUrl && !idDocPreview) {
      setError('Please upload a clear photograph of your Government ID document.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await firebaseService.submitEkyc({
        userId: user.userId,
        kisanId,
        idDocumentUrl: idDocPreview || idDocumentUrl,
        landDocumentUrl,
      });

      setUserDirectly(updatedUser);
      setSuccessMsg('e-KYC Application Submitted Successfully! Your documents are currently under manual review.');
    } catch (err: any) {
      setError(err.message || 'Failed to submit e-KYC documents to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-sm text-botani-muted hover:text-botani-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botani-green/10 border border-botani-green/20 text-botani-green text-xs font-semibold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          <span>Collector Profile & Verification</span>
        </div>
      </div>

      {/* User Overview Card */}
      <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-botani-green/10 border border-botani-green/30 text-botani-green flex items-center justify-center text-2xl font-bold font-serif">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-botani-text flex items-center gap-2">
              <span>{user.name}</span>
              {status === 'APPROVED' && <ShieldCheck className="w-6 h-6 text-botani-green" />}
            </h1>
            <div className="text-xs text-botani-muted flex flex-wrap items-center gap-3">
              <span>Role: <strong className="text-botani-text">{user.role}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-botani-text">{user.email}</strong></span>
              <span>•</span>
              <span>Phone: <strong className="text-botani-text">{user.phone}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Verification Pill */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          {status === 'APPROVED' && (
            <div className="px-4 py-2 rounded-full bg-botani-green/15 border border-botani-green/30 text-botani-green text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFIED COLLECTOR</span>
            </div>
          )}
          {status === 'UNDER_REVIEW' && (
            <div className="px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>KYC UNDER REVIEW</span>
            </div>
          )}
          {status === 'REJECTED' && (
            <div className="px-4 py-2 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>KYC ACTION REQUIRED</span>
            </div>
          )}
          {status === 'NOT_SUBMITTED' && (
            <div className="px-4 py-2 rounded-full bg-botani-bg border border-botani-border text-botani-muted text-xs font-bold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>KYC NOT SUBMITTED</span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Timeline Status Card */}
      <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card space-y-6">
        <div className="border-b border-botani-border pb-4">
          <h2 className="font-serif text-2xl font-bold text-botani-text flex items-center gap-2">
            <span>e-KYC Verification Status</span>
            {status === 'APPROVED' ? (
              <CheckCircle2 className="w-5 h-5 text-botani-green" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600" />
            )}
          </h2>
          <p className="text-xs text-botani-muted mt-1">
            Official government & botanical harvest permit verification process for source provenance issue rights.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className={`p-4 rounded-2xl border text-left space-y-1 ${
            status !== 'NOT_SUBMITTED' ? 'bg-botani-green/10 border-botani-green text-botani-text' : 'bg-botani-bg border-botani-border text-botani-muted'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-botani-green">Step 1</div>
            <div className="font-semibold text-sm">Application Submitted</div>
            <div className="text-[11px] opacity-80">Govt ID & Kisan Card Uploaded</div>
          </div>

          <div className={`p-4 rounded-2xl border text-left space-y-1 ${
            status === 'UNDER_REVIEW' || status === 'APPROVED' ? 'bg-botani-green/10 border-botani-green text-botani-text' : 'bg-botani-bg border-botani-border text-botani-muted'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-botani-green">Step 2</div>
            <div className="font-semibold text-sm">Under Review</div>
            <div className="text-[11px] opacity-80">Manual verification by Quality Admin</div>
          </div>

          <div className={`p-4 rounded-2xl border text-left space-y-1 ${
            status === 'APPROVED' ? 'bg-botani-green text-white border-botani-green' : 'bg-botani-bg border-botani-border text-botani-muted'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider opacity-90">Step 3</div>
            <div className="font-semibold text-sm">Approval & Badge Granted</div>
            <div className="text-[11px] opacity-80">Unlocked Herb Batch Registration</div>
          </div>

        </div>

        {/* Remarks Banner */}
        {user.verificationRemarks && (
          <div className="p-4 rounded-xl bg-botani-bg border border-botani-border text-xs text-botani-text flex items-center justify-between">
            <div>
              <span className="font-semibold text-botani-green">Reviewer Remarks: </span>
              <span>{user.verificationRemarks}</span>
            </div>
            {user.verifiedAt && (
              <span className="text-[11px] text-botani-muted font-mono">
                Verified: {new Date(user.verifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* e-KYC Document Submission Form */}
      <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card space-y-6">
        <div className="border-b border-botani-border pb-4">
          <h2 className="font-serif text-2xl font-bold text-botani-text">
            {status === 'APPROVED' ? 'Verified Credentials' : 'Submit e-KYC Identification'}
          </h2>
          <p className="text-xs text-botani-muted mt-1">
            Provide your official government issued Farmer/Collector ID card details to complete verification.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-botani-green" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitKyc} className="space-y-6">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
              Kisan Credit Card ID / Aadhaar / Forest Harvest Permit Number *
            </label>
            <input
              type="text"
              required
              disabled={status === 'APPROVED' || status === 'UNDER_REVIEW'}
              value={kisanId}
              onChange={(e) => setKisanId(e.target.value)}
              placeholder="e.g. KCC-9874-2026-IND"
              className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none font-mono disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* ID Document Photo */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted">
                Government ID Card Image *
              </label>
              
              {status !== 'APPROVED' && status !== 'UNDER_REVIEW' ? (
                <div className="relative border-2 border-dashed border-botani-border hover:border-botani-green p-6 rounded-2xl text-center bg-botani-bg transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIdDocChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Upload className="w-7 h-7 text-botani-muted group-hover:text-botani-green mx-auto mb-2 transition-colors" />
                  <div className="text-xs font-semibold text-botani-text">Upload Govt ID Photo</div>
                  <div className="text-[11px] text-botani-muted mt-1">Aadhaar, Voter ID, or Forest Badge</div>
                </div>
              ) : null}

              {idDocPreview && (
                <div className="h-40 rounded-2xl overflow-hidden border border-botani-border bg-botani-bg">
                  <img src={idDocPreview} alt="ID Document Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Additional Land / Harvest Permit Document (Optional) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted">
                Land Certificate / Harvest License URL (Optional)
              </label>
              <input
                type="text"
                disabled={status === 'APPROVED' || status === 'UNDER_REVIEW'}
                value={landDocumentUrl}
                onChange={(e) => setLandDocumentUrl(e.target.value)}
                placeholder="https://... (Optional Land record image link)"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none text-xs disabled:opacity-60"
              />
              <div className="text-[11px] text-botani-muted pt-1">
                Optional: attach organic farming certification or forest collector quota document.
              </div>
            </div>

          </div>

          {status !== 'APPROVED' && status !== 'UNDER_REVIEW' && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-full bg-botani-green hover:bg-botani-green-dark text-white font-medium text-sm shadow-elevated flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting e-KYC...' : 'Submit e-KYC Documents'}</span>
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
};
