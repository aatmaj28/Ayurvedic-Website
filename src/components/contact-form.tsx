"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitContactMessage,
  type ContactFormState,
} from "@/lib/actions/contact";

const initialState: ContactFormState = { status: "idle" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h3 className="font-heading text-xl font-semibold">Message sent</h3>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your full name" required />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
          <FieldError message={state.fieldErrors?.email} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 98xxx xxxxx"
        />
        <FieldError message={state.fieldErrors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us about your symptoms or ask us anything…"
          rows={5}
          required
        />
        <FieldError message={state.fieldErrors?.message} />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
