import type { Metadata } from "next";
import { AccountSecurityContent } from "@/components/account/account-security-content";

export const metadata: Metadata = {
  title: "Change password",
};

export default function AccountSecurityPage() {
  return <AccountSecurityContent />;
}
