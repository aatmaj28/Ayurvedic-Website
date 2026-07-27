"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type PushLabels = {
  title: string;
  body: string;
  enable: string;
  disable: string;
  enabled: string;
  working: string;
  unsupported: string;
  denied: string;
  error: string;
};

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "unsubscribed"
  | "working";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushNotificationsCard({
  labels,
  vapidPublicKey,
}: {
  labels: PushLabels;
  vapidPublicKey: string;
}) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker
        .getRegistration("/sw.js")
        .catch(() => undefined);
      const subscription = await registration?.pushManager
        .getSubscription()
        .catch(() => null);
      if (!cancelled) setStatus(subscription ? "subscribed" : "unsubscribed");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        toast.error(labels.denied);
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("subscribed");
      toast.success(labels.enabled);
    } catch {
      setStatus("unsubscribed");
      toast.error(labels.error);
    }
  }

  async function disable() {
    setStatus("working");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch {
      setStatus("subscribed");
      toast.error(labels.error);
    }
  }

  if (status === "loading" || status === "unsupported") return null;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {status === "subscribed" ? (
              <BellRing className="size-4" aria-hidden />
            ) : (
              <Bell className="size-4" aria-hidden />
            )}
          </span>
          <div>
            <p className="text-sm font-medium">{labels.title}</p>
            <p className="text-sm text-muted-foreground">{labels.body}</p>
          </div>
        </div>
        {status === "denied" ? (
          <p className="text-sm text-muted-foreground">{labels.denied}</p>
        ) : status === "subscribed" ? (
          <Button variant="outline" size="sm" onClick={disable}>
            <BellOff data-icon="inline-start" aria-hidden /> {labels.disable}
          </Button>
        ) : (
          <Button size="sm" onClick={enable} disabled={status === "working"}>
            {status === "working" ? labels.working : labels.enable}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
