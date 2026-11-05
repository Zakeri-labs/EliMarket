"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { getStoreAction, updateStoreCoverageAction } from "@/app/_actions/store-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { ListError } from "@/app/(admin)/_components/ListControls";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";
import { DEFAULT_COVERAGE_POLYGON } from "@/config/geo";
import "leaflet/dist/leaflet.css";

function MapLoader() {
  const { t } = useTranslations();
  return <p className="grid h-[420px] place-items-center text-sm text-muted">{t("admin.coverage.loadingMap")}</p>;
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

  // Saving before this finished would create a second store with the default area.
  const [loadState, setLoadState] = useState<"loading" | "ready" | "failed">("loading");
  const [loadMessage, setLoadMessage] = useState("");

  const load = useCallback(() => {
    getStoreAction()
      .then((r) => {
        if (!r.success) {
          setLoadMessage(r.error);
          setLoadState("failed");
          return;
        }
        if (r.data) {
          setStoreName(r.data.name);
          setStoreId(r.data.id);
          try {
            const geo = typeof r.data.coverage_area === "string"
              ? JSON.parse(r.data.coverage_area)
              : r.data.coverage_area;
            const coords = geo?.coordinates?.[0] as [number, number][] | undefined;
            if (coords?.length) {
              // GeoJSON repeats the first point at the end; saving adds it back.
              const first = coords[0];
              const last = coords[coords.length - 1];
              const open = first[0] === last[0] && first[1] === last[1] ? coords.slice(0, -1) : coords;
              setPolygon(open.map(([lng, lat]) => [lat, lng] as [number, number]));
            }
          } catch {
            // keep default
          }
        }
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        setLoadMessage(error instanceof Error ? error.message : "");
        setLoadState("failed");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminShell title={t("admin.coverage.title")}>
      <p className="mb-4 text-sm text-muted">{t("admin.coverage.hint")}</p>
      {loadState === "failed" ? (
        <div className="mb-4">
          <ListError
            error={new Error(loadMessage)}
            onRetry={() => {
              setLoadState("loading");
              load();
            }}
          />
        </div>
      ) : null}
      <div className="admin-card p-4">
      <input
        className="mb-4 w-full max-w-md rounded-xl border border-input bg-card px-3.5 py-2"
        aria-label={t("admin.coverage.storeNamePlaceholder")}
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        placeholder={t("admin.coverage.storeNamePlaceholder")}
      />
      {loadState === "ready" ? (
        <CoverageMap points={polygon} onChange={setPolygon} />
      ) : loadState === "loading" ? (
        <div className="h-[420px] animate-pulse rounded-xl bg-[var(--skeleton)]" aria-hidden />
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          loading={isPending}
          loadingLabel={t("common.saving")}
          disabled={polygon.length < 3 || loadState !== "ready"}
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
      </div>
    </AdminShell>
  );
}
