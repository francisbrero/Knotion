import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pusherServer, getUserChannelName } from "~/lib/pusher";

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        onlyUnread: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, onlyUnread } = input;
      const userId = ctx.session.user.id;

      const notifications = await ctx.db.notification.findMany({
        where: {
          userId,
          ...(onlyUnread && { isRead: false }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (notifications.length > limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem?.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  count: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const count = await ctx.db.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session.user.id;

      const notification = await ctx.db.notification.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      const updatedNotification = await ctx.db.notification.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      });

      // Notify the client about the update
      await pusherServer.trigger(
        getUserChannelName(userId),
        "notification-updated",
        {
          id,
          isRead: true,
        }
      );

      return updatedNotification;
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    await ctx.db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Notify the client about the update
    await pusherServer.trigger(
      getUserChannelName(userId),
      "all-notifications-read",
      {}
    );

    return { success: true };
  }),
}); 