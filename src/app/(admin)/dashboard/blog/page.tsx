"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Sparkles, Upload } from "lucide-react";
import {
  createBlogPostAction,
  deleteBlogPostAction,
  generateBlogPostDraftAction,
  getAdminBlogPostsAction,
  updateBlogPostAction,
} from "@/app/_actions/blog-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppIcon } from "@/components/icons/AppIcon";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { BlogCover } from "@/app/(storefront)/blog/_components/BlogCover";
import { useFormAction } from "@/app/hooks/use-form-action";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  useAdminImageUpload,
} from "@/app/hooks/use-admin-image-upload";
import { notifyFormError } from "@/app/utils/form-notify";
import { cn } from "@/app/utils/cn";
import { slugifyBlogTitle } from "@/lib/blog/slug";
import { resolveBlogTitle } from "@/lib/i18n/blog-post";
import { useTranslations } from "@/i18n/use-translations";
import { LOCALES, LOCALE_LABELS, getDirection, type Locale } from "@/i18n/config";
import type { BlogPost } from "@/app/_types/database.types";

type FormValues = {
  slug: string;
  title_fa: string;
  title_ar?: string;
  title_en?: string;
  excerpt_fa?: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  body_fa: string;
  body_ar?: string;
  body_en?: string;
  cover_url?: string;
  published: boolean;
  sort_order: number;
  published_at?: string;
};

const DEFAULT_FORM_VALUES: FormValues = {
  slug: "",
  title_fa: "",
  title_ar: "",
  title_en: "",
  excerpt_fa: "",
  excerpt_ar: "",
  excerpt_en: "",
  body_fa: "",
  body_ar: "",
  body_en: "",
  cover_url: "",
  published: true,
  sort_order: 0,
  published_at: "",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"] as const;

/** yyyy-mm-dd for a date input. */
function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function AdminBlogPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<Locale>("fa");
  const [topic, setTopic] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);

  const schema = z.object({
    slug: z.string().min(1, t("admin.blog.validationSlug")),
    title_fa: z.string().min(1, t("admin.blog.validationTitle")),
    title_ar: z.string().optional(),
    title_en: z.string().optional(),
    excerpt_fa: z.string().optional(),
    excerpt_ar: z.string().optional(),
    excerpt_en: z.string().optional(),
    body_fa: z.string().min(1, t("admin.blog.validationBody")),
    body_ar: z.string().optional(),
    body_en: z.string().optional(),
    cover_url: z.string().optional(),
    published: z.boolean(),
    sort_order: z.number().int().min(0),
    published_at: z.string().optional(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const coverUrl = form.watch("cover_url");

  const { data: posts, isPending } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const result = await getAdminBlogPostsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    if (!editing) return;
    form.reset({
      slug: editing.slug,
      title_fa: editing.title_fa,
      title_ar: editing.title_ar ?? "",
      title_en: editing.title_en ?? "",
      excerpt_fa: editing.excerpt_fa ?? "",
      excerpt_ar: editing.excerpt_ar ?? "",
      excerpt_en: editing.excerpt_en ?? "",
      body_fa: editing.body_fa,
      body_ar: editing.body_ar ?? "",
      body_en: editing.body_en ?? "",
      cover_url: editing.cover_url ?? "",
      published: editing.published,
      sort_order: editing.sort_order,
      published_at: toDateInput(editing.published_at),
    });
  }, [editing, form]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setTab("fa");
    setTopic("");
    form.reset(DEFAULT_FORM_VALUES);
  };

  const openCreate = () => {
    setEditing(null);
    setTab("fa");
    setTopic("");
    form.reset(DEFAULT_FORM_VALUES);
    setFormOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setTab("fa");
    setTopic("");
    setFormOpen(true);
  };

  const runDraft = () => {
    const t0 = topic.trim();
    if (!t0) {
      notifyFormError(t("admin.blog.validationTopic"), {
        title: t("notifications.errorTitle"),
      });
      return;
    }
    setIsDrafting(true);
    void generateBlogPostDraftAction({ topic: t0 })
      .then((result) => {
        if (!result.success) {
          notifyFormError(result.error, { title: t("notifications.errorTitle") });
          return;
        }
        const d = result.data;
        form.setValue("title_fa", d.title_fa);
        form.setValue("title_ar", d.title_ar);
        form.setValue("title_en", d.title_en);
        form.setValue("excerpt_fa", d.excerpt_fa);
        form.setValue("excerpt_ar", d.excerpt_ar);
        form.setValue("excerpt_en", d.excerpt_en);
        form.setValue("body_fa", d.body_fa);
        form.setValue("body_ar", d.body_ar);
        form.setValue("body_en", d.body_en);
        if (!form.getValues("slug")) {
          form.setValue("slug", slugifyBlogTitle(d.title_en || d.title_fa));
        }
      })
      .finally(() => setIsDrafting(false));
  };

  const onSubmit = form.handleSubmit((values) => {
    const slug = values.slug.trim() || slugifyBlogTitle(values.title_en || values.title_fa);
    const payload = {
      slug,
      title_fa: values.title_fa,
      title_ar: values.title_ar ?? null,
      title_en: values.title_en ?? null,
      excerpt_fa: values.excerpt_fa ?? null,
      excerpt_ar: values.excerpt_ar ?? null,
      excerpt_en: values.excerpt_en ?? null,
      body_fa: values.body_fa,
      body_ar: values.body_ar ?? null,
      body_en: values.body_en ?? null,
      cover_url: values.cover_url?.trim() || null,
      published: values.published,
      sort_order: values.sort_order,
      published_at: values.published_at?.trim() || null,
    };

    if (editing) {
      runAction(() => updateBlogPostAction(editing.id, payload), {
        successMessage: t("notifications.blogPostUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createBlogPostAction(payload), {
        successMessage: t("notifications.blogPostCreated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    }
  });

  const inputClass = "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";
  const postList = useMemo(() => posts ?? [], [posts]);
  const titleField = `title_${tab}` as const;
  const excerptField = `excerpt_${tab}` as const;
  const bodyField = `body_${tab}` as const;
  const busy = isActionPending || isUploadPending;

  return (
    <AdminShell title={t("admin.blog.title")} subtitle={t("admin.blog.subtitle")}>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center justify-end bg-[#f4f4f5] pb-3">
          <Button type="button" size="sm" onClick={openCreate}>
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.blog.newPost")}
          </Button>
        </div>

        {isPending ? (
          <ul className="space-y-2">
            {SKELETON_KEYS.map((key) => (
              <li
                key={key}
                className="h-16 animate-pulse rounded-xl border border-[#e4e4e7] bg-white"
              />
            ))}
          </ul>
        ) : postList.length ? (
          <ul className="space-y-2">
            {postList.map((post) => (
              <li
                key={post.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition-colors",
                  editing?.id === post.id ? "border-[#0d9488]" : "border-[#e4e4e7]",
                )}
              >
                <span className="w-5 shrink-0 text-[11px] text-[#a1a1aa]">
                  {post.sort_order}
                </span>

                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  aria-label={t("admin.blog.edit")}
                  className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-[#e4e4e7] bg-[#f4f4f5]"
                >
                  <BlogCover post={post} sizes="56px" />
                </button>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-semibold text-[#18181b] hover:text-[#0f766e] hover:underline"
                  >
                    {resolveBlogTitle(post, locale)}
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="block max-w-full truncate text-start text-[11px] text-[#71717a] hover:text-[#18181b]"
                    dir="ltr"
                  >
                    {post.slug} · {toDateInput(post.published_at)}
                  </button>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    post.published
                      ? "bg-[#0d9488]/12 text-[#0f766e]"
                      : "bg-[#f4f4f5] text-[#71717a]",
                  )}
                >
                  {post.published
                    ? t("admin.blog.publishedTag")
                    : t("admin.blog.draftTag")}
                </span>
                <RowIconActions
                  editLabel={t("admin.blog.edit")}
                  deleteLabel={t("admin.blog.delete")}
                  onEdit={() => openEdit(post)}
                  onDelete={() =>
                    runAction(() => deleteBlogPostAction(post.id), {
                      successMessage: t("notifications.blogPostDeleted"),
                      onSuccess: () => {
                        if (editing?.id === post.id) closeForm();
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
            {t("admin.blog.empty")}
          </p>
        )}

        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.blog.editPost") : t("admin.blog.newPost")}
          size="lg"
          busy={busy}
          busyLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={busy}>
                {t("admin.blog.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-blog-form"
                loading={busy}
                loadingLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
              >
                {editing ? t("admin.blog.save") : t("admin.blog.create")}
              </Button>
            </>
          }
        >
          <form id="admin-blog-form" onSubmit={onSubmit} className="space-y-4">
            {/* AI draft */}
            <div className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#71717a]">
                <AppIcon icon={Sparkles} size="xs" />
                {t("admin.blog.aiDraftHeading")}
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t("admin.blog.aiTopicPlaceholder")}
                  className={cn(inputClass, "flex-1")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  loading={isDrafting}
                  loadingLabel={t("admin.blog.aiDrafting")}
                  onClick={runDraft}
                >
                  {t("admin.blog.aiDraftButton")}
                </Button>
              </div>
              <p className="mt-1.5 text-[11px] text-[#a1a1aa]">
                {t("admin.blog.aiDraftHint")}
              </p>
            </div>

            {/* Per-language content */}
            <div className="space-y-2">
              <div className="flex gap-1 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-1">
                {LOCALES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                      tab === loc
                        ? "bg-white text-[#18181b] shadow-sm"
                        : "text-[#71717a] hover:text-[#18181b]",
                    )}
                    onClick={() => setTab(loc)}
                  >
                    {LOCALE_LABELS[loc]}
                  </button>
                ))}
              </div>

              <input
                key={`title-${tab}`}
                {...form.register(titleField)}
                placeholder={t("admin.blog.titlePlaceholder")}
                className={inputClass}
                dir={getDirection(tab)}
              />
              {form.formState.errors.title_fa ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.title_fa.message}
                </p>
              ) : null}

              <textarea
                key={`excerpt-${tab}`}
                {...form.register(excerptField)}
                placeholder={t("admin.blog.excerptPlaceholder")}
                rows={2}
                className={inputClass}
                dir={getDirection(tab)}
              />

              <textarea
                key={`body-${tab}`}
                {...form.register(bodyField)}
                placeholder={t("admin.blog.bodyPlaceholder")}
                rows={10}
                className={cn(inputClass, "font-mono text-[13px] leading-6")}
                dir={getDirection(tab)}
              />
              {form.formState.errors.body_fa ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.body_fa.message}
                </p>
              ) : null}
              <p className="text-[11px] text-[#71717a]">{t("admin.blog.bodyHint")}</p>
              <p className="text-[11px] text-[#a1a1aa]">{t("admin.blog.langHint")}</p>
            </div>

            {/* Meta */}
            <input
              {...form.register("slug")}
              placeholder={t("admin.blog.slugPlaceholder")}
              className={inputClass}
              dir="ltr"
            />
            {form.formState.errors.slug ? (
              <p className="text-xs text-red-600">{form.formState.errors.slug.message}</p>
            ) : null}

            {coverUrl ? (
              <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-[#fafafa]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt=""
                  className="mx-auto max-h-44 w-full object-cover"
                />
              </div>
            ) : null}
            <input
              {...form.register("cover_url")}
              placeholder={t("admin.blog.coverUrlPlaceholder")}
              className={inputClass}
              dir="ltr"
            />
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                  <AppIcon icon={Upload} size="sm" />
                  {t("admin.blog.uploadCover")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
                      notifyFormError(t("errors.fileTooLarge"), {
                        title: t("notifications.errorTitle"),
                      });
                      e.target.value = "";
                      return;
                    }
                    uploadImage(file, "blog", {
                      successMessage: t("notifications.imageUploaded"),
                      onSuccess: (data) => {
                        if (data?.url) form.setValue("cover_url", data.url);
                      },
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              {coverUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.setValue("cover_url", "")}
                >
                  {t("admin.blog.removeCover")}
                </Button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-[#71717a]">
                  {t("admin.blog.publishedAtLabel")}
                </label>
                <input
                  {...form.register("published_at")}
                  type="date"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#71717a]">
                  {t("admin.blog.sortOrderLabel")}
                </label>
                <input
                  {...form.register("sort_order", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("published")} />
              {t("admin.blog.publishedLabel")}
            </label>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
