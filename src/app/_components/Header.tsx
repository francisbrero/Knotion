"use client";

import Link from "next/link";

import { SignInButton } from "./auth/SignInButton";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold text-purple-700">
          KNotion
        </Link>
        <SignInButton />
      </div>
    </header>
  );
} 