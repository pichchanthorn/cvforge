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

export function SignupContent() {
  const t = useT();
  const router = useRouter();
  const { signUp } = useDemoAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = t.auth.formErrors.nameRequired;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = t.auth.formErrors.emailInvalid;
    if (password.length < 6) nextErrors.password = t.auth.formErrors.passwordTooShort;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    signUp(name, email);
    // No success toast here on purpose: a `toast()` call in the same tick as
    // `router.push()` reliably breaks the destination page's dropdown menus
    // (Sonner's re-render appears to interfere with base-ui Menu's mount
    // during the navigation transition). The dashboard already greets the
    // user by name, so the toast was redundant anyway.
    router.push("/dashboard");
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">{t.auth.signup.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.auth.signup.subtitle}</p>

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
        <span>{t.auth.demoNotice}</span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-name">{t.auth.signup.nameLabel}</Label>
          <Input
            id="signup-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            autoComplete="name"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email">{t.auth.signup.emailLabel}</Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-password">{t.auth.signup.passwordLabel}</Label>
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? t.auth.signup.submitting : t.auth.signup.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.signup.haveAccount}{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          {t.auth.signup.logInLink}
        </Link>
      </p>
    </AuthShell>
  );
}
