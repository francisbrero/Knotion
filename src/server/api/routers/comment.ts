import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pusherServer, getCommentChannelName, getUserChannelName } from "~/lib/pusher";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
        text: z.string(),
        rangeStart: z.number(),
        rangeEnd: z.number(),
        rangeSelector: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { linkId, text, rangeStart, rangeEnd, rangeSelector, parentId } = input;
      const userId = ctx.session.user.id;

      // Check if the link exists and the user has access
      const link = await ctx.db.link.findFirst({
        where: {
          id: linkId,
          OR: [
            { ownerId: userId }, // User is the owner
            {
              collections: {
                some: {
                  collection: {
                    members: {
                      some: {
                        userId,
                      },
                    },
                  },
                },
              },
            }, // User is a member of a collection that has this link
          ],
        },
      });

      if (!link) {
        throw new Error("Link not found or you don't have access to it");
      }

      // Create the comment
      const comment = await ctx.db.comment.create({
        data: {
          text,
          rangeStart,
          rangeEnd,
          rangeSelector,
          link: {
            connect: {
              id: linkId,
            },
          },
          author: {
            connect: {
              id: userId,
            },
          },
          ...(parentId && {
            parent: {
              connect: {
                id: parentId,
              },
            },
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Create notifications for other users who have access to this link
      // but not for the author of the comment
      if (!parentId) {
        // For top-level comments, notify the link owner if not the comment author
        if (link.ownerId !== userId) {
          await ctx.db.notification.create({
            data: {
              userId: link.ownerId,
              type: "NEW_COMMENT",
              entityId: comment.id,
            },
          });
          
          // Send real-time notification to link owner
          await pusherServer.trigger(
            getUserChannelName(link.ownerId),
            'new-notification',
            {
              type: 'NEW_COMMENT',
              comment,
            }
          );
        }
      } else {
        // For replies, notify the parent comment author if not the reply author
        const parentComment = await ctx.db.comment.findUnique({
          where: { id: parentId },
          select: { authorId: true },
        });

        if (parentComment && parentComment.authorId !== userId) {
          await ctx.db.notification.create({
            data: {
              userId: parentComment.authorId,
              type: "COMMENT_REPLY",
              entityId: comment.id,
            },
          });
          
          // Send real-time notification to parent comment author
          await pusherServer.trigger(
            getUserChannelName(parentComment.authorId),
            'new-notification',
            {
              type: 'COMMENT_REPLY',
              comment,
            }
          );
        }
      }
      
      // Broadcast the new comment to everyone viewing this link
      await pusherServer.trigger(
        getCommentChannelName(linkId),
        'new-comment',
        {
          comment,
        }
      );

      return comment;
    }),

  getByLinkId: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { linkId } = input;
      const userId = ctx.session.user.id;

      // Check if the user has access to the link
      const link = await ctx.db.link.findFirst({
        where: {
          id: linkId,
          OR: [
            { ownerId: userId }, // User is the owner
            {
              collections: {
                some: {
                  collection: {
                    members: {
                      some: {
                        userId,
                      },
                    },
                  },
                },
              },
            }, // User is a member of a collection that has this link
          ],
        },
      });

      if (!link) {
        throw new Error("Link not found or you don't have access to it");
      }

      // Get all comments for this link
      const comments = await ctx.db.comment.findMany({
        where: {
          linkId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return comments;
    }),
}); 