"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BellIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { pusherClient, getUserChannelName } from "~/lib/pusher";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notificationData, refetch: refetchCount } = api.notifications.count.useQuery(
    undefined,
    { enabled: !!session?.user }
  );
  
  const { data: recentNotifications, refetch: refetchNotifications } = api.notifications.list.useQuery(
    { limit: 5, onlyUnread: false },
    { enabled: !!session?.user }
  );
  
  const markAsRead = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchNotifications();
    },
  });

  const markAllAsRead = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchNotifications();
    },
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const channel = pusherClient.subscribe(getUserChannelName(session.user.id));
    
    channel.bind("new-notification", () => {
      void refetchCount();
      void refetchNotifications();
    });
    
    channel.bind("notification-updated", () => {
      void refetchCount();
      void refetchNotifications();
    });
    
    channel.bind("all-notifications-read", () => {
      void refetchCount();
      void refetchNotifications();
    });
    
    return () => {
      pusherClient.unsubscribe(getUserChannelName(session.user.id));
    };
  }, [session?.user?.id, refetchCount, refetchNotifications]);

  if (!session?.user) {
    return null;
  }

  const unreadCount = notificationData?.count ?? 0;

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-1 text-gray-600 hover:bg-gray-100"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          <div className="mb-2 flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllAsRead.mutate()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {!recentNotifications?.notifications || recentNotifications.notifications.length === 0 ? (
              <p className="py-2 text-center text-sm text-gray-500">No notifications</p>
            ) : (
              recentNotifications.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`mb-1 rounded-md p-2 ${notification.isRead ? "bg-white" : "bg-blue-50"}`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm">
                      {getNotificationText(notification.type, notification.entityId)}
                    </p>
                    <button
                      onClick={() => !notification.isRead && void markAsRead.mutate({ id: notification.id })}
                      className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {notification.isRead ? "" : "Mark read"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-2 border-t pt-2 text-center">
            <Link
              href="/inbox"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 