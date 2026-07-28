import type { Metadata } from "next";
import { SignupContent } from "@/components/auth/signup-content";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return <SignupContent />;
}
