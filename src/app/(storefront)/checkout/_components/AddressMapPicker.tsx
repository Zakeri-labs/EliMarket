"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { DEFAULT_MAP_CENTER } from "@/config/geo";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

function ClickSet({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function AddressMapPicker({ lat, lng, onChange }: Props) {
  const center: [number, number] = [
    lat || DEFAULT_MAP_CENTER.lat,
    lng || DEFAULT_MAP_CENTER.lng,
  ];

  return (
    <div className="h-56 overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickSet onChange={onChange} />
        <Recenter lat={center[0]} lng={center[1]} />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
}
