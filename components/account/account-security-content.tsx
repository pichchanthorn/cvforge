"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { useT } from "@/lib/i18n/language-context";
import { useDemoAccount, hasActiveDemoSession } from "@/lib/demo-account/demo-account-context";

export function AccountSecurityContent() {
  const t = useT();
  const router = useRouter();
  const { isLoggedIn } = useDemoAccount();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasActiveDemoSession()) router.replace("/login");
  }, [router]);

  if (!isLoggedIn) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (currentPassword.length < 6) nextErrors.current = t.auth.formErrors.passwordTooShort;
    if (newPassword.length < 6) nextErrors.next = t.auth.formErrors.passwordTooShort;
    if (newPassword !== confirmPassword) nextErrors.confirm = t.accountSecurity.errorMismatch;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(t.accountSecurity.success);
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-12">
        <Link
          href="/account"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t.accountSecurity.backToAccount}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">{t.accountSecurity.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.accountSecurity.subtitle}</p>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
          <span>{t.auth.demoNotice}</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">{t.accountSecurity.currentPasswordLabel}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={!!errors.current}
              autoComplete="current-password"
            />
            {errors.current && <p className="text-xs text-destructive">{errors.current}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">{t.accountSecurity.newPasswordLabel}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={!!errors.next}
              autoComplete="new-password"
            />
            {errors.next && <p className="text-xs text-destructive">{errors.next}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">{t.accountSecurity.confirmPasswordLabel}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirm}
              autoComplete="new-password"
            />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? t.accountSecurity.submitting : t.accountSecurity.submit}
          </Button>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
