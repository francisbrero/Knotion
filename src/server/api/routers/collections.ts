import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";

export const collectionsRouter = createTRPCRouter({
  // Get all collections for the current user
  getAll: publicProcedure.query(async ({ ctx }) => {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view collections",
      });
    }

    return ctx.db.collection.findMany({
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

  // Get a single collection by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view this collection",
        });
      }

      const collection = await ctx.db.collection.findUnique({
        where: { id: input.id },
        include: {
          links: {
            include: {
              link: {
                include: {
                  tags: {
                    include: {
                      tag: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (collection.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this collection",
        });
      }

      return collection;
    }),

  // Create a new collection
  create: publicProcedure
    .input(z.object({ 
      name: z.string().min(1),
      visibility: z.enum(["PRIVATE", "SHARED"]).default("PRIVATE")
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a collection",
        });
      }

      // Check if collection already exists with the same name
      const existingCollection = await ctx.db.collection.findFirst({
        where: {
          name: input.name,
          ownerId: session.user.id,
        },
      });

      if (existingCollection) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Collection with this name already exists",
        });
      }

      return ctx.db.collection.create({
        data: {
          name: input.name,
          visibility: input.visibility,
          ownerId: session.user.id,
        },
      });
    }),

  // Update a collection
  update: publicProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().min(1).optional(),
      visibility: z.enum(["PRIVATE", "SHARED"]).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a collection",
        });
      }

      // Check if the collection exists and belongs to the user
      const existingCollection = await ctx.db.collection.findUnique({
        where: { id: input.id },
      });

      if (!existingCollection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (existingCollection.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this collection",
        });
      }

      // Check for name conflict if name is being updated
      if (input.name && existingCollection.name !== input.name) {
        const nameConflict = await ctx.db.collection.findFirst({
          where: {
            name: input.name,
            ownerId: session.user.id,
            id: { not: input.id },
          },
        });

        if (nameConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Collection name already exists",
          });
        }
      }

      return ctx.db.collection.update({
        where: { id: input.id },
        data: {
          name: input.name,
          visibility: input.visibility,
        },
      });
    }),

  // Delete a collection
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a collection",
        });
      }

      // Check if the collection exists and belongs to the user
      const existingCollection = await ctx.db.collection.findUnique({
        where: { id: input.id },
      });

      if (!existingCollection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (existingCollection.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this collection",
        });
      }

      // Delete the collection (also cascades to linkCollections)
      await ctx.db.collection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add a link to a collection
  addLink: publicProcedure
    .input(z.object({ 
      collectionId: z.string(),
      linkId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add a link to a collection",
        });
      }

      // Check if both collection and link exist and belong to the user
      const collection = await ctx.db.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (collection.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to modify this collection",
        });
      }

      const link = await ctx.db.link.findUnique({
        where: { id: input.linkId },
      });

      if (!link) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (link.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to use this link",
        });
      }

      // Check if the link is already in the collection
      const existingLinkCollection = await ctx.db.linkCollection.findFirst({
        where: {
          linkId: input.linkId,
          collectionId: input.collectionId,
        },
      });

      if (existingLinkCollection) {
        return existingLinkCollection;
      }

      // Add the link to the collection
      return ctx.db.linkCollection.create({
        data: {
          linkId: input.linkId,
          collectionId: input.collectionId,
        },
      });
    }),

  // Remove a link from a collection
  removeLink: publicProcedure
    .input(z.object({ 
      collectionId: z.string(),
      linkId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to remove a link from a collection",
        });
      }

      // Check if the collection exists and belongs to the user
      const collection = await ctx.db.collection.findUnique({
        where: { id: input.collectionId },
      });

      if (!collection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collection not found",
        });
      }

      if (collection.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to modify this collection",
        });
      }

      // Remove the link from the collection
      await ctx.db.linkCollection.deleteMany({
        where: {
          linkId: input.linkId,
          collectionId: input.collectionId,
        },
      });

      return { success: true };
    }),
}); 