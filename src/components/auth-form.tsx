"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export type AuthLabels = {
  loginTitle: string;
  loginSubtitle: string;
  signupTitle: string;
  signupSubtitle: string;
  fullName: string;
  email: string;
  phone: string;
  optional: string;
  password: string;
  passwordHint: string;
  login: string;
  createAccount: string;
  pleaseWait: string;
  newHere: string;
  createOne: string;
  haveAccount: string;
  genericError: string;
};

function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/account";
}

export function AuthForm({
  mode,
  next,
  labels,
}: {
  mode: "login" | "signup";
  next?: string;
  labels: AuthLabels;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const destination = safeNext(next);

    setPending(true);
    const { error } = isLogin
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({
          name: String(form.get("name") ?? ""),
          email,
          password,
          phone: String(form.get("phone") ?? "") || undefined,
        });
    setPending(false);

    if (error) {
      toast.error(error.message ?? labels.genericError);
      return;
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">
            {isLogin ? labels.loginTitle : labels.signupTitle}
          </CardTitle>
          <CardDescription>
            {isLogin ? labels.loginSubtitle : labels.signupSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{labels.fullName}</Label>
                  <Input id="name" name="name" required minLength={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {labels.phone}{" "}
                    <span className="text-muted-foreground">
                      ({labels.optional})
                    </span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{labels.email}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{labels.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  {labels.passwordHint}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? labels.pleaseWait
                : isLogin
                  ? labels.login
                  : labels.createAccount}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                {labels.newHere}{" "}
                <Link
                  href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {labels.createOne}
                </Link>
              </>
            ) : (
              <>
                {labels.haveAccount}{" "}
                <Link
                  href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {labels.login}
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
