import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">K</span>Notion
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="/dashboard"
          >
            <h3 className="text-2xl font-bold">My Links →</h3>
            <div className="text-lg">
              Access your saved links and collections
            </div>
          </Link>
          {!session ? (
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/api/auth/signin"
            >
              <h3 className="text-2xl font-bold">Sign In →</h3>
              <div className="text-lg">
                Sign in with your Google account to get started
              </div>
            </Link>
          ) : (
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/api/auth/signout"
            >
              <h3 className="text-2xl font-bold">Sign Out →</h3>
              <div className="text-lg">
                Signed in as {session.user?.name}
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
