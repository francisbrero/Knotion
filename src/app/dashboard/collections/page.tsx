import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import CollectionsManager from "./collections-manager";

export default async function CollectionsPage() {
  const session = await getServerAuthSession();

  // Redirect to login if not logged in
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <CollectionsManager />;
} 