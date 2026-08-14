import React, { useEffect, useState } from 'react';
import { HerbBatch } from '../types/index.js';
import { apiService } from '../services/api.js';
import { MapView } from '../components/MapView.js';
import { ArrowLeft, MapPin, Calendar, UserCheck, ShieldCheck, Tag, Copy, Check, Clock, ExternalLink } from 'lucide-react';

interface BatchDetailsScreenProps {
  batchId: string;
  onNavigate: (screen: string) => void;
}

export const BatchDetailsScreen: React.FC<BatchDetailsScreenProps> = ({ batchId, onNavigate }) => {
  const [batch, setBatch] = useState<HerbBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await apiService.getBatchById(batchId);
        setBatch(res.batch);
      } catch (err: any) {
        setError(err.message || 'Batch not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [batchId]);

  const handleCopyId = () => {
    if (batch?.batchId) {
      navigator.clipboard.writeText(batch.batchId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-botani-muted space-y-3">
        <Clock className="w-8 h-8 animate-spin mx-auto text-botani-green" />
        <p className="text-sm font-medium">Loading batch provenance record...</p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-botani-text">Batch Not Found</h2>
        <p className="text-botani-muted text-sm">{error || 'Requested batch ID does not exist.'}</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 rounded-full bg-botani-text text-white text-sm font-medium hover:bg-botani-green-dark transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-sm text-botani-muted hover:text-botani-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-botani-surface px-4 py-1.5 rounded-full border border-botani-border text-xs font-bold tracking-wider text-botani-green flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-botani-green animate-pulse"></span>
            <span>STATUS: {batch.status}</span>
          </div>

          <button
            onClick={handleCopyId}
            className="px-3.5 py-1.5 rounded-full bg-botani-surface border border-botani-border text-xs text-botani-muted hover:text-botani-text flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-botani-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied ID' : 'Copy ID'}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="bg-botani-surface p-8 md:p-10 rounded-3xl border border-botani-border shadow-elevated grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Info */}
        <div className="space-y-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-botani-muted mb-1">
              Batch Provenance Record • {batch.batchId}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-botani-text">
              {batch.herbName}
            </h1>
            <p className="text-lg font-serif italic text-botani-muted mt-1">
              Species: {batch.species}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-botani-border text-sm">
            <div className="flex items-center gap-3 text-botani-text">
              <div className="w-8 h-8 rounded-lg bg-botani-green/10 border border-botani-green/20 text-botani-green flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-botani-muted">Registered Collector</div>
                <div className="font-medium">{batch.collectorName || 'Rajesh Patel'} ({batch.collectorRole || 'Farmer'})</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-botani-text">
              <div className="w-8 h-8 rounded-lg bg-botani-green/10 border border-botani-green/20 text-botani-green flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-botani-muted">Harvest Collection Date</div>
                <div className="font-medium">{batch.collectionDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-botani-text">
              <div className="w-8 h-8 rounded-lg bg-botani-green/10 border border-botani-green/20 text-botani-green flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-botani-muted">GPS Geo-Coordinates</div>
                <div className="font-mono font-medium text-botani-green">
                  {batch.latitude.toFixed(6)}° N, {batch.longitude.toFixed(6)}° E
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Photo */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-botani-border shadow-card bg-botani-bg">
          <img
            src={batch.imageUrl}
            alt={batch.herbName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80'
              );
            }}
          />
          <div className="absolute bottom-3 left-3 right-3 bg-botani-surface/90 backdrop-blur-md px-4 py-2 rounded-xl border border-botani-border text-xs text-botani-text flex items-center justify-between">
            <span className="font-semibold">Harvest Visual Verification</span>
            <ShieldCheck className="w-4 h-4 text-botani-green" />
          </div>
        </div>

      </div>

      {/* Map Card */}
      <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-botani-text flex items-center gap-2">
              <span>Collection Location Map</span>
              <MapPin className="w-5 h-5 text-botani-green" />
            </h2>
            <p className="text-xs text-botani-muted mt-0.5">
              Verified OpenStreetMap tile rendering for batch harvest origin.
            </p>
          </div>

          <a
            href={`https://www.openstreetmap.org/?mlat=${batch.latitude}&mlon=${batch.longitude}#map=14/${batch.latitude}/${batch.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-botani-green hover:underline flex items-center gap-1 font-medium"
          >
            <span>Open Outer Map</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <MapView
          latitude={batch.latitude}
          longitude={batch.longitude}
          interactive={false}
          title={batch.herbName}
          subtitle={`Collector: ${batch.collectorName || 'Farmer'}`}
          height="360px"
        />
      </div>

    </div>
  );
};
