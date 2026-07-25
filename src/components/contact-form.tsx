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

export type ContactFormLabels = {
  name: string;
  namePlaceholder: string;
  email: string;
  phone: string;
  optional: string;
  phonePlaceholder: string;
  message: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  sentTitle: string;
  sentBody: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [state, formAction, pending] = useActionState(
    submitContactMessage,
    initialState
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-10 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h3 className="font-heading text-xl font-semibold">
          {labels.sentTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{labels.sentBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{labels.name}</Label>
          <Input
            id="name"
            name="name"
            placeholder={labels.namePlaceholder}
            required
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
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
          {labels.phone}{" "}
          <span className="text-muted-foreground">({labels.optional})</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder={labels.phonePlaceholder}
        />
        <FieldError message={state.fieldErrors?.phone} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{labels.message}</Label>
        <Textarea
          id="message"
          name="message"
          placeholder={labels.messagePlaceholder}
          rows={5}
          required
        />
        <FieldError message={state.fieldErrors?.message} />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? labels.sending : labels.send}
      </Button>
    </form>
  );
}
