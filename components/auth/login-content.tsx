"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n/language-context";
import { useDemoAccount } from "@/lib/demo-account/demo-account-context";
import { AuthShell } from "@/components/auth/auth-shell";

export function LoginContent() {
  const t = useT();
  const router = useRouter();
  const { logIn } = useDemoAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = t.auth.formErrors.emailInvalid;
    if (password.length < 6) nextErrors.password = t.auth.formErrors.passwordTooShort;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = logIn(email);
    if (!result.ok) {
      setIsSubmitting(false);
      setFormError(t.auth.login.errorNotFound);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">{t.auth.login.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.auth.login.subtitle}</p>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
        <span>{t.auth.demoNotice}</span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">{t.auth.login.emailLabel}</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">{t.auth.login.passwordLabel}</Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? t.auth.login.submitting : t.auth.login.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.login.noAccount}{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          {t.auth.login.signUpLink}
        </Link>
      </p>
    </AuthShell>
  );
}
