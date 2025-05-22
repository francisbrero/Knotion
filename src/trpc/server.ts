import "server-only";

import type { AppRouter } from "~/server/api/root";

// Dummy API object since we don't need the functionality yet
export const api = {
  post: {
    hello: async () => ({ greeting: "Hello from TRPC" }),
    getLatest: {
      prefetch: async () => null,
    },
  },
};
