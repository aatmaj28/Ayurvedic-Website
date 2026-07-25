import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, dict] = await Promise.all([searchParams, getDictionary()]);
  return (
    <AuthForm
      mode="signup"
      next={next}
      labels={{ ...dict.auth, optional: dict.common.optional }}
    />
  );
}
