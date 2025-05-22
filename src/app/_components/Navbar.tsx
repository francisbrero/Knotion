"use client";

import Link from "next/link";
import { SignInButton } from "./auth/SignInButton";
import { NotificationBell } from "~/components/ui/NotificationBell";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">KNotion</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {session?.user && <NotificationBell />}
          <SignInButton />
        </div>
      </div>
    </nav>
  );
} 