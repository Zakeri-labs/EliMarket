"use client";

import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from "react-leaflet";

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
    <div className="h-[420px] overflow-hidden rounded-xl border">
      <MapContainer center={center} zoom={12} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler points={points} onChange={onChange} />
        {points.length >= 3 && (
          <Polygon positions={points} pathOptions={{ color: "#059669" }} />
        )}
        {points.map((p, i) => (
          <Marker key={`${p[0]}-${p[1]}-${i}`} position={p} />
        ))}
      </MapContainer>
    </div>
  );
}
