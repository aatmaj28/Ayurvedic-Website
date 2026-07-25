import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, dict] = await Promise.all([searchParams, getDictionary()]);
  return (
    <AuthForm
      mode="login"
      next={next}
      labels={{ ...dict.auth, optional: dict.common.optional }}
    />
  );
}
