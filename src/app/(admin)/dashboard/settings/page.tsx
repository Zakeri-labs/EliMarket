"use client";

import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAiSettingsAction,
  updateAiSettingsAction,
} from "@/app/_actions/ai-settings-actions";
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
  "min-h-10 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm outline-none transition-[border-color,box-shadow] hover:border-zinc-300 focus:border-accent focus:ring-4 focus:ring-accent/10";

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {desc ? <p className="mt-0.5 text-xs text-muted">{desc}</p> : null}
      </div>
      <div className="divide-y divide-zinc-100">{children}</div>
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
      <div className="w-full sm:w-64 sm:shrink-0">{children}</div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors sm:ms-auto sm:block",
        checked ? "bg-accent" : "bg-zinc-200",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "start-[1.375rem]" : "start-0.5",
        )}
      />
    </button>
  );
}

function NumberField({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
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

function TextField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <input dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
}

export default function AdminSettingsPage() {
  const { t } = useTranslations();
  const { runAction, isPending } = useFormAction();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await getAiSettingsAction();
      return result.success ? result.data : DEFAULT_AI_SETTINGS;
    },
  });
  // `null` = show the persisted value; an object = the admin is editing.
  const [edited, setEdited] = useState<AiSettings | null>(null);
  const draft = edited ?? query.data ?? DEFAULT_AI_SETTINGS;

  const set = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) =>
    setEdited({ ...draft, [key]: value });
  const setStyle = (key: keyof AiStyle, value: string) =>
    setEdited({ ...draft, style: { ...draft.style, [key]: value } });

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
    <AdminShell title={a("title")} subtitle={a("subtitle")}>
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <Section title={a("imagesTitle")}>
          <Row label={a("generation")} hint={a("generationHint")}>
            <Switch
              checked={draft.imageGenerationEnabled}
              onChange={(v) => set("imageGenerationEnabled", v)}
              label={a("generation")}
            />
          </Row>
          <Row label={a("provider")}>
            <Select
              value={draft.imageProvider}
              onChange={(e) => set("imageProvider", e.target.value as AiSettings["imageProvider"])}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
            </Select>
          </Row>
          <Row label={a("imageModel")} hint={a("imageModelHint")}>
            <TextField value={draft.imageModel} onChange={(v) => set("imageModel", v)} />
          </Row>
          <Row label={a("quality")}>
            <Select
              value={draft.imageQuality}
              onChange={(e) => set("imageQuality", e.target.value as AiSettings["imageQuality"])}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="auto">auto</option>
            </Select>
          </Row>
          <Row label={a("maxStudio")}>
            <NumberField value={draft.maxStudioShots} max={3} onChange={(v) => set("maxStudioShots", v)} />
          </Row>
          <Row label={a("maxContext")}>
            <NumberField value={draft.maxContextShots} max={2} onChange={(v) => set("maxContextShots", v)} />
          </Row>
          <Row label={a("webSearch")} hint={a("webSearchHint")}>
            <Switch
              checked={draft.webImageSearchEnabled}
              onChange={(v) => set("webImageSearchEnabled", v)}
              label={a("webSearch")}
            />
          </Row>
        </Section>

        <Section title={a("modelsTitle")} desc={a("keysNote")}>
          <Row label={a("textModel")}>
            <TextField value={draft.textModel} onChange={(v) => set("textModel", v)} />
          </Row>
          <Row label={a("visionModel")}>
            <TextField value={draft.visionModel} onChange={(v) => set("visionModel", v)} />
          </Row>
          <Row label={a("webSearchModel")}>
            <TextField value={draft.webSearchModel} onChange={(v) => set("webSearchModel", v)} />
          </Row>
        </Section>

        <Section title={a("styleTitle")} desc={a("styleDesc")}>
          {styleKeys.map(({ key, label }) => (
            <div key={key} className="space-y-2 px-5 py-4">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <textarea
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

        <div className="flex justify-end">
          <Button
            type="button"
            loading={isPending}
            loadingLabel={t("common.saving")}
            disabled={query.isLoading}
            onClick={save}
          >
            {a("save")}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
