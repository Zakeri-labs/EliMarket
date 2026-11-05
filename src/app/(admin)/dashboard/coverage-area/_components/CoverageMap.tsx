"use client";

import L from "leaflet";
import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from "react-leaflet";

// Leaflet's default marker images are not served by the bundled app.
const pointIcon = L.divIcon({
  className: "",
  html: '<div style="width:12px;height:12px;background:#0f766e;border:2px solid #fff;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.45)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

type Props = {
  points: [number, number][];
  onChange: (points: [number, number][]) => void;
};

function ClickHandler({ onChange, points }: Props) {
  useMapEvents({
    click(e) {
      onChange([...points, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return null;
}

export default function CoverageMap({ points, onChange }: Props) {
  const center: [number, number] = points[0] ?? [23.588, 58.3829];

  return (
    <div className="h-[420px] overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={12} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler points={points} onChange={onChange} />
        {points.length >= 3 && (
          <Polygon positions={points} pathOptions={{ color: "#0f766e", weight: 2, fillOpacity: 0.2 }} />
        )}
        {points.map((p, i) => (
          <Marker key={`${p[0]}-${p[1]}-${i}`} position={p} icon={pointIcon} interactive={false} keyboard={false} />
        ))}
      </MapContainer>
    </div>
  );
}
