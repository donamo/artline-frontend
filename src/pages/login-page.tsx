import { useEffect } from "react";
import { Chrome, Loader2, Zap } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { startGoogleLogin } from "../lib/auth";
import { useAuthStore } from "../stores/auth-store";

export function LoginPage() {
  const { error, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    void loadUser().then((user) => {
      if (isMounted && user) {
        window.location.replace("/index.html");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadUser]);

  return (
    <AppShell>
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left panel — Honda Yellow dark hero */}
        <div className="relative flex min-h-[45vh] flex-col justify-between overflow-hidden bg-[#0D0D0D] px-6 py-8 sm:px-10 lg:min-h-screen lg:px-14">
          {/* Racing stripe accent — top */}
          <div className="absolute left-0 top-0 h-1 w-full bg-primary" />

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold tracking-[0.18em] text-primary">ARTLINE</span>
              <span className="hidden text-xs font-mono text-muted-foreground sm:block">
                // alkotói útvonal
              </span>
            </div>
          </div>

          {/* Hero text */}
          <div className="max-w-xl py-16 lg:py-0">
            {/* Racing stripe label */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Privát alkotói idővonal
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Indítsd el<br />
              <span className="text-primary">alkotói</span>
              <br />
              útvonaladat.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
              Zenei, videós és kreatív projektjeid egy privát idővonalon. Minden alkotás rögzítve,
              minden fejlődés látható.
            </p>

            {/* Checkered accent */}
            <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground/60">
              <span className="font-mono tracking-wider">◼◻◼◻</span>
              <span>Minden adat csak a tied.</span>
            </div>
          </div>

          {/* Bottom tagline — Honda engineering style */}
          <p className="font-mono text-xs tracking-widest text-muted-foreground/50">
            ENGINEERING CREATIVITY // EST. 2026
          </p>

          {/* Racing stripe accent — bottom */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/30" />
        </div>

        {/* Right panel — Login card */}
        <div className="flex items-center justify-center bg-[#0A0A0A] px-6 py-12 sm:px-10">
          <Card className="w-full max-w-sm border-border/60 bg-card">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                <Zap className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <CardTitle>Belépés</CardTitle>
              <CardDescription>
                Lépj be Google-fiókoddal az Alkotói útvonal használatához.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={startGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Chrome className="h-4 w-4" />
                )}
                Belépés Google-fiókkal
              </Button>

              {error ? (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}

              <div className="space-y-2 text-xs leading-5 text-muted-foreground">
                <p>
                  A Google-belépés kizárólag azonosításra szolgál. Nincs Drive, Gmail, Calendar
                  vagy Contacts hozzáférés.
                </p>
                <p className="font-mono text-muted-foreground/50">
                  // minden adat privát és titkosított
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
