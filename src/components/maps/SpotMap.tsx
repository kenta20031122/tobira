'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcons } from '@/lib/leaflet-icon-fix';
import type { Spot } from '@/types';

type Props = {
  spot: Pick<Spot, 'name' | 'lat' | 'lng' | 'address'>;
};

export default function SpotMap({ spot }: Props) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[spot.lat, spot.lng]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[spot.lat, spot.lng]}>
        <Popup>
          <strong>{spot.name}</strong>
          <br />
          {spot.address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
