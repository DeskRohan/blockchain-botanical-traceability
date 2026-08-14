import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { apiService } from '../services/api.js';
import { firebaseService } from '../services/firebaseService.js';
import { MapView } from '../components/MapView.js';
import { Leaf, Navigation, Upload, CheckCircle2, AlertCircle, ArrowLeft, Sparkles, MapPin } from 'lucide-react';

interface NewBatchScreenProps {
  onNavigate: (screen: string) => void;
  onBatchCreated: (batchId: string) => void;
}

export const NewBatchScreen: React.FC<NewBatchScreenProps> = ({ onNavigate, onBatchCreated }) => {
  const { user } = useAuth();

  const [herbName, setHerbName] = useState('');
  const [species, setSpecies] = useState('');
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // Default GPS coords centered in India
  const [latitude, setLatitude] = useState<number>(20.5937);
  const [longitude, setLongitude] = useState<number>(78.9629);
  
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [generatedBatchId, setGeneratedBatchId] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate preview batch ID on mount
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setGeneratedBatchId(`BTC-${new Date().getFullYear()}-${randomNum}`);
  }, []);

  // Browser Geolocation auto-detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Could not fetch device GPS. You can enter or pick coordinates directly on the interactive map.');
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!herbName || !species || !collectionDate) {
      setError('Please fill in Herb Name, Species, and Collection Date.');
      return;
    }

    if (!user?.userId) {
      setError('Authenticated user session required. Please sign in or register.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiService.createBatch({
        herbName,
        species,
        collectorId: user.userId,
        collectionDate,
        latitude,
        longitude,
        imageUrl: imagePreview || imageUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      });

      // Trigger rich botanical notification
      try {
        await firebaseService.createNotification({
          userId: user.userId,
          title: '🌿 Herb Batch Registered Successfully!',
          message: `Batch ${res.batch.batchId} (${res.batch.herbName} - ${res.batch.species}) has been geo-tagged at ${res.batch.latitude.toFixed(4)}°N, ${res.batch.longitude.toFixed(4)}°E and sealed in audit logs.`,
          type: 'BATCH_CREATED',
        });
      } catch (e) {
        console.warn('Batch notification trigger warning:', e);
      }

      onBatchCreated(res.batch.batchId);
    } catch (err: any) {
      setError(err.message || 'Failed to create batch in Firebase Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      
      {/* Top Header */}
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
          <span>New Batch Registration</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-bold text-botani-text">
          Register Botanical Harvest
        </h1>
        <p className="text-botani-muted text-sm">
          Issue a verified, geo-tagged source origin record for your harvested Ayurvedic medicinal plants.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Card 1: Batch Identification */}
        <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-botani-border">
            <h2 className="font-serif text-2xl font-bold text-botani-text">1. Botanical Identity</h2>
            <div className="bg-botani-bg px-3 py-1 rounded-lg border border-botani-border font-mono text-xs font-semibold text-botani-green">
              Auto ID: {generatedBatchId}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                Herb Name *
              </label>
              <input
                type="text"
                required
                value={herbName}
                onChange={(e) => setHerbName(e.target.value)}
                placeholder="e.g. Ashwagandha"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                Botanical Species *
              </label>
              <input
                type="text"
                required
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="e.g. Withania somnifera"
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none italic font-serif"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
              Collection Date *
            </label>
            <input
              type="date"
              required
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none"
            />
          </div>
        </div>

        {/* Card 2: Geo-Tagging GPS & Interactive Map */}
        <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-botani-border">
            <h2 className="font-serif text-2xl font-bold text-botani-text flex items-center gap-2">
              <span>2. Geo-Tagging GPS Location</span>
              <MapPin className="w-5 h-5 text-botani-green" />
            </h2>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetectingGps}
              className="px-4 py-2 rounded-full bg-botani-green/10 border border-botani-green/30 text-botani-green hover:bg-botani-green hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting Location...' : 'Use Browser GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                Latitude (°N) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-botani-muted mb-1.5">
                Longitude (°E) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-botani-bg border border-botani-border focus:border-botani-green text-sm text-botani-text outline-none font-mono"
              />
            </div>
          </div>

          {/* Interactive OpenStreetMap preview */}
          <div className="space-y-2">
            <div className="text-xs text-botani-muted flex items-center justify-between">
              <span>Interactive Leaflet GPS Map (Click anywhere to update pin):</span>
              <span className="font-mono text-botani-green font-semibold">
                {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
              </span>
            </div>
            <MapView
              latitude={latitude}
              longitude={longitude}
              interactive={true}
              onLocationSelect={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              title={herbName || 'New Herb Harvest'}
              subtitle={species}
              height="280px"
            />
          </div>
        </div>

        {/* Card 3: Image Upload */}
        <div className="bg-botani-surface p-8 rounded-3xl border border-botani-border shadow-card space-y-6">
          <div className="pb-4 border-b border-botani-border">
            <h2 className="font-serif text-2xl font-bold text-botani-text">3. Herb Harvest Image</h2>
            <p className="text-xs text-botani-muted mt-1">
              Upload photograph of harvested plant material for visual authenticity validation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* File Dropzone */}
            <div className="relative border-2 border-dashed border-botani-border hover:border-botani-green p-6 rounded-2xl text-center bg-botani-bg transition-colors cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <Upload className="w-8 h-8 text-botani-muted group-hover:text-botani-green mx-auto mb-2 transition-colors" />
              <div className="text-xs font-semibold text-botani-text group-hover:text-botani-green">
                Click or drop photo here
              </div>
              <div className="text-[11px] text-botani-muted mt-1">PNG, JPG, WEBP</div>
            </div>

            {/* Image Preview */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-botani-muted">
                Image Preview
              </div>
              <div className="h-40 rounded-2xl overflow-hidden border border-botani-border bg-botani-bg relative flex items-center justify-center text-botani-muted text-xs">
                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt="Harvest preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>No image uploaded yet</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Form Action Submit */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3.5 rounded-full border border-botani-border text-botani-text hover:bg-botani-bg text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full bg-botani-green hover:bg-botani-green-dark text-white font-medium text-sm shadow-elevated flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving to Firebase...' : 'Generate & Save Batch'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
