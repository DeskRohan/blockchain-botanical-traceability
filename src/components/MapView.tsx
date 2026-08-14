import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix standard Leaflet default marker icons for Vite bundlers
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  latitude: number;
  longitude: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  title?: string;
  subtitle?: string;
  height?: string;
}

// Controller component to re-center map when lat/lng change dynamically
const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

// Component to handle map clicks for coordinate selection
const LocationPickerMarker: React.FC<{
  onSelect?: (lat: number, lng: number) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  interactive = false,
  onLocationSelect,
  title,
  subtitle,
  height = '320px',
}) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-botani-border shadow-sm">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={interactive}
        style={{ height, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={latitude} lng={longitude} />
        {interactive && <LocationPickerMarker onSelect={onLocationSelect} />}
        
        <Marker position={position} icon={customMarkerIcon}>
          {title && (
            <Popup>
              <div className="p-1">
                <div className="font-semibold text-sm text-botani-text">{title}</div>
                {subtitle && <div className="text-xs text-botani-muted italic">{subtitle}</div>}
                <div className="text-[11px] text-botani-green font-mono mt-1">
                  GPS: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>

      {interactive && (
        <div className="absolute top-3 right-3 z-[400] bg-botani-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-botani-border text-xs text-botani-muted shadow-sm">
          Click map to adjust GPS pin
        </div>
      )}
    </div>
  );
};
