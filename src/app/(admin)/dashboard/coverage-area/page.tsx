"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getStoreAction, updateStoreCoverageAction } from "@/app/_actions/store-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";
import { DEFAULT_COVERAGE_POLYGON } from "@/config/geo";
import "leaflet/dist/leaflet.css";

function MapLoader() {
  const { t } = useTranslations();
  return <p>{t("admin.coverage.loadingMap")}</p>;
}

const CoverageMap = dynamic(
  () => import("@/app/(admin)/dashboard/coverage-area/_components/CoverageMap"),
  { ssr: false, loading: () => <MapLoader /> },
);

export default function CoverageAreaPage() {
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();
  const [storeName, setStoreName] = useState(() => t("admin.coverage.defaultStoreName"));
  const [storeId, setStoreId] = useState<string | undefined>();
  const [polygon, setPolygon] = useState<[number, number][]>(DEFAULT_COVERAGE_POLYGON);

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
    <AdminShell title={t("admin.coverage.title")}>
      <p className="mb-4 text-sm text-zinc-600">{t("admin.coverage.hint")}</p>
      <input
        className="mb-4 w-full max-w-md rounded border px-3 py-2"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        placeholder={t("admin.coverage.storeNamePlaceholder")}
      />
      <CoverageMap points={polygon} onChange={setPolygon} />
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          loading={isPending}
          loadingLabel={t("common.saving")}
          disabled={polygon.length < 3}
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
                successMessage: t("notifications.coverageSaved"),
                onSuccess: (store) => {
                  if (store?.id) setStoreId(store.id);
                },
              },
            )
          }
        >
          {t("admin.coverage.save")}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setPolygon([])}>
          {t("admin.coverage.clear")}
        </Button>
      </div>
    </AdminShell>
  );
}
