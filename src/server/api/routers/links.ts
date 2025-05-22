import { z } from "zod";
import metascraper from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperDescription from "metascraper-description";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";

// Set up metascraper with the desired plugins
const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
]);

export const linksRouter = createTRPCRouter({
  // Get a link by URL for the current user
  getByUrl: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view links",
        });
      }

      const link = await ctx.db.link.findFirst({
        where: { 
          url: input.url,
          ownerId: session.user.id 
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!link) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      return link;
    }),

  // Save a link from the Chrome extension
  save: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
        tags: z.array(z.string()).optional(),
        collectionId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to save a link",
        });
      }

      // Check if the link already exists for this user
      const existingLink = await ctx.db.link.findFirst({
        where: {
          url: input.url,
          ownerId: session.user.id,
        },
      });

      // If it exists, just return it
      if (existingLink) {
        return existingLink;
      }

      // Try to fetch metadata
      let title: string | undefined;
      let description: string | undefined;

      try {
        const html = await fetch(input.url).then(res => res.text());
        const metadata = await scraper({ html, url: input.url });
        
        title = metadata.title;
        description = metadata.description;
      } catch (error: unknown) {
        console.error("Error fetching metadata:", error instanceof Error ? error.message : String(error));
        // Continue without metadata if fetching fails
      }

      // Create the link
      const link = await ctx.db.link.create({
        data: {
          url: input.url,
          title: title ?? "Untitled",
          description: description ?? "",
          ownerId: session.user.id,
        },
      });

      // Create tags if provided
      if (input.tags && input.tags.length > 0) {
        for (const tagName of input.tags) {
          // First find or create the tag
          let tag = await ctx.db.tag.findFirst({
            where: {
              name: tagName,
              ownerId: session.user.id,
            },
          });

          if (!tag) {
            tag = await ctx.db.tag.create({
              data: {
                name: tagName,
                ownerId: session.user.id,
              },
            });
          }

          // Then create the link-tag association
          await ctx.db.linkTag.create({
            data: {
              linkId: link.id,
              tagId: tag.id,
            },
          });
        }
      }

      // Add to collection if specified
      if (input.collectionId) {
        // First check if the collection exists and belongs to the user
        const collection = await ctx.db.collection.findUnique({
          where: { id: input.collectionId },
        });

        if (collection && collection.ownerId === session.user.id) {
          await ctx.db.linkCollection.create({
            data: {
              linkId: link.id,
              collectionId: input.collectionId,
            },
          });
        }
      }

      return link;
    }),

  // Get all links for the current user
  getAll: publicProcedure.query(async ({ ctx }) => {
    const session = await getServerAuthSession();
    
    if (!session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view links",
      });
    }

    return ctx.db.link.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }),

  // Get a single link by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view this link",
        });
      }

      const link = await ctx.db.link.findUnique({
        where: { id: input.id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          collections: {
            include: {
              collection: true,
            },
          },
        },
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
          message: "You don't have permission to view this link",
        });
      }

      return link;
    }),

  // Create a new link
  create: publicProcedure
    .input(
      z.object({
        url: z.string().url(),
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a link",
        });
      }

      // If title and description are not provided, try to fetch metadata
      let title = input.title;
      let description = input.description;

      if (!title || !description) {
        try {
          const html = await fetch(input.url).then(res => res.text());
          const metadata = await scraper({ html, url: input.url });
          
          if (!title && metadata.title) {
            title = metadata.title;
          }
          
          if (!description && metadata.description) {
            description = metadata.description;
          }
        } catch (error) {
          console.error("Error fetching metadata:", error);
          // Continue without metadata if fetching fails
        }
      }

      // Create the link
      const link = await ctx.db.link.create({
        data: {
          url: input.url,
          title,
          description,
          ownerId: session.user.id,
        },
      });

      // Create tags if provided
      if (input.tags && input.tags.length > 0) {
        for (const tagName of input.tags) {
          // First find or create the tag
          let tag = await ctx.db.tag.findFirst({
            where: {
              name: tagName,
              ownerId: session.user.id,
            },
          });

          if (!tag) {
            tag = await ctx.db.tag.create({
              data: {
                name: tagName,
                ownerId: session.user.id,
              },
            });
          }

          // Then create the link-tag association
          await ctx.db.linkTag.create({
            data: {
              linkId: link.id,
              tagId: tag.id,
            },
          });
        }
      }

      return link;
    }),

  // Update a link
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a link",
        });
      }

      // Check if the link exists and belongs to the user
      const existingLink = await ctx.db.link.findUnique({
        where: { id: input.id },
      });

      if (!existingLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (existingLink.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this link",
        });
      }

      // Update the link
      const link = await ctx.db.link.update({
        where: { id: input.id },
        data: {
          url: input.url,
          title: input.title,
          description: input.description,
        },
      });

      // Update tags if provided
      if (input.tags) {
        // First, remove all existing tags
        await ctx.db.linkTag.deleteMany({
          where: { linkId: input.id },
        });

        // Then add the new tags
        for (const tagName of input.tags) {
          // First find or create the tag
          let tag = await ctx.db.tag.findFirst({
            where: {
              name: tagName,
              ownerId: session.user.id,
            },
          });

          if (!tag) {
            tag = await ctx.db.tag.create({
              data: {
                name: tagName,
                ownerId: session.user.id,
              },
            });
          }

          // Then create the link-tag association
          await ctx.db.linkTag.create({
            data: {
              linkId: link.id,
              tagId: tag.id,
            },
          });
        }
      }

      return link;
    }),

  // Delete a link
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerAuthSession();
      
      if (!session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a link",
        });
      }

      // Check if the link exists and belongs to the user
      const existingLink = await ctx.db.link.findUnique({
        where: { id: input.id },
      });

      if (!existingLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link not found",
        });
      }

      if (existingLink.ownerId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this link",
        });
      }

      // Delete the link (cascades to linkTags)
      await ctx.db.link.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
}); 