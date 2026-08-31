"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { DEFAULT_MAP_CENTER } from "@/config/geo";
import { resolveDeliveryAreaName } from "@/lib/i18n/delivery-area-name";
import type { Locale } from "@/i18n/config";
import type { DeliveryArea } from "@/app/_types/database.types";

export type MapDraft = { lat: number; lng: number; radiusKm: number };

type Props = {
  areas: DeliveryArea[];
  locale: Locale;
  selectedId: string | null;
  /** The area currently being created/edited — a draggable pin + live circle. */
  draft: MapDraft | null;
  onSelectArea: (area: DeliveryArea) => void;
  /** Map background click: move the draft pin, or (no draft) start a new area here. */
  onMapClick: (lat: number, lng: number) => void;
  onDraftMove: (lat: number, lng: number) => void;
};

const COLORS = {
  selected: "#0d9488",
  serviceable: "#10b981",
  idle: "#a1a1aa",
} as const;

function dot(color: string, ring = false) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)${
      ring ? ",0 0 0 4px rgba(13,148,136,.35)" : ""
    }"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function ClickHandler({ onMapClick }: { onMapClick: Props["onMapClick"] }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
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

export default function DeliveryAreasMap({
  areas,
  locale,
  selectedId,
  draft,
  onSelectArea,
  onMapClick,
  onDraftMove,
}: Props) {
  const placed = useMemo(
    () => areas.filter((a) => a.center_lat != null && a.center_lng != null),
    [areas],
  );

  const focus: [number, number] = draft
    ? [draft.lat, draft.lng]
    : placed[0]
      ? [placed[0].center_lat as number, placed[0].center_lng as number]
      : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  return (
    <div className="h-[420px] overflow-hidden rounded-xl border border-[#e4e4e7]">
      <MapContainer center={focus} zoom={11} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} />
        {draft ? <Recenter lat={draft.lat} lng={draft.lng} /> : null}

        {placed.map((area) => {
          const isSelected = area.id === selectedId;
          const color = isSelected
            ? COLORS.selected
            : area.serviceable
              ? COLORS.serviceable
              : COLORS.idle;
          const center: [number, number] = [
            area.center_lat as number,
            area.center_lng as number,
          ];
          return (
            <Circle
              key={area.id}
              center={center}
              radius={Number(area.radius_km) * 1000}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 0.22 : 0.12,
                weight: isSelected ? 2 : 1,
                dashArray: area.active ? undefined : "4 4",
              }}
              eventHandlers={{ click: () => onSelectArea(area) }}
            >
              <Tooltip>{resolveDeliveryAreaName(area, locale)}</Tooltip>
            </Circle>
          );
        })}

        {placed
          .filter((area) => area.id !== selectedId || !draft)
          .map((area) => (
            <Marker
              key={`pin-${area.id}`}
              position={[area.center_lat as number, area.center_lng as number]}
              icon={dot(
                area.id === selectedId
                  ? COLORS.selected
                  : area.serviceable
                    ? COLORS.serviceable
                    : COLORS.idle,
              )}
              eventHandlers={{ click: () => onSelectArea(area) }}
            />
          ))}

        {draft ? (
          <>
            <Circle
              center={[draft.lat, draft.lng]}
              radius={Math.max(draft.radiusKm, 0.1) * 1000}
              pathOptions={{
                color: COLORS.selected,
                fillColor: COLORS.selected,
                fillOpacity: 0.25,
                weight: 2,
              }}
            />
            <Marker
              position={[draft.lat, draft.lng]}
              draggable
              icon={dot(COLORS.selected, true)}
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onDraftMove(lat, lng);
                },
              }}
            />
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
