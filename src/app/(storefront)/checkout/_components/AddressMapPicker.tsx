"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import { mapPinIcon } from "@/lib/map-pin";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { reverseGeocodeAction, searchAddressAction } from "@/app/_actions/address-actions";
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; lat: number; lng: number }[] | null>(null);
  // Ignore stale reverse-geocode responses when the user clicks again quickly.
  const requestId = useRef(0);

  const center: [number, number] = [
    lat || DEFAULT_MAP_CENTER.lat,
    lng || DEFAULT_MAP_CENTER.lng,
  ];

  const locateLabel =
    lang === "fa" ? "موقعیت من" : lang === "ar" ? "موقعي" : "Use my location";

  const searchPlaceholder =
    lang === "fa" ? "جستجوی آدرس…" : lang === "ar" ? "ابحث عن عنوان…" : "Search address…";
  const noResultsLabel =
    lang === "fa" ? "نتیجه‌ای پیدا نشد" : lang === "ar" ? "لا توجد نتائج" : "No results";

  const search = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (query.trim().length < 3) return;
    searchAddressAction(query, lang).then((r) => {
      setResults(r.success ? r.data : []);
    });
  };

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
      <div className="absolute inset-x-2 top-2 z-[1000] me-11">
        <input
          type="search"
          value={query}
          onKeyDown={(e) => {
            // Not a <form>: the picker lives inside the checkout/address forms.
            if (e.key === "Enter") search(e);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setResults(null);
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground shadow-md outline-none placeholder:text-muted"
        />
        {results ? (
          <ul className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
            {results.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted">{noResultsLabel}</li>
            ) : (
              results.map((r) => (
                <li key={`${r.lat},${r.lng}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setResults(null);
                      setQuery(r.label);
                      handlePick(r.lat, r.lng);
                    }}
                    className="block w-full truncate px-3 py-2 text-start text-xs text-foreground hover:bg-surface-elevated"
                  >
                    {r.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
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
