"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { pusherClient, getUserChannelName } from "~/lib/pusher";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { RouterOutputs } from "~/trpc/shared";

type NotificationList = RouterOutputs["notifications"]["list"];

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [cursor, setCursor] = useState<string | null>(null);
  
  const { data, refetch, isLoading, isFetching } = api.notifications.list.useQuery(
    { 
      limit: 20,
      cursor: cursor,
      onlyUnread: false 
    },
    { 
      enabled: status === "authenticated",
    }
  );
  
  const markAsRead = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const markAllAsRead = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  // Listen for real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const channel = pusherClient.subscribe(getUserChannelName(session.user.id));
    
    channel.bind("new-notification", () => {
      void refetch();
    });
    
    channel.bind("notification-updated", () => {
      void refetch();
    });
    
    channel.bind("all-notifications-read", () => {
      void refetch();
    });
    
    return () => {
      pusherClient.unsubscribe(getUserChannelName(session.user.id));
    };
  }, [session?.user?.id, refetch]);

  const loadMore = () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  };
  
  if (status === "loading") {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div className="flex justify-center p-8">Please sign in to view your notifications</div>;
  }

  function getNotificationText(type: string, entityId: string) {
    switch (type) {
      case "NEW_COMMENT":
        return "New comment on your link";
      case "COMMENT_REPLY":
        return "Reply to your comment";
      default:
        return "New notification";
    }
  }
  
  function formatDate(dateString: Date | string) {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  }

  const hasUnread = data?.notifications.some(notification => !notification.isRead) ?? false;

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            href="/dashboard" 
            className="mr-2 rounded-full p-1 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        
        {hasUnread && (
          <button
            onClick={() => void markAllAsRead.mutate()}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        {isLoading ? (
          <div className="p-8 text-center">Loading notifications...</div>
        ) : !data?.notifications || data.notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications yet</div>
        ) : (
          <div>
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-b border-gray-100 p-4 last:border-b-0 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {getNotificationText(notification.type, notification.entityId)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <button
                      onClick={() => void markAsRead.mutate({ id: notification.id })}
                      className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {data?.nextCursor && (
              <div className="flex justify-center p-4">
                <button
                  onClick={loadMore}
                  disabled={isFetching}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  {isFetching ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 