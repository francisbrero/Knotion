import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import TagsManager from "./tags-manager";

export default async function TagsPage() {
  const session = await getServerAuthSession();

  // Redirect to login if not logged in
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <TagsManager />;
} 