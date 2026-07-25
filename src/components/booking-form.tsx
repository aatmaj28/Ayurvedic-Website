"use client";

import { useActionState, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAppointment,
  type BookingFormState,
} from "@/lib/actions/appointments";
import { APPOINTMENT_SLOTS, formatInr } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type BookableBranch = {
  id: string;
  slug: string;
  name: string;
  city: string;
  consultationFee: number;
};

const initialState: BookingFormState = { status: "idle" };

export type BookingLabels = {
  title: string;
  subtitle: string;
  centre: string;
  chooseCentre: string;
  date: string;
  timeSlot: string;
  slotsHint: string;
  slotsPrompt: string;
  notes: string;
  optional: string;
  notesPlaceholder: string;
  summaryPrefix: string;
  summarySuffix: string;
  confirm: string;
  booking: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function BookingForm({
  branches,
  initialBranchSlug,
  minDate,
  maxDate,
  labels,
}: {
  branches: BookableBranch[];
  initialBranchSlug?: string;
  minDate: string;
  maxDate: string;
  labels: BookingLabels;
}) {
  const preselected =
    branches.find((branch) => branch.slug === initialBranchSlug) ?? null;

  const [branchId, setBranchId] = useState(preselected?.id ?? "");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availability, setAvailability] = useState<{
    key: string;
    bookedSlots: string[];
  } | null>(null);
  const [state, formAction, pending] = useActionState(
    createAppointment,
    initialState
  );

  const availabilityKey = `${branchId}|${date}`;

  useEffect(() => {
    if (!branchId || !date) return;
    const key = `${branchId}|${date}`;
    let cancelled = false;
    fetch(`/api/availability?branchId=${branchId}&date=${date}`)
      .then((res) => (res.ok ? res.json() : { bookedSlots: [] }))
      .then((data: { bookedSlots?: string[] }) => {
        if (!cancelled) {
          setAvailability({ key, bookedSlots: data.bookedSlots ?? [] });
        }
      })
      .catch(() => {
        if (!cancelled) setAvailability({ key, bookedSlots: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, date]);

  // Derived, not stored: booked slots only apply to the current branch+date,
  // and a selection is dropped if that slot turns out to be taken.
  const bookedSlots =
    availability?.key === availabilityKey ? availability.bookedSlots : [];
  const slot = bookedSlots.includes(selectedSlot) ? "" : selectedSlot;

  const selectedBranch = branches.find((branch) => branch.id === branchId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{labels.title}</CardTitle>
        <CardDescription>{labels.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="branch">{labels.centre}</Label>
            <Select name="branchId" value={branchId} onValueChange={setBranchId}>
              <SelectTrigger id="branch" className="w-full">
                <SelectValue placeholder={labels.chooseCentre} />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} — {formatInr(branch.consultationFee)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={state.fieldErrors?.branchId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{labels.date}</Label>
            <Input
              id="date"
              name="date"
              type="date"
              min={minDate}
              max={maxDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <FieldError message={state.fieldErrors?.date} />
          </div>

          <div className="space-y-2">
            <Label>{labels.timeSlot}</Label>
            <input type="hidden" name="slot" value={slot} />
            <div className="grid grid-cols-4 gap-2">
              {APPOINTMENT_SLOTS.map((slotOption) => {
                const isBooked = bookedSlots.includes(slotOption);
                return (
                  <button
                    key={slotOption}
                    type="button"
                    disabled={isBooked || !branchId || !date}
                    onClick={() => setSelectedSlot(slotOption)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                      slot === slotOption
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted",
                      (isBooked || !branchId || !date) &&
                        "cursor-not-allowed opacity-40 hover:bg-background"
                    )}
                  >
                    {slotOption}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {branchId && date ? labels.slotsHint : labels.slotsPrompt}
            </p>
            <FieldError message={state.fieldErrors?.slot} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              {labels.notes}{" "}
              <span className="text-muted-foreground">({labels.optional})</span>
            </Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder={labels.notesPlaceholder}
            />
            <FieldError message={state.fieldErrors?.notes} />
          </div>

          {selectedBranch && (
            <div className="rounded-lg bg-muted/60 p-4 text-sm">
              <p>
                {labels.summaryPrefix} <strong>{selectedBranch.name}</strong> —{" "}
                <strong>{formatInr(selectedBranch.consultationFee)}</strong>,{" "}
                {labels.summarySuffix}
              </p>
            </div>
          )}

          {state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || !branchId || !date || !slot}
          >
            {pending ? labels.booking : labels.confirm}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
