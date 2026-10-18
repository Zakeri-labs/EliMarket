"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { mapPinIcon } from "@/lib/map-pin";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { reverseGeocodeAction } from "@/app/_actions/address-actions";
import { DEFAULT_MAP_CENTER } from "@/config/geo";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  /** Called with a human-readable street address after the pin moves. */
  onResolveAddress?: (text: string) => void;
  /** Locale for the reverse-geocode lookup (fa | ar | en). */
  lang?: string;
  /** Shown as an overlay while the address is being looked up. */
  resolvingLabel?: string;
};

function ClickSet({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
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

export default function AddressMapPicker({
  lat,
  lng,
  onChange,
  onResolveAddress,
  lang,
  resolvingLabel,
}: Props) {
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  // Ignore stale reverse-geocode responses when the user clicks again quickly.
  const requestId = useRef(0);

  const center: [number, number] = [
    lat || DEFAULT_MAP_CENTER.lat,
    lng || DEFAULT_MAP_CENTER.lng,
  ];

  const locateLabel =
    lang === "fa" ? "موقعیت من" : lang === "ar" ? "موقعي" : "Use my location";

  // The browser shows its own permission prompt on the first call.
  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        handlePick(pos.coords.latitude, pos.coords.longitude);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handlePick = (nextLat: number, nextLng: number) => {
    onChange(nextLat, nextLng);
    if (!onResolveAddress) return;
    const id = ++requestId.current;
    setResolving(true);
    reverseGeocodeAction(nextLat, nextLng, lang)
      .then((r) => {
        if (id !== requestId.current) return;
        if (r.success && r.data) onResolveAddress(r.data);
      })
      .finally(() => {
        if (id === requestId.current) setResolving(false);
      });
  };

  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickSet onPick={handlePick} />
        <Recenter lat={center[0]} lng={center[1]} />
        <Marker position={center} icon={mapPinIcon} />
      </MapContainer>
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        title={locateLabel}
        aria-label={locateLabel}
        className="absolute end-2 top-2 z-[1000] flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-md transition-colors hover:bg-surface-elevated disabled:opacity-60"
      >
        <LocateFixed className={locating ? "size-5 animate-pulse" : "size-5"} aria-hidden />
      </button>
      {resolving && resolvingLabel ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] bg-surface/90 px-3 py-1.5 text-center text-xs text-muted">
          {resolvingLabel}
        </div>
      ) : null}
    </div>
  );
}
