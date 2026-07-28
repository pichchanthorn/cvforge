"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftIcon, CameraIcon, KeyRoundIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { useT } from "@/lib/i18n/language-context";
import { useDemoAccount, hasActiveDemoSession } from "@/lib/demo-account/demo-account-context";
import { resizeImageToSquareDataUrl } from "@/lib/image/resize-image";

export function AccountContent() {
  const t = useT();
  const router = useRouter();
  const { account, isLoggedIn, updateProfile } = useDemoAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Local `name` input mirrors the account's name, but only once we actually
  // know it — `account` can correct itself post-hydration (see
  // hasActiveDemoSession's doc comment), so this re-syncs whenever the known
  // email changes rather than only on mount.
  const [syncedEmail, setSyncedEmail] = useState<string | null>(null);
  if (account && account.email !== syncedEmail) {
    setSyncedEmail(account.email);
    setName(account.name);
  }

  useEffect(() => {
    if (!hasActiveDemoSession()) router.replace("/login");
  }, [router]);

  if (!isLoggedIn || !account) return null;

  const initial = account.name.trim().charAt(0).toUpperCase() || "?";

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageToSquareDataUrl(file);
      updateProfile({ avatarDataUrl: dataUrl });
    } catch {
      toast.error(t.account.invalidImage);
    }
  }

  function handleRemovePhoto() {
    updateProfile({ avatarDataUrl: null });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    updateProfile({ name });
    toast.success(t.account.saved);
    setIsSaving(false);
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

      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t.account.backToDashboard}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">{t.account.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.account.subtitle}</p>

        <div className="mt-8 flex items-center gap-4">
          <Avatar size="lg">
            {account.avatarDataUrl && <AvatarImage src={account.avatarDataUrl} alt={account.name} />}
            <AvatarFallback className="text-lg">{initial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <CameraIcon className="size-4" />
                {t.account.changePhoto}
              </Button>
              {account.avatarDataUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto}>
                  <XIcon className="size-4" />
                  {t.account.removePhoto}
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-name">{t.account.nameLabel}</Label>
            <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account-email">{t.account.emailLabel}</Label>
            <Input id="account-email" value={account.email} disabled />
            <p className="text-xs text-muted-foreground">{t.account.emailNote}</p>
          </div>
          <Button type="submit" disabled={isSaving} className="mt-2 self-start">
            {isSaving ? t.account.saving : t.account.save}
          </Button>
        </form>

        <div className="mt-10 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t.account.security}</p>
              <p className="text-sm text-muted-foreground">{t.account.securityDesc}</p>
            </div>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/account/security" />}>
              <KeyRoundIcon className="size-4" />
              {t.accountSecurity.title}
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
