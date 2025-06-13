// Map.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ position, onPositionChange }) => {
  const map = useMap();
  const markerRef = React.useRef(null);

  React.useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }
    }
  }, [position, map]);

  return position ? (
    <Marker
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            onPositionChange(newPos);
          }
        }
      }}
    >
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

const MapClickHandler = ({ onClick }) => {
  const map = useMap();
  React.useEffect(() => {
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);
  return null;
};

const Map = ({ position, onPositionChange }) => {
  const handleMapClick = (e) => {
    onPositionChange(e.latlng);
  };

  return (
    <MapContainer
      center={position || [9.046599, 38.763332]}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClickHandler onClick={handleMapClick} />
      {position && (
        <LocationMarker 
          position={position} 
          onPositionChange={onPositionChange} 
        />
      )}
    </MapContainer>
  );
};

export default Map;