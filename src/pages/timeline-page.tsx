import { useMutation, useQuery } from "@apollo/client";
import { AlertCircle, LogOut, Music, Plus, RefreshCw, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProjectDialog, type ProjectSubmitValues } from "../components/project-dialog";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  MY_CREATIVE_PROJECTS_QUERY,
  CREATE_CREATIVE_PROJECT_MUTATION,
  UPDATE_CREATIVE_PROJECT_MUTATION,
  DELETE_CREATIVE_PROJECT_MUTATION,
  type MyCreativeProjectsData,
  type CreateCreativeProjectData,
  type CreateCreativeProjectVariables,
  type UpdateCreativeProjectData,
  type UpdateCreativeProjectVariables,
  type DeleteCreativeProjectData,
  type DeleteCreativeProjectVariables,
} from "../graphql/creative-projects";
import type { CreativeProject, CreativeProjectLinkPlatform } from "../types";
import { logout } from "../lib/auth";
import { getMonthName } from "../lib/months";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/auth-store";

type MonthGroup = { month: number; projects: CreativeProject[] };
type YearGroup = { year: number; months: MonthGroup[] };

function groupProjects(projects: CreativeProject[]): YearGroup[] {
  const sorted = [...projects].sort((a, b) => {
    if (b.startYear !== a.startYear) return b.startYear - a.startYear;
    return b.startMonth - a.startMonth;
  });

  const yearMap = new Map<number, Map<number, CreativeProject[]>>();

  for (const project of sorted) {
    const monthMap = yearMap.get(project.startYear) ?? new Map<number, CreativeProject[]>();
    const monthProjects = monthMap.get(project.startMonth) ?? [];
    monthProjects.push(project);
    monthMap.set(project.startMonth, monthProjects);
    yearMap.set(project.startYear, monthMap);
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort(([a], [b]) => b - a)
        .map(([month, mProjects]) => ({ month, projects: mProjects })),
    }));
}

const PLATFORM_CONFIG: Record<
  CreativeProjectLinkPlatform,
  { label: string; className: string }
> = {
  YOUTUBE: { label: "YT", className: "bg-red-600/20 text-red-400 border-red-600/30" },
  SPOTIFY: { label: "SP", className: "bg-green-600/20 text-green-400 border-green-600/30" },
  SOUNDCLOUD: { label: "SC", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  INSTAGRAM_REELS: { label: "IG", className: "bg-pink-600/20 text-pink-400 border-pink-600/30" },
  TIKTOK: { label: "TT", className: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  WEBSITE: { label: "WEB", className: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
  OTHER: { label: "?", className: "bg-secondary text-muted-foreground border-border" },
};

function PlatformBadge({ platform }: { platform: CreativeProjectLinkPlatform }) {
  const config = PLATFORM_CONFIG[platform];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: CreativeProject;
  onOpen: (project: CreativeProject) => void;
}) {
  return (
    <article className="group relative rounded-lg border border-border bg-card p-4 transition-all duration-150 hover:border-primary/40 hover:bg-secondary/30 cursor-pointer">
      <button
        type="button"
        className="w-full text-left focus-visible:outline-none"
        onClick={() => onOpen(project)}
      >
        <h3 className="font-semibold text-foreground leading-snug">{project.title}</h3>

        {project.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        ) : null}

        {project.links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.links
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={link.label ?? link.url}
                >
                  <PlatformBadge platform={link.platform} />
                </a>
              ))}
          </div>
        ) : null}
      </button>
    </article>
  );
}

function TimelineMonthSection({
  monthGroup,
  onOpenProject,
}: {
  monthGroup: MonthGroup;
  onOpenProject: (project: CreativeProject) => void;
}) {
  return (
    <div className="relative pl-6">
      {/* Month marker dot */}
      <div className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_hsl(49_100%_50%/0.4)]" />
      </div>

      {/* Month label */}
      <p className="mb-3 text-sm font-semibold text-foreground/70 tracking-wide">
        {getMonthName(monthGroup.month)}
      </p>

      {/* Projects grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {monthGroup.projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={onOpenProject} />
        ))}
      </div>
    </div>
  );
}

function TimelineYearSection({
  yearGroup,
  onOpenProject,
}: {
  yearGroup: YearGroup;
  onOpenProject: (project: CreativeProject) => void;
}) {
  return (
    <section>
      {/* Year separator — Honda style */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 font-mono text-sm font-bold text-primary tracking-widest">
          {yearGroup.year}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Month groups with vertical track line */}
      <div className="relative space-y-6">
        {/* Vertical track line */}
        <div className="absolute left-[7px] top-0 h-full w-px bg-primary/20" />

        {yearGroup.months.map((monthGroup) => (
          <TimelineMonthSection
            key={monthGroup.month}
            monthGroup={monthGroup}
            onOpenProject={onOpenProject}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyTimeline({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <Card className="w-full max-w-lg border-border/60">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <Music className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <CardTitle>Még nincs rögzített projekted.</CardTitle>
          <CardDescription>
            Indítsd el az alkotói útvonaladat — rögzítsd az első zenei, videós vagy kreatív projektedet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Első projekt létrehozása
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineLoading() {
  return (
    <div className="space-y-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="ml-6 h-24 animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function TimelinePage() {
  const { user, isLoading: isUserLoading, loadUser, clearUser } = useAuthStore();
  const [dialogProject, setDialogProject] = useState<CreativeProject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadUser().then((loadedUser) => {
      if (isMounted && !loadedUser) {
        window.location.replace("/login.html");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadUser]);

  const {
    data,
    loading: areProjectsLoading,
    error: projectsError,
    refetch,
  } = useQuery<MyCreativeProjectsData>(MY_CREATIVE_PROJECTS_QUERY, {
    fetchPolicy: "cache-and-network",
    skip: !user,
  });

  const [createProject, createState] = useMutation<
    CreateCreativeProjectData,
    CreateCreativeProjectVariables
  >(CREATE_CREATIVE_PROJECT_MUTATION, {
    refetchQueries: [MY_CREATIVE_PROJECTS_QUERY],
    awaitRefetchQueries: true,
  });

  const [updateProject, updateState] = useMutation<
    UpdateCreativeProjectData,
    UpdateCreativeProjectVariables
  >(UPDATE_CREATIVE_PROJECT_MUTATION, {
    refetchQueries: [MY_CREATIVE_PROJECTS_QUERY],
    awaitRefetchQueries: true,
  });

  const [deleteProject, deleteState] = useMutation<
    DeleteCreativeProjectData,
    DeleteCreativeProjectVariables
  >(DELETE_CREATIVE_PROJECT_MUTATION, {
    refetchQueries: [MY_CREATIVE_PROJECTS_QUERY],
    awaitRefetchQueries: true,
  });

  const projects = useMemo(
    () => data?.myCreativeProjects ?? [],
    [data],
  );

  const groups = useMemo(() => groupProjects(projects), [projects]);

  const isSaving = createState.loading || updateState.loading;
  const isDeleting = deleteState.loading;

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout anyway
    }
    clearUser();
    window.location.replace("/login.html");
  };

  const openCreateDialog = () => {
    setPageError(null);
    setDialogProject(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: CreativeProject) => {
    setPageError(null);
    setDialogProject(project);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSaving || isDeleting) return;
    setIsDialogOpen(false);
    setDialogProject(null);
  };

  const handleSubmit = async (values: ProjectSubmitValues) => {
    setPageError(null);
    try {
      if (dialogProject) {
        await updateProject({
          variables: {
            id: dialogProject.id,
            input: {
              title: values.title,
              description: values.description || undefined,
              startYear: values.startYear,
              startMonth: values.startMonth,
              lyrics: values.lyrics || undefined,
              creationMethod: values.creationMethod || undefined,
              links: values.links.map((l) => ({
                platform: l.platform,
                url: l.url,
                label: l.label || undefined,
                sortOrder: l.sortOrder,
              })),
            },
          },
        });
      } else {
        await createProject({
          variables: {
            input: {
              title: values.title,
              description: values.description || undefined,
              startYear: values.startYear,
              startMonth: values.startMonth,
              lyrics: values.lyrics || undefined,
              creationMethod: values.creationMethod || undefined,
              links: values.links.map((l) => ({
                platform: l.platform,
                url: l.url,
                label: l.label || undefined,
                sortOrder: l.sortOrder,
              })),
            },
          },
        });
      }
      setIsDialogOpen(false);
      setDialogProject(null);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Nem sikerült menteni a projektet. Kérlek próbáld újra.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    setPageError(null);
    try {
      await deleteProject({ variables: { id } });
      setIsDialogOpen(false);
      setDialogProject(null);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Nem sikerült törölni a projektet.",
      );
    }
  };

  const isInitialLoading = isUserLoading || (areProjectsLoading && projects.length === 0);
  const visibleError = pageError ?? projectsError?.message ?? null;

  return (
    <AppShell>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6 sm:px-8">
        {/* Header */}
        <header className="border-b border-border pb-5">
          {/* Top accent line */}
          <div className="mb-4 h-px w-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {/* Logo */}
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                  <Zap className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
                  ARTLINE
                </span>
                <span className="font-mono text-xs text-muted-foreground">// alkotói útvonal</span>
              </div>

              <h1 className="text-xl font-bold tracking-tight text-foreground">Alkotói útvonal</h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {user
                  ? `${user.displayName ?? user.email}`
                  : "Felhasználó betöltése..."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={openCreateDialog} disabled={!user}>
                <Plus className="h-4 w-4" />
                Új projekt
              </Button>
              <Button
                variant="outline"
                onClick={() => void refetch()}
                disabled={!user || areProjectsLoading}
                title="Frissítés"
              >
                <RefreshCw className={cn("h-4 w-4", areProjectsLoading ? "animate-spin" : "")} />
                <span className="sr-only sm:not-sr-only">Frissítés</span>
              </Button>
              <Button variant="outline" onClick={() => void handleLogout()}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Kijelentkezés</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Error banner */}
        {visibleError ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{visibleError}</span>
          </div>
        ) : null}

        {/* Timeline */}
        <section className="flex-1 py-8">
          {isInitialLoading ? <TimelineLoading /> : null}

          {!isInitialLoading && projects.length === 0 ? (
            <EmptyTimeline onCreate={openCreateDialog} />
          ) : null}

          {!isInitialLoading && groups.length > 0 ? (
            <div className="space-y-10">
              {/* "JELEN" now marker */}
              <div className="flex items-center gap-4 text-xs">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono font-bold uppercase tracking-widest text-primary">
                  ► JELEN
                </span>
                <div className="h-px flex-1 bg-primary/20" />
              </div>

              {groups.map((yearGroup) => (
                <TimelineYearSection
                  key={yearGroup.year}
                  yearGroup={yearGroup}
                  onOpenProject={openEditDialog}
                />
              ))}

              {/* Bottom end marker */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground/40">
                <div className="h-px flex-1 bg-border" />
                <span className="font-mono tracking-wider">◼◻◼◻ KEZDET</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          ) : null}
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-4 pb-6">
          <p className="font-mono text-xs tracking-widest text-muted-foreground/40 text-center">
            ARTLINE // ENGINEERING CREATIVITY
          </p>
        </footer>
      </div>

      <ProjectDialog
        project={dialogProject}
        isOpen={isDialogOpen}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </AppShell>
  );
}
