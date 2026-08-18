"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getStoreAction, updateStoreCoverageAction } from "@/app/_actions/store-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import "leaflet/dist/leaflet.css";

const CoverageMap = dynamic(
  () => import("@/app/(admin)/dashboard/coverage-area/_components/CoverageMap"),
  { ssr: false, loading: () => <p>بارگذاری نقشه…</p> },
);

export default function CoverageAreaPage() {
  const { runAction, isPending } = useFormAction();
  const [storeName, setStoreName] = useState("فروشگاه مرکزی");
  const [storeId, setStoreId] = useState<string | undefined>();
  const [polygon, setPolygon] = useState<[number, number][]>([
    [35.70, 51.38],
    [35.70, 51.42],
    [35.66, 51.42],
    [35.66, 51.38],
  ]);

  useEffect(() => {
    getStoreAction().then((r) => {
      if (r.success && r.data) {
        setStoreName(r.data.name);
        setStoreId(r.data.id);
        try {
          const geo = typeof r.data.coverage_area === "string"
            ? JSON.parse(r.data.coverage_area)
            : r.data.coverage_area;
          const coords = geo?.coordinates?.[0] as [number, number][] | undefined;
          if (coords?.length) {
            setPolygon(coords.map(([lng, lat]) => [lat, lng] as [number, number]));
          }
        } catch {
          // keep default
        }
      }
    });
  }, []);

  return (
    <AdminShell title="محدوده پوشش">
      <p className="mb-4 text-sm text-zinc-600">
        روی نقشه کلیک کنید تا رئوس چندضلعی را اضافه کنید. حداقل ۳ نقطه لازم است.
      </p>
      <input
        className="mb-4 w-full max-w-md rounded border px-3 py-2"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        placeholder="نام فروشگاه"
      />
      <CoverageMap points={polygon} onChange={setPolygon} />
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          disabled={isPending || polygon.length < 3}
          onClick={() =>
            runAction(
              () =>
                updateStoreCoverageAction({
                  storeId,
                  name: storeName,
                  coverageGeoJson: {
                    type: "Polygon",
                    coordinates: [[...polygon.map(([lat, lng]) => [lng, lat]), [polygon[0][1], polygon[0][0]]]],
                  },
                }),
              {
                successMessage: "محدوده ذخیره شد",
                onSuccess: (store) => {
                  if (store?.id) setStoreId(store.id);
                },
              },
            )
          }
        >
          ذخیره محدوده
        </Button>
        <Button type="button" variant="secondary" onClick={() => setPolygon([])}>
          پاک کردن
        </Button>
      </div>
    </AdminShell>
  );
}
