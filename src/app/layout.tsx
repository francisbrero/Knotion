import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Header } from "~/app/_components/Header";
import { NextAuthProvider } from "~/app/_components/auth/Provider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "KNotion",
  description: "Knowledge management and note-taking app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <NextAuthProvider>
          <TRPCReactProvider>
            <Header />
            {children}
          </TRPCReactProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
