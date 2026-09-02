"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import {
  createDeliveryAreaAction,
  deleteDeliveryAreaAction,
  fetchAreaBoundaryAction,
  getAdminDeliveryAreasAction,
  updateDeliveryAreaAction,
} from "@/app/_actions/delivery-area-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppIcon } from "@/components/icons/AppIcon";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { resolveDeliveryAreaName } from "@/lib/i18n/delivery-area-name";
import { useTranslations } from "@/i18n/use-translations";
import { LOCALES, LOCALE_LABELS, getDirection, type Locale } from "@/i18n/config";
import type { AreaBoundary, DeliveryArea } from "@/app/_types/database.types";
import {
  boundaryToLatLngs,
  latLngsToBoundary,
  type AreaDraft,
  type LatLng,
} from "@/app/(admin)/dashboard/delivery-areas/_components/DeliveryAreasMap";

const DeliveryAreasMap = dynamic(
  () => import("@/app/(admin)/dashboard/delivery-areas/_components/DeliveryAreasMap"),
  { ssr: false, loading: () => <MapLoading /> },
);

function MapLoading() {
  const { t } = useTranslations();
  return (
    <div className="flex h-[380px] items-center justify-center rounded-xl border border-[#e4e4e7] bg-[#fafafa] text-sm text-[#71717a]">
      {t("admin.coverage.loadingMap")}
    </div>
  );
}

type FormValues = {
  slug: string;
  name_fa: string;
  name_ar?: string;
  name_en?: string;
  serviceable: boolean;
  active: boolean;
  sort_order: number;
  center_lat?: number | null;
  center_lng?: number | null;
  radius_km: number;
  delivery_fee?: number | null;
  min_order?: number | null;
  eta_minutes?: number | null;
};

const DEFAULT_FORM_VALUES: FormValues = {
  slug: "",
  name_fa: "",
  name_ar: "",
  name_en: "",
  serviceable: false,
  active: true,
  sort_order: 0,
  center_lat: null,
  center_lng: null,
  radius_km: 2.5,
  delivery_fee: null,
  min_order: null,
  eta_minutes: null,
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
const nullableNumber = z.number().nonnegative().nullable().optional();
const toNum = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

/** Rough centroid of a boundary, for the center pin / radius fallback. */
function boundaryCentroid(b: AreaBoundary | null): LatLng | null {
  if (!b) return null;
  if (b.type === "Polygon") {
    const ring = boundaryToLatLngs(b);
    if (!ring.length) return null;
    const s = ring.reduce((acc, [la, ln]) => [acc[0] + la, acc[1] + ln], [0, 0]);
    return { lat: s[0] / ring.length, lng: s[1] / ring.length };
  }
  const first = b.coordinates?.[0]?.[0]?.[0];
  return first ? { lat: first[1], lng: first[0] } : null;
}

export default function AdminDeliveryAreasPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending, notifyError } = useFormAction();
  const [editing, setEditing] = useState<DeliveryArea | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nameTab, setNameTab] = useState<Locale>("fa");
  /** Manually drawn/edited polygon vertices. */
  const [ring, setRing] = useState<[number, number][]>([]);
  /** Boundary fetched from OSM (kept as-is; Polygons get moved into `ring` for editing). */
  const [osmBoundary, setOsmBoundary] = useState<AreaBoundary | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [osmQuery, setOsmQuery] = useState("");

  const effectiveBoundary: AreaBoundary | null =
    ring.length >= 3 ? latLngsToBoundary(ring) : osmBoundary;

  const schema = z.object({
    slug: z.string().min(1, t("admin.deliveryAreas.validationSlug")),
    name_fa: z.string().min(1, t("admin.deliveryAreas.validationName")),
    name_ar: z.string().optional(),
    name_en: z.string().optional(),
    serviceable: z.boolean(),
    active: z.boolean(),
    sort_order: z.number().int().min(0),
    center_lat: nullableNumber,
    center_lng: nullableNumber,
    radius_km: z.number().positive(),
    delivery_fee: nullableNumber,
    min_order: nullableNumber,
    eta_minutes: nullableNumber,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { data: areas, isPending } = useQuery({
    queryKey: ["admin-delivery-areas"],
    queryFn: async () => {
      const result = await getAdminDeliveryAreasAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    if (!editing) return;
    form.reset({
      slug: editing.slug,
      name_fa: editing.name_fa,
      name_ar: editing.name_ar ?? "",
      name_en: editing.name_en ?? "",
      serviceable: editing.serviceable,
      active: editing.active,
      sort_order: editing.sort_order,
      center_lat: editing.center_lat,
      center_lng: editing.center_lng,
      radius_km: Number(editing.radius_km) || 2.5,
      delivery_fee: editing.delivery_fee,
      min_order: editing.min_order,
      eta_minutes: editing.eta_minutes,
    });
    if (editing.boundary?.type === "Polygon") {
      setRing(boundaryToLatLngs(editing.boundary));
      setOsmBoundary(null);
    } else {
      setRing([]);
      setOsmBoundary(editing.boundary);
    }
    setDrawing(false);
    setOsmQuery(editing.name_en || editing.name_fa || "");
  }, [editing, form]);

  const watchLat = form.watch("center_lat");
  const watchLng = form.watch("center_lng");
  const watchRadius = form.watch("radius_km");

  const draft: AreaDraft = {
    ring,
    boundary: osmBoundary,
    center:
      watchLat != null && watchLng != null
        ? { lat: Number(watchLat), lng: Number(watchLng) }
        : null,
    radiusKm: Number(watchRadius) || 2.5,
    drawing,
  };

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-delivery-areas"] });
    void queryClient.invalidateQueries({ queryKey: ["delivery-areas"] });
  };

  const resetShape = () => {
    setRing([]);
    setOsmBoundary(null);
    setDrawing(false);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setNameTab("fa");
    resetShape();
    setOsmQuery("");
    form.reset(DEFAULT_FORM_VALUES);
  };

  const openCreate = (at?: LatLng) => {
    setEditing(null);
    setNameTab("fa");
    resetShape();
    setOsmQuery("");
    form.reset({
      ...DEFAULT_FORM_VALUES,
      center_lat: at?.lat ?? null,
      center_lng: at?.lng ?? null,
    });
    setFormOpen(true);
  };

  const openEdit = (area: DeliveryArea) => {
    setEditing(area);
    setNameTab("fa");
    setFormOpen(true);
  };

  const setCenter = (p: LatLng) => {
    form.setValue("center_lat", Number(p.lat.toFixed(6)));
    form.setValue("center_lng", Number(p.lng.toFixed(6)));
  };

  const handleMapClick = (p: LatLng) => {
    if (!formOpen) {
      openCreate(p);
      return;
    }
    if (drawing) {
      setRing((prev) => [...prev, [p.lat, p.lng]]);
    } else {
      setCenter(p);
    }
  };

  const handleVertexMove = (index: number, p: LatLng) => {
    setRing((prev) => prev.map((pt, i) => (i === index ? [p.lat, p.lng] : pt)));
  };

  const toggleDrawing = () => {
    setDrawing((on) => {
      const next = !on;
      // Entering draw mode with an OSM Polygon loaded → move its vertices into `ring` to edit.
      if (next && ring.length === 0 && osmBoundary?.type === "Polygon") {
        setRing(boundaryToLatLngs(osmBoundary));
        setOsmBoundary(null);
      }
      return next;
    });
  };

  const fetchBoundary = () => {
    runAction(() => fetchAreaBoundaryAction(osmQuery), {
      onSuccess: (data) => {
        if (data?.boundary) {
          setRing([]);
          setOsmBoundary(data.boundary);
          setDrawing(false);
        } else {
          notifyError(t("admin.deliveryAreas.boundaryMissing"));
        }
        if (data?.center) setCenter(data.center);
      },
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    const centroid = boundaryCentroid(effectiveBoundary);
    const payload = {
      slug: values.slug.trim(),
      name_fa: values.name_fa.trim(),
      name_ar: values.name_ar?.trim() || null,
      name_en: values.name_en?.trim() || null,
      serviceable: values.serviceable,
      active: values.active,
      sort_order: values.sort_order,
      center_lat: values.center_lat ?? centroid?.lat ?? null,
      center_lng: values.center_lng ?? centroid?.lng ?? null,
      radius_km: values.radius_km,
      boundary: effectiveBoundary,
      delivery_fee: values.delivery_fee ?? null,
      min_order: values.min_order ?? null,
      eta_minutes: values.eta_minutes ?? null,
    };

    if (editing) {
      runAction(() => updateDeliveryAreaAction(editing.id, payload), {
        successMessage: t("notifications.deliveryAreaUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createDeliveryAreaAction(payload), {
        successMessage: t("notifications.deliveryAreaCreated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    }
  });

  const inputClass = "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";
  const nameField = nameTab === "fa" ? "name_fa" : nameTab === "ar" ? "name_ar" : "name_en";
  const hasShape = ring.length >= 3 || Boolean(osmBoundary);

  return (
    <AdminShell
      title={t("admin.deliveryAreas.title")}
      subtitle={t("admin.deliveryAreas.subtitle")}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[#71717a]">{t("admin.deliveryAreas.mapHint")}</p>
          <Button type="button" size="sm" onClick={() => openCreate()}>
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.deliveryAreas.newArea")}
          </Button>
        </div>

        {!isPending && areas ? (
          <DeliveryAreasMap
            areas={areas}
            onAreaClick={(id) => {
              const area = areas.find((a) => a.id === id);
              if (area && !formOpen) openEdit(area);
            }}
            onMapClick={handleMapClick}
          />
        ) : (
          <MapLoading />
        )}

        {isPending ? (
          <ul className="space-y-2">
            {SKELETON_KEYS.map((key) => (
              <li key={key} className="h-14 animate-pulse rounded-xl border border-[#e4e4e7] bg-white" />
            ))}
          </ul>
        ) : areas?.length ? (
          <ul className="space-y-2">
            {areas.map((area) => (
              <li
                key={area.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition-colors",
                  editing?.id === area.id ? "border-[#0d9488]" : "border-[#e4e4e7]",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                  onClick={() => openEdit(area)}
                  aria-label={t("admin.deliveryAreas.edit")}
                >
                  <span className="w-6 shrink-0 text-[11px] text-[#a1a1aa]">{area.sort_order}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#18181b]">
                      {resolveDeliveryAreaName(area, locale)}
                    </span>
                    <span className="truncate text-[11px] text-[#71717a]" dir="ltr">
                      {area.slug}
                      {area.boundary ? " · ▰" : area.center_lat != null ? " · ◯" : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      area.serviceable
                        ? "bg-[#0d9488]/12 text-[#0f766e]"
                        : "bg-[#f4f4f5] text-[#71717a]",
                    )}
                  >
                    {area.serviceable
                      ? t("admin.deliveryAreas.serviceableTag")
                      : t("admin.deliveryAreas.comingSoonTag")}
                  </span>
                  {!area.active ? (
                    <span className="shrink-0 rounded-full bg-[#fef2f2] px-2 py-0.5 text-[10px] font-medium text-[#b91c1c]">
                      {t("admin.deliveryAreas.hiddenTag")}
                    </span>
                  ) : null}
                </button>
                <RowIconActions
                  editLabel={t("admin.deliveryAreas.edit")}
                  deleteLabel={t("admin.deliveryAreas.delete")}
                  onEdit={() => openEdit(area)}
                  onDelete={() =>
                    runAction(() => deleteDeliveryAreaAction(area.id), {
                      successMessage: t("notifications.deliveryAreaDeleted"),
                      onSuccess: () => {
                        if (editing?.id === area.id) closeForm();
                        refetch();
                      },
                    })
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white px-4 py-10 text-center text-sm text-[#71717a]">
            {t("admin.deliveryAreas.empty")}
          </p>
        )}

        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.deliveryAreas.editArea") : t("admin.deliveryAreas.newArea")}
          size="lg"
          busy={isActionPending}
          busyLabel={t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isActionPending}>
                {t("admin.deliveryAreas.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-delivery-area-form"
                loading={isActionPending}
                loadingLabel={t("common.saving")}
              >
                {editing ? t("admin.deliveryAreas.save") : t("admin.deliveryAreas.create")}
              </Button>
            </>
          }
        >
          <form id="admin-delivery-area-form" onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <div className="flex gap-1 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-1">
                {LOCALES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                      nameTab === loc
                        ? "bg-white text-[#18181b] shadow-sm"
                        : "text-[#71717a] hover:text-[#18181b]",
                    )}
                    onClick={() => setNameTab(loc)}
                  >
                    {LOCALE_LABELS[loc]}
                  </button>
                ))}
              </div>
              <input
                key={`name-${nameTab}`}
                {...form.register(nameField)}
                placeholder={t(
                  nameTab === "fa"
                    ? "admin.deliveryAreas.nameFaPlaceholder"
                    : nameTab === "ar"
                      ? "admin.deliveryAreas.nameArPlaceholder"
                      : "admin.deliveryAreas.nameEnPlaceholder",
                )}
                className={inputClass}
                dir={getDirection(nameTab)}
              />
              {form.formState.errors.name_fa ? (
                <p className="text-xs text-red-600">{form.formState.errors.name_fa.message}</p>
              ) : null}
              <p className="text-[11px] text-[#71717a]">{t("admin.deliveryAreas.nameLangHint")}</p>
            </div>

            <input
              {...form.register("slug")}
              placeholder={t("admin.deliveryAreas.slugPlaceholder")}
              className={inputClass}
              dir="ltr"
            />
            {form.formState.errors.slug ? (
              <p className="text-xs text-red-600">{form.formState.errors.slug.message}</p>
            ) : null}

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("serviceable")} />
                {t("admin.deliveryAreas.serviceableLabel")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("active")} />
                {t("admin.deliveryAreas.activeLabel")}
              </label>
            </div>

            {/* ---- Area shape (map) ---- */}
            <div className="space-y-2 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3">
              <p className="text-xs font-semibold text-[#18181b]">
                {t("admin.deliveryAreas.shapeLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  value={osmQuery}
                  onChange={(e) => setOsmQuery(e.target.value)}
                  placeholder={t("admin.deliveryAreas.osmLookupPlaceholder")}
                  className="min-w-0 flex-1 rounded-lg border border-[#e4e4e7] px-3 py-2 text-sm"
                  dir="ltr"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isActionPending || !osmQuery.trim()}
                  onClick={fetchBoundary}
                >
                  {t("admin.deliveryAreas.fetchBoundary")}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={drawing ? "primary" : "outline"}
                  onClick={toggleDrawing}
                >
                  {drawing ? t("admin.deliveryAreas.drawDone") : t("admin.deliveryAreas.drawStart")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={ring.length === 0}
                  onClick={() => setRing((prev) => prev.slice(0, -1))}
                >
                  {t("admin.deliveryAreas.removeLastPoint")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!hasShape && ring.length === 0}
                  onClick={() => {
                    setRing([]);
                    setOsmBoundary(null);
                  }}
                >
                  {t("admin.deliveryAreas.clearShape")}
                </Button>
              </div>
              <p className="text-[11px] text-[#71717a]">
                {drawing
                  ? t("admin.deliveryAreas.drawHint")
                  : hasShape
                    ? t("admin.deliveryAreas.boundaryFound")
                    : t("admin.deliveryAreas.radiusFallbackNote", { km: String(draft.radiusKm) })}
              </p>

              <DeliveryAreasMap
                key={editing?.id ?? "new"}
                areas={areas ?? []}
                editingId={editing?.id ?? "new"}
                draft={draft}
                onMapClick={handleMapClick}
                onVertexMove={handleVertexMove}
                onCenterMove={setCenter}
                height={320}
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <label className="text-[11px] text-[#71717a]">
                  {t("admin.deliveryAreas.latLabel")}
                  <input
                    {...form.register("center_lat", { setValueAs: toNum })}
                    type="number"
                    step="0.000001"
                    className={inputClass}
                    dir="ltr"
                  />
                </label>
                <label className="text-[11px] text-[#71717a]">
                  {t("admin.deliveryAreas.lngLabel")}
                  <input
                    {...form.register("center_lng", { setValueAs: toNum })}
                    type="number"
                    step="0.000001"
                    className={inputClass}
                    dir="ltr"
                  />
                </label>
                <label className="text-[11px] text-[#71717a]">
                  {t("admin.deliveryAreas.radiusLabel")}
                  <input
                    {...form.register("radius_km", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min={0.1}
                    className={inputClass}
                    dir="ltr"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.deliveryAreas.sortOrderLabel")}
              </label>
              <input
                {...form.register("sort_order", { valueAsNumber: true })}
                type="number"
                min={0}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-[#71717a]">
                  {t("admin.deliveryAreas.deliveryFeeLabel")}
                </label>
                <input
                  {...form.register("delivery_fee", { setValueAs: toNum })}
                  type="number"
                  min={0}
                  step="0.001"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#71717a]">
                  {t("admin.deliveryAreas.minOrderLabel")}
                </label>
                <input
                  {...form.register("min_order", { setValueAs: toNum })}
                  type="number"
                  min={0}
                  step="0.001"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#71717a]">
                  {t("admin.deliveryAreas.etaMinutesLabel")}
                </label>
                <input
                  {...form.register("eta_minutes", { setValueAs: toNum })}
                  type="number"
                  min={0}
                  step="1"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
