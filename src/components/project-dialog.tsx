import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import type { CreativeProject, CreativeProjectLinkPlatform } from "../types";
import { MONTHS_HU } from "../lib/months";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

const PLATFORMS = [
  "YOUTUBE",
  "SPOTIFY",
  "SOUNDCLOUD",
  "INSTAGRAM_REELS",
  "TIKTOK",
  "WEBSITE",
  "OTHER",
] as const;

const PLATFORM_LABELS: Record<CreativeProjectLinkPlatform, string> = {
  YOUTUBE: "YouTube",
  SPOTIFY: "Spotify",
  SOUNDCLOUD: "SoundCloud",
  INSTAGRAM_REELS: "Instagram Reels",
  TIKTOK: "TikTok",
  WEBSITE: "Weboldal",
  OTHER: "Egyéb",
};

const projectSchema = z.object({
  title: z.string().min(1, "Cím kötelező").max(150, "Maximum 150 karakter"),
  description: z.string().max(10000, "Maximum 10 000 karakter"),
  startYear: z.coerce
    .number({ invalid_type_error: "Érvényes év szükséges" })
    .int()
    .min(1950, "Minimum 1950")
    .max(2100, "Maximum 2100"),
  startMonth: z.coerce
    .number({ invalid_type_error: "Érvényes hónap szükséges" })
    .int()
    .min(1, "1–12 közötti érték")
    .max(12, "1–12 közötti érték"),
  lyrics: z.string().max(50000, "Maximum 50 000 karakter"),
  creationMethod: z.string().max(20000, "Maximum 20 000 karakter"),
  links: z.array(
    z.object({
      platform: z.enum(PLATFORMS),
      url: z
        .string()
        .min(1, "URL kötelező")
        .refine((v) => {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        }, "Érvényes URL szükséges (pl. https://...)"),
      label: z.string().max(100),
    }),
  ),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export type ProjectSubmitValues = {
  title: string;
  description: string;
  startYear: number;
  startMonth: number;
  lyrics: string;
  creationMethod: string;
  links: Array<{
    platform: CreativeProjectLinkPlatform;
    url: string;
    label: string;
    sortOrder: number;
  }>;
};

type ProjectDialogProps = {
  project: CreativeProject | null;
  isOpen: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectSubmitValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function buildDefaultValues(project: CreativeProject | null): ProjectFormValues {
  if (!project) {
    return {
      title: "",
      description: "",
      startYear: new Date().getFullYear(),
      startMonth: new Date().getMonth() + 1,
      lyrics: "",
      creationMethod: "",
      links: [],
    };
  }
  return {
    title: project.title,
    description: project.description ?? "",
    startYear: project.startYear,
    startMonth: project.startMonth,
    lyrics: project.lyrics ?? "",
    creationMethod: project.creationMethod ?? "",
    links: project.links
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((l) => ({
        platform: l.platform,
        url: l.url,
        label: l.label ?? "",
      })),
  };
}

export function ProjectDialog({
  project,
  isOpen,
  isSaving,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
}: ProjectDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: buildDefaultValues(project),
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const reset = form.reset;

  useEffect(() => {
    if (!isOpen) return;
    reset(buildDefaultValues(project));
    setShowDeleteConfirm(false);
  }, [isOpen, project?.id, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      links: values.links.map((l, idx) => ({
        platform: l.platform as CreativeProjectLinkPlatform,
        url: l.url,
        label: l.label,
        sortOrder: idx,
      })),
    });
  });

  if (!isOpen) return null;

  const isWorking = isSaving || isDeleting;
  const errors = form.formState.errors;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isWorking) onClose();
      }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-6 py-0 sm:py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full sm:max-w-2xl sm:rounded-lg border-0 sm:border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-1 rounded-full bg-primary" />
              <h2 className="text-base font-semibold tracking-tight">
                {project ? "Projekt szerkesztése" : "Új projekt"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isWorking}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              aria-label="Bezárás"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 px-6 py-6">
            {/* Title */}
            <Field label="Cím *" error={errors.title?.message}>
              <Input
                {...form.register("title")}
                placeholder="A projekt neve"
                disabled={isWorking}
                autoFocus
              />
            </Field>

            {/* Description */}
            <Field label="Leírás" error={errors.description?.message}>
              <Textarea
                {...form.register("description")}
                placeholder="Miről szól ez a projekt?"
                rows={3}
                disabled={isWorking}
              />
            </Field>

            {/* Start date */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kezdési év *" error={errors.startYear?.message}>
                <Input
                  type="number"
                  {...form.register("startYear")}
                  min={1950}
                  max={2100}
                  disabled={isWorking}
                />
              </Field>
              <Field label="Kezdési hónap *" error={errors.startMonth?.message}>
                <Select {...form.register("startMonth")} disabled={isWorking}>
                  {MONTHS_HU.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* Links */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/80">Linkek</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isWorking}
                  onClick={() =>
                    appendLink({
                      platform: "YOUTUBE",
                      url: "",
                      label: "",
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Link hozzáadása
                </Button>
              </div>

              {linkFields.length > 0 ? (
                <div className="space-y-3">
                  {linkFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-md border border-border bg-muted/30 p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Select
                          {...form.register(`links.${index}.platform`)}
                          className="flex-1"
                          disabled={isWorking}
                        >
                          {PLATFORMS.map((p) => (
                            <option key={p} value={p}>
                              {PLATFORM_LABELS[p]}
                            </option>
                          ))}
                        </Select>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          disabled={isWorking}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          aria-label="Link eltávolítása"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        {...form.register(`links.${index}.url`)}
                        placeholder="https://..."
                        disabled={isWorking}
                      />
                      {errors.links?.[index]?.url?.message ? (
                        <p className="text-xs text-destructive">{errors.links[index].url.message}</p>
                      ) : null}
                      <Input
                        {...form.register(`links.${index}.label`)}
                        placeholder="Label / felirat (opcionális)"
                        disabled={isWorking}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Még nincs link hozzáadva. YouTube, Spotify, SoundCloud vagy egyéb platform.
                </p>
              )}
            </div>

            {/* Lyrics */}
            <Field label="Dalszöveg" error={errors.lyrics?.message}>
              <Textarea
                {...form.register("lyrics")}
                placeholder="Ide kerülhet a dalszöveg..."
                rows={6}
                disabled={isWorking}
                className="min-h-[10rem] font-mono text-sm"
              />
            </Field>

            {/* Creation method */}
            <Field label="Készítési mód / Production notes" error={errors.creationMethod?.message}>
              <Textarea
                {...form.register("creationMethod")}
                placeholder="Hogyan készült? Milyen eszközöket, módszereket, szoftvereket használtál?"
                rows={4}
                disabled={isWorking}
              />
            </Field>
          </div>

          {/* Footer */}
          <div
            className={cn(
              "flex items-center border-t border-border px-6 py-4",
              project ? "justify-between" : "justify-end",
            )}
          >
            {project ? (
              <div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Biztosan törlöd?</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => void onDelete(project.id)}
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Igen, törlöm
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Mégse
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    disabled={isWorking}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Törlés
                  </Button>
                )}
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isWorking}
              >
                Mégse
              </Button>
              <Button type="submit" disabled={isWorking}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {project ? "Mentés" : "Létrehozás"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
