import NextAuth from "next-auth";

import { authOptions } from "~/server/auth";

// This is the recommended handler for the auth.js App Router integration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 