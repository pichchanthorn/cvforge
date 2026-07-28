import type { Metadata } from "next";
import { LoginContent } from "@/components/auth/login-content";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return <LoginContent />;
}
