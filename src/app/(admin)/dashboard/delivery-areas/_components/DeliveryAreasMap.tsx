"use client";

import L from "leaflet";
import {
  Circle,
  GeoJSON as GeoJsonLayer,
  MapContainer,
  Marker,
  Polygon,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { AreaBoundary, DeliveryArea } from "@/app/_types/database.types";
import { DEFAULT_MAP_CENTER } from "@/config/geo";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

export type AreaDraft = {
  /** Manually placed / edited polygon vertices (Leaflet [lat,lng]); 0..n points. */
  ring: [number, number][];
  /** A boundary fetched from OSM, shown when `ring` is empty (may be a MultiPolygon). */
  boundary: AreaBoundary | null;
  center: LatLng | null;
  radiusKm: number;
  drawing: boolean;
};

const vertexIcon = L.divIcon({
  className: "",
  html: '<div style="width:12px;height:12px;background:#0d9488;border:2px solid #fff;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.45)"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const centerIcon = L.divIcon({
  className: "",
  html: '<div style="width:16px;height:16px;background:#f59e0b;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const TEAL = "#0d9488";
const GREY = "#9ca3af";

/** GeoJSON Polygon ([lng,lat] rings) → Leaflet [lat,lng] outer ring, closing point dropped. */
export function boundaryToLatLngs(b: AreaBoundary | null): [number, number][] {
  if (!b || b.type !== "Polygon") return [];
  const ring = (b.coordinates[0] ?? []).map(([lng, lat]) => [lat, lng] as [number, number]);
  if (ring.length > 1) {
    const [f0, f1] = ring[0];
    const [l0, l1] = ring[ring.length - 1];
    if (f0 === l0 && f1 === l1) ring.pop();
  }
  return ring;
}

/** Leaflet [lat,lng] ring → closed GeoJSON Polygon. */
export function latLngsToBoundary(points: [number, number][]): AreaBoundary | null {
  if (points.length < 3) return null;
  const ring = points.map(([lat, lng]) => [lng, lat] as [number, number]);
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx !== lx || fy !== ly) ring.push([fx, fy]);
  return { type: "Polygon", coordinates: [ring] };
}

function boundaryKey(b: AreaBoundary | null): string {
  return b ? `${b.type}:${JSON.stringify(b.coordinates).length}` : "none";
}

function areaCenter(area: DeliveryArea): [number, number] | null {
  if (area.center_lat != null && area.center_lng != null) {
    return [area.center_lat, area.center_lng];
  }
  const ll = boundaryToLatLngs(area.boundary);
  return ll[0] ?? null;
}

function ClickBridge({ onClick }: { onClick?: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

type Props = {
  areas: DeliveryArea[];
  editingId?: string | null;
  draft?: AreaDraft;
  onAreaClick?: (id: string) => void;
  /** Overview: create an area here. Edit + drawing: append a polygon vertex here. */
  onMapClick?: (p: LatLng) => void;
  onVertexMove?: (index: number, p: LatLng) => void;
  onCenterMove?: (p: LatLng) => void;
  height?: number;
};

export default function DeliveryAreasMap({
  areas,
  editingId,
  draft,
  onAreaClick,
  onMapClick,
  onVertexMove,
  onCenterMove,
  height = 380,
}: Props) {
  const editing = editingId ? areas.find((a) => a.id === editingId) ?? null : null;
  const draftRing = draft?.ring ?? [];
  const initialCenter: [number, number] =
    draftRing[0] ||
    (draft?.center && [draft.center.lat, draft.center.lng]) ||
    (editing && areaCenter(editing)) ||
    (areas.length ? areaCenter(areas[0]) : null) ||
    [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  return (
    <div className="overflow-hidden rounded-xl border border-[#e4e4e7]" style={{ height }}>
      <MapContainer center={initialCenter} zoom={12} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickBridge onClick={onMapClick} />

        {areas.map((area) => {
          if (area.id === editingId) return null;
          const color = area.serviceable ? TEAL : GREY;
          const opts = {
            color,
            weight: 1,
            fillOpacity: area.active ? 0.12 : 0.04,
            dashArray: area.active ? undefined : "4",
          };
          if (area.boundary) {
            return (
              <GeoJsonLayer
                key={`${area.id}-${boundaryKey(area.boundary)}`}
                data={area.boundary as GeoJSON.GeoJsonObject}
                pathOptions={opts}
                eventHandlers={{ click: () => onAreaClick?.(area.id) }}
              />
            );
          }
          const c = areaCenter(area);
          if (!c) return null;
          return (
            <Circle
              key={area.id}
              center={c}
              radius={Number(area.radius_km) * 1000}
              pathOptions={opts}
              eventHandlers={{ click: () => onAreaClick?.(area.id) }}
            />
          );
        })}

        {editingId && draft ? (
          <>
            {draftRing.length >= 3 ? (
              <Polygon
                positions={draftRing}
                pathOptions={{ color: TEAL, weight: 2, fillOpacity: 0.2 }}
              />
            ) : draft.boundary ? (
              <GeoJsonLayer
                key={boundaryKey(draft.boundary)}
                data={draft.boundary as GeoJSON.GeoJsonObject}
                pathOptions={{ color: TEAL, weight: 2, fillOpacity: 0.2 }}
              />
            ) : draft.center ? (
              <Circle
                center={[draft.center.lat, draft.center.lng]}
                radius={draft.radiusKm * 1000}
                pathOptions={{ color: TEAL, weight: 2, fillOpacity: 0.15 }}
              />
            ) : null}

            {draft.drawing
              ? draftRing.map((p, i) => (
                  <Marker
                    key={`v-${i}`}
                    position={p}
                    icon={vertexIcon}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const ll = (e.target as L.Marker).getLatLng();
                        onVertexMove?.(i, { lat: ll.lat, lng: ll.lng });
                      },
                    }}
                  />
                ))
              : null}

            {draft.center ? (
              <Marker
                position={[draft.center.lat, draft.center.lng]}
                icon={centerIcon}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const ll = (e.target as L.Marker).getLatLng();
                    onCenterMove?.({ lat: ll.lat, lng: ll.lng });
                  },
                }}
              />
            ) : null}
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
