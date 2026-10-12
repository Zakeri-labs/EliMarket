// Leaflet-free helpers/types, so the page can import them without pulling
// Leaflet (which needs `window`) into server rendering.
import type { AreaBoundary } from "@/app/_types/database.types";

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
