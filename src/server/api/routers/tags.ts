import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";

export const tagsRouter = createTRPCRouter({
  // Get all tags for the current user
  getAll: publicProcedure.query(async ({ ctx }) => {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view tags",
      });
    }

    return ctx.db.tag.findMany({
      where: { ownerId: session.user.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            links: true,
          },
        },
      },
    });
  }),

  // Create a new tag
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a tag",
        });
      }

      // Check if tag already exists
      const existingTag = await ctx.db.tag.findFirst({
        where: {
          name: input.name,
          ownerId: session.user.id,
        },
      });

      if (existingTag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag already exists",
        });
      }

      return ctx.db.tag.create({
        data: {
          name: input.name,
          ownerId: session.user.id,
        },
      });
    }),

  // Update a tag
  update: publicProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a tag",
        });
      }

      // Check if the tag exists and belongs to the user
      const existingTag = await ctx.db.tag.findUnique({
        where: { id: input.id },
      });

      if (!existingTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      if (existingTag.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this tag",
        });
      }

      // Check for name conflict
      if (existingTag.name !== input.name) {
        const nameConflict = await ctx.db.tag.findFirst({
          where: {
            name: input.name,
            ownerId: session.user.id,
            id: { not: input.id },
          },
        });

        if (nameConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag name already exists",
          });
        }
      }

      return ctx.db.tag.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  // Delete a tag
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a tag",
        });
      }

      // Check if the tag exists and belongs to the user
      const existingTag = await ctx.db.tag.findUnique({
        where: { id: input.id },
      });

      if (!existingTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      if (existingTag.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this tag",
        });
      }

      // Delete the tag (also cascades to linkTags)
      await ctx.db.tag.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
}); 