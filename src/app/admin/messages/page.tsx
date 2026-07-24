import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toggleMessageRead } from "@/lib/actions/admin";
import { formatDateTime } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin · Messages",
};

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>No contact messages yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className={cn(message.read && "opacity-70")}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">
                {message.name}
                {!message.read && (
                  <Badge className="ml-2 align-middle">New</Badge>
                )}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(message.createdAt)}
              </span>
            </div>
            <CardDescription>
              <a
                href={`mailto:${message.email}`}
                className="underline-offset-4 hover:underline"
              >
                {message.email}
              </a>
              {message.phone && <> · {message.phone}</>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-start justify-between gap-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.message}
            </p>
            <form action={toggleMessageRead.bind(null, message.id)}>
              <Button size="sm" variant="outline" type="submit">
                {message.read ? "Mark unread" : "Mark read"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
