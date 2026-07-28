import type { Metadata } from "next";
import { AccountContent } from "@/components/account/account-content";

export const metadata: Metadata = {
  title: "Account settings",
};

export default function AccountPage() {
  return <AccountContent />;
}
