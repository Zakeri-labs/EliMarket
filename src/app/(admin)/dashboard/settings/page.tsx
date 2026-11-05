"use client";

import { Switch } from "@/components/ui/Switch";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { PriceVisibilityToggle } from "@/app/(admin)/_components/PriceVisibilityToggle";
import { ProductDetailExtrasToggle } from "@/app/(admin)/_components/ProductDetailExtrasToggle";
import { CashSurchargeSetting } from "@/app/(admin)/_components/CashSurchargeSetting";
import { ReceiptSettings } from "@/app/(admin)/_components/ReceiptSettings";
import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAiSettingsAction,
  updateAiSettingsAction,
} from "@/app/_actions/ai-settings-actions";
import { ListError } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useTranslations } from "@/i18n/use-translations";
import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_AI_STYLE,
  type AiSettings,
  type AiStyle,
} from "@/lib/ai/ai-config-defaults";

const QUERY_KEY = ["ai-settings"];

const inputClass =
  "min-h-10 w-full rounded-xl border border-input bg-white px-3.5 py-2 outline-none transition-[border-color,box-shadow] hover:border-accent/60 focus:border-accent focus:ring-4 focus:ring-accent/10";

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="admin-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {desc ? <p className="mt-0.5 text-xs text-muted">{desc}</p> : null}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 sm:max-w-sm">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
      <div role="group" aria-label={label} className="w-full sm:w-64 sm:shrink-0">{children}</div>
    </div>
  );
}

function NumberField({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <input
      aria-label={label}
      type="number"
      min={0}
      max={max}
      dir="ltr"
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.min(max, Math.floor(Number(e.target.value) || 0))))}
      className={inputClass}
    />
  );
}

function TextField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return <input dir="ltr" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
}

export default function AdminSettingsPage() {
  const { t } = useTranslations();
  const { runAction, isPending } = useFormAction();
  const queryClient = useQueryClient();
  const storeSettings = useStoreSettings();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await getAiSettingsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
  // `null` = show the persisted value; an object = the admin is editing.
  const [edited, setEdited] = useState<AiSettings | null>(null);
  const draft = edited ?? query.data ?? DEFAULT_AI_SETTINGS;
  const dirty = edited !== null && JSON.stringify(edited) !== JSON.stringify(query.data);

  // Editing before the saved values arrive would save the defaults over them.
  const set = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
    if (query.data) setEdited({ ...draft, [key]: value });
  };
  const setStyle = (key: keyof AiStyle, value: string) => {
    if (query.data) setEdited({ ...draft, style: { ...draft.style, [key]: value } });
  };

  const save = () =>
    runAction(() => updateAiSettingsAction(draft), {
      successMessage: t("admin.aiSettings.saved"),
      onSuccess: (data) => {
        if (data) queryClient.setQueryData(QUERY_KEY, data);
        setEdited(null);
      },
    });

  const a = (key: string) => t(`admin.aiSettings.${key}`);
  const styleKeys: { key: keyof AiStyle; label: string }[] = [
    { key: "background", label: a("styleBackground") },
    { key: "lighting", label: a("styleLighting") },
    { key: "shadow", label: a("styleShadow") },
    { key: "realism", label: a("styleRealism") },
    { key: "labels", label: a("styleLabels") },
  ];

  return (
    <AdminShell title={t("admin.nav.settings")}>
      {storeSettings.loadFailed && storeSettings.error ? (
        <div className="mb-4">
          <ListError error={storeSettings.error} onRetry={() => void storeSettings.refetch()} />
        </div>
      ) : null}
      <section className="admin-card mb-6 space-y-4 p-5">
        <h2 className="text-base font-semibold text-foreground">{t("adminUi.storeSettings")}</h2>
        <PriceVisibilityToggle />
        <ProductDetailExtrasToggle />
        <div className="border-t border-border pt-4">
          <CashSurchargeSetting />
        </div>
        <div className="border-t border-border pt-4">
          <ReceiptSettings />
        </div>
      </section>
      <h2 className="mb-1 text-base font-semibold text-foreground">{a("title")}</h2>
      <p className="mb-4 text-sm text-muted">{a("subtitle")}</p>
      {query.error ? <ListError error={query.error} onRetry={() => void query.refetch()} /> : null}
      <div className="space-y-4 pb-10">
        <Section title={a("imagesTitle")}>
          <Row label={a("generation")} hint={a("generationHint")}>
            <div className="flex sm:justify-end">
              <Switch
                checked={draft.imageGenerationEnabled}
                onChange={(v) => set("imageGenerationEnabled", v)}
                label={a("generation")}
              />
            </div>
          </Row>
          <Row label={a("provider")}>
            <Select
              aria-label={a("provider")}
              value={draft.imageProvider}
              onChange={(e) => set("imageProvider", e.target.value as AiSettings["imageProvider"])}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
            </Select>
          </Row>
          <Row label={a("imageModel")} hint={a("imageModelHint")}>
            <TextField label={a("imageModel")} value={draft.imageModel} onChange={(v) => set("imageModel", v)} />
          </Row>
          <Row label={a("quality")}>
            <Select
              aria-label={a("quality")}
              value={draft.imageQuality}
              onChange={(e) => set("imageQuality", e.target.value as AiSettings["imageQuality"])}
            >
              <option value="low">{t("adminUi.qualityLow")}</option>
              <option value="medium">{t("adminUi.qualityMedium")}</option>
              <option value="high">{t("adminUi.qualityHigh")}</option>
              <option value="auto">{t("adminUi.qualityAuto")}</option>
            </Select>
          </Row>
          <Row label={a("maxStudio")}>
            <NumberField label={a("maxStudio")} value={draft.maxStudioShots} max={3} onChange={(v) => set("maxStudioShots", v)} />
          </Row>
          <Row label={a("maxContext")}>
            <NumberField label={a("maxContext")} value={draft.maxContextShots} max={2} onChange={(v) => set("maxContextShots", v)} />
          </Row>
          <Row label={a("webSearch")} hint={a("webSearchHint")}>
            <div className="flex sm:justify-end">
              <Switch
                checked={draft.webImageSearchEnabled}
                onChange={(v) => set("webImageSearchEnabled", v)}
                label={a("webSearch")}
              />
            </div>
          </Row>
        </Section>

        <Section title={a("modelsTitle")} desc={a("keysNote")}>
          <Row label={a("textModel")}>
            <TextField label={a("textModel")} value={draft.textModel} onChange={(v) => set("textModel", v)} />
          </Row>
          <Row label={a("visionModel")}>
            <TextField label={a("visionModel")} value={draft.visionModel} onChange={(v) => set("visionModel", v)} />
          </Row>
          <Row label={a("webSearchModel")}>
            <TextField label={a("webSearchModel")} value={draft.webSearchModel} onChange={(v) => set("webSearchModel", v)} />
          </Row>
        </Section>

        <Section title={a("styleTitle")} desc={a("styleDesc")}>
          {styleKeys.map(({ key, label }) => (
            <div key={key} className="space-y-2 px-5 py-4">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <textarea
                aria-label={label}
                dir="ltr"
                rows={3}
                value={draft.style[key]}
                onChange={(e) => setStyle(key, e.target.value)}
                className={cn(inputClass, "resize-y leading-relaxed")}
              />
            </div>
          ))}
          <div className="px-5 py-3">
            <button
              type="button"
              className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
              onClick={() => set("style", DEFAULT_AI_STYLE)}
            >
              {a("resetStyle")}
            </button>
          </div>
        </Section>

        {/* AI settings save together, so the save stays in view and says when something is unsaved. */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-xl bg-card p-3 shadow-[var(--card-shadow)]">
          {dirty ? <p className="me-auto text-xs text-muted">{t("adminUi.unsavedChanges")}</p> : null}
          <Button
            type="button"
            loading={isPending}
            loadingLabel={t("common.saving")}
            disabled={!dirty || query.isLoading || (Boolean(query.error) && !query.data)}
            onClick={save}
          >
            {a("save")}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
