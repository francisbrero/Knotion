import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import LinksPage from "./links";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  // Redirect to login if not logged in
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return <LinksPage />;
} 