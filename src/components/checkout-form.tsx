"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, CreditCard, Lock, Minus, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { createCheckoutSession, placeOrder } from "@/lib/actions/orders";
import type { CheckoutField, CheckoutFormState } from "@/lib/orders";
import { formatInr } from "@/lib/constants";

export type CheckoutProduct = {
  slug: string;
  name: string;
  tagline: string;
  priceInr: number;
  courseDays: number;
};

export type CheckoutLabels = {
  deliveryDetails: string;
  whereSend: string;
  quantity: string;
  kitsMax: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine1Placeholder: string;
  addressLine2: string;
  addressLine2Placeholder: string;
  optional: string;
  city: string;
  state: string;
  pincode: string;
  continueToPayment: string;
  detailsError: string;
  pincodeError: string;
  payment: string;
  deliveringTo: string;
  demoTitle: string;
  demoBody: string;
  stripeTitle: string;
  stripeBody: string;
  payWithStripe: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  pay: string;
  processing: string;
  editDelivery: string;
  orderSummary: string;
  delivery: string;
  free: string;
  total: string;
  dayCourse: string;
  dispatchNote: string;
};

type Address = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

const initialState: CheckoutFormState = { status: "idle" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function CheckoutForm({
  product,
  defaults,
  labels,
  stripeEnabled,
}: {
  product: CheckoutProduct;
  defaults: { name: string; phone: string };
  labels: CheckoutLabels;
  stripeEnabled: boolean;
}) {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState<Address>({
    name: defaults.name,
    phone: defaults.phone,
    line1: "",
    line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    stripeEnabled ? createCheckoutSession : placeOrder,
    initialState
  );

  const total = product.priceInr * quantity;

  function setField(field: keyof Address, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function continueToPayment() {
    const required: (keyof Address)[] = ["name", "phone", "line1", "city", "state", "pincode"];
    const missing = required.some((field) => !address[field].trim());
    if (missing) {
      setDetailsError(labels.detailsError);
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setDetailsError(labels.pincodeError);
      return;
    }
    setDetailsError(null);
    setStep("payment");
  }

  const fieldError = (field: CheckoutField) => state.fieldErrors?.[field];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        {step === "details" ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                {labels.deliveryDetails}
              </CardTitle>
              <CardDescription>
                {labels.whereSend} {product.name}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{labels.quantity}</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="−"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((current) => current - 1)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="+"
                    disabled={quantity >= 5}
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    <Plus />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {labels.kitsMax}
                  </span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ship-name">{labels.recipientName}</Label>
                  <Input
                    id="ship-name"
                    value={address.name}
                    onChange={(event) => setField("name", event.target.value)}
                  />
                  <FieldError message={fieldError("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-phone">{labels.phone}</Label>
                  <Input
                    id="ship-phone"
                    type="tel"
                    value={address.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                  />
                  <FieldError message={fieldError("phone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ship-line1">{labels.addressLine1}</Label>
                <Input
                  id="ship-line1"
                  placeholder={labels.addressLine1Placeholder}
                  value={address.line1}
                  onChange={(event) => setField("line1", event.target.value)}
                />
                <FieldError message={fieldError("line1")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ship-line2">
                  {labels.addressLine2}{" "}
                  <span className="text-muted-foreground">
                    ({labels.optional})
                  </span>
                </Label>
                <Input
                  id="ship-line2"
                  placeholder={labels.addressLine2Placeholder}
                  value={address.line2}
                  onChange={(event) => setField("line2", event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ship-city">{labels.city}</Label>
                  <Input
                    id="ship-city"
                    value={address.city}
                    onChange={(event) => setField("city", event.target.value)}
                  />
                  <FieldError message={fieldError("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-state">{labels.state}</Label>
                  <Input
                    id="ship-state"
                    value={address.state}
                    onChange={(event) => setField("state", event.target.value)}
                  />
                  <FieldError message={fieldError("state")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ship-pincode">{labels.pincode}</Label>
                  <Input
                    id="ship-pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(event) => setField("pincode", event.target.value)}
                  />
                  <FieldError message={fieldError("pincode")} />
                </div>
              </div>
              {detailsError && (
                <p className="text-sm text-destructive">{detailsError}</p>
              )}
              <Button size="lg" className="w-full" onClick={continueToPayment}>
                {labels.continueToPayment}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl">
                <CreditCard className="size-5" aria-hidden /> {labels.payment}
              </CardTitle>
              <CardDescription>
                {labels.deliveringTo} {address.name}, {address.city} —{" "}
                {address.pincode}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stripeEnabled ? (
                <Alert>
                  <Lock aria-hidden />
                  <AlertTitle>{labels.stripeTitle}</AlertTitle>
                  <AlertDescription>{labels.stripeBody}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <Lock aria-hidden />
                    <AlertTitle>{labels.demoTitle}</AlertTitle>
                    <AlertDescription>{labels.demoBody}</AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">{labels.cardNumber}</Label>
                    <Input
                      id="card-number"
                      defaultValue="4242 4242 4242 4242"
                      autoComplete="off"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">{labels.expiry}</Label>
                      <Input
                        id="card-expiry"
                        defaultValue="12/28"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvv">{labels.cvv}</Label>
                      <Input id="card-cvv" defaultValue="123" autoComplete="off" />
                    </div>
                  </div>
                </>
              )}

              <form action={formAction} className="space-y-4">
                <input type="hidden" name="productSlug" value={product.slug} />
                <input type="hidden" name="quantity" value={quantity} />
                <input type="hidden" name="name" value={address.name} />
                <input type="hidden" name="phone" value={address.phone} />
                <input type="hidden" name="line1" value={address.line1} />
                <input type="hidden" name="line2" value={address.line2} />
                <input type="hidden" name="city" value={address.city} />
                <input type="hidden" name="state" value={address.state} />
                <input type="hidden" name="pincode" value={address.pincode} />
                {state.status === "error" && (
                  <p className="text-sm text-destructive">{state.message}</p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={pending}>
                  {pending
                    ? labels.processing
                    : `${stripeEnabled ? labels.payWithStripe : labels.pay} · ${formatInr(total)}`}
                </Button>
              </form>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("details")}
              >
                <ArrowLeft data-icon="inline-start" aria-hidden />{" "}
                {labels.editDelivery}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {labels.orderSummary}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>
                {product.name} × {quantity}
              </span>
              <span>{formatInr(product.priceInr * quantity)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{labels.delivery}</span>
              <span>{labels.free}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{labels.total}</span>
              <span>{formatInr(total)}</span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              {product.courseDays}-{labels.dayCourse} {labels.dispatchNote}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
