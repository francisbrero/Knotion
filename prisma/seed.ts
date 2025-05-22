import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@knotion.app" },
    update: {},
    create: {
      email: "demo@knotion.app",
      name: "Demo User",
      // In a real app, the user would be created through OAuth,
      // but for seeding we'll create them directly
    },
  });

  console.log(`Created demo user: ${demoUser.name} (${demoUser.id})`);

  // Create a sample collection
  const sampleCollection = await prisma.collection.upsert({
    where: {
      id: "clsample123456789",
    },
    update: {},
    create: {
      id: "clsample123456789",
      name: "Getting Started",
      visibility: "PRIVATE",
      ownerId: demoUser.id,
    },
  });

  console.log(`Created sample collection: ${sampleCollection.name}`);

  // Create a few sample tags
  const sampleTags = await Promise.all(
    ["tutorial", "important", "reference"].map((tagName) =>
      prisma.tag.upsert({
        where: {
          ownerId_name: {
            ownerId: demoUser.id,
            name: tagName,
          },
        },
        update: {},
        create: {
          name: tagName,
          ownerId: demoUser.id,
        },
      })
    )
  );

  console.log(`Created ${sampleTags.length} sample tags`);

  // Create a sample link
  const sampleLink = await prisma.link.upsert({
    where: {
      id: "lksample123456789",
    },
    update: {},
    create: {
      id: "lksample123456789",
      url: "https://github.com/knotion-app/knotion",
      title: "KNotion GitHub Repository",
      description: "The official repository for KNotion app",
      ownerId: demoUser.id,
    },
  });

  console.log(`Created sample link: ${sampleLink.title}`);

  // Connect the link to the collection
  await prisma.linkCollection.upsert({
    where: {
      linkId_collectionId: {
        linkId: sampleLink.id,
        collectionId: sampleCollection.id,
      },
    },
    update: {},
    create: {
      linkId: sampleLink.id,
      collectionId: sampleCollection.id,
    },
  });

  // Connect the link to a tag
  if (sampleTags.length > 0 && sampleTags[0]) {
    await prisma.linkTag.upsert({
      where: {
        linkId_tagId: {
          linkId: sampleLink.id,
          tagId: sampleTags[0].id,
        },
      },
      update: {},
      create: {
        linkId: sampleLink.id,
        tagId: sampleTags[0].id,
      },
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  }); 