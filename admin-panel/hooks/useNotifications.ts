"use client";

import { useMemo } from "react";
import { useAllComments } from "@/hooks/useComments";
import { useScheduleEvents } from "@/hooks/useScheduleEvents";

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTime(value: any) {
  if (!value?.toDate) return "";
  return value.toDate().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useNotifications() {
  const { comments, loading: commentsLoading } = useAllComments(8);
  const { events, loading: eventsLoading } = useScheduleEvents();

  const notifications = useMemo(() => {
    const key = todayKey();
    const todayEvents = events
      .filter((event) => event.eventDateKey === key)
      .slice(0, 5)
      .map((event) => ({
        id: `event-${event.id}`,
        title: event.title,
        description: `${event.startTime || toTime(event.eventDate) || "Bugün"}${event.customerName ? ` · ${event.customerName}` : ""}`,
        href: "/agenda",
        type: "agenda" as const,
      }));

    const latestComments = comments.slice(0, 5).map((comment) => ({
      id: `comment-${comment.id}`,
      title: "Yeni müşteri notu",
      description: `${comment.customerName}: ${comment.text}`,
      href: `/albums/${comment.albumId}`,
      type: "comment" as const,
    }));

    return [...todayEvents, ...latestComments].slice(0, 8);
  }, [comments, events]);

  return {
    notifications,
    loading: commentsLoading || eventsLoading,
    count: notifications.length,
  };
}
