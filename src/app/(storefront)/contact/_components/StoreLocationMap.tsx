"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { cn } from "@/app/utils/cn";
import { STORE_LOCATION } from "@/config/store-location";

const pin = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#2dd4bf;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 6px rgba(0,0,0,.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function StoreLocationMap({ className }: { className?: string }) {
  const { lat, lng } = STORE_LOCATION.coordinates;
  const center: [number, number] = [lat, lng];

  return (
    <MapContainer
      center={center}
      zoom={17}
      className={cn("h-72 w-full min-h-72", className)}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={pin} />
    </MapContainer>
  );
}
