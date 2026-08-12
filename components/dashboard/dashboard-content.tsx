"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileTextIcon, LogOutIcon, PlusIcon, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { useT } from "@/lib/i18n/language-context";
import { useDemoAccount, hasActiveDemoSession } from "@/lib/demo-account/demo-account-context";
import { loadCv, cvStorageKey } from "@/lib/cv/storage";

export function DashboardContent() {
  const t = useT();
  const router = useRouter();
  const { account, isLoggedIn, logOut } = useDemoAccount();

  useEffect(() => {
    if (!hasActiveDemoSession()) router.replace("/login");
  }, [router]);

  if (!isLoggedIn || !account) return null;

  const cv = loadCv(cvStorageKey(account.email));
  const initial = account.name.trim().charAt(0).toUpperCase() || "?";

  function handleLogOut() {
    logOut();
    router.push("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-0"
                    aria-label={t.dashboard.accountSettings}
                  />
                }
              >
                <Avatar size="sm">
                  {account.avatarDataUrl && <AvatarImage src={account.avatarDataUrl} alt={account.name} />}
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="truncate font-medium">{account.name}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {account.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <Settings2Icon className="size-4" />
                  {t.dashboard.accountSettings}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogOut}>
                  <LogOutIcon className="size-4" />
                  {t.dashboard.logOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.dashboard.welcomeBack.replace("{name}", account.name)}
          </h1>
          <Badge variant="outline">{t.dashboard.demoBadge}</Badge>
        </div>

        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {t.dashboard.demoNote}{" "}
          <Link href="/#pricing" className="font-medium text-foreground underline underline-offset-4">
            {t.dashboard.seePricing}
          </Link>
        </p>

        <div className="mt-8 max-w-3xl">
          <h2 className="text-sm font-medium text-muted-foreground">{t.dashboard.yourCv}</h2>

          {cv ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileTextIcon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{cv.title || t.dashboard.untitled}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cv.personalInfo.fullName || t.dashboard.savedLocally}
                    </p>
                  </div>
                  <Button size="sm" nativeButton={false} render={<Link href="/editor" />}>
                    {t.dashboard.openEditor}
                  </Button>
                </CardContent>
              </Card>

              {/* Deliberately inert: a quiet nudge toward Pro, not a dead button.
                  The Pro label is always visible rather than a tooltip, which
                  touch devices can't surface. */}
              <Card className="cursor-not-allowed border-dashed opacity-60 shadow-none select-none">
                <CardContent className="flex items-center gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <PlusIcon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{t.dashboard.addCv}</p>
                    <Badge variant="outline" className="mt-1 font-normal">
                      {t.dashboard.proOnly}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="mt-3 max-w-md border-dashed shadow-none">
              <CardContent className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <FileTextIcon className="size-5" />
                </span>
                <div className="flex flex-col items-start gap-3">
                  <div>
                    <p className="text-sm font-medium">{t.dashboard.noCvTitle}</p>
                    <p className="text-sm text-muted-foreground">{t.dashboard.noCvBody}</p>
                  </div>
                  <Button size="sm" nativeButton={false} render={<Link href="/editor" />}>
                    <PlusIcon className="size-4" />
                    {t.dashboard.createCv}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
