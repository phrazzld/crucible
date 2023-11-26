"use client"

import { SignOutButton } from '@/app/SignOutButton';
import { AuthContextProvider } from '@/context/AuthContext';
import { Inter } from 'next/font/google';
import Link from "next/link";
import './globals.css';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Crucible</title>
        <meta name="description" content={"Optimize your prompts"} />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`min-h-screen ${inter.className}`}
      >
        <AuthContextProvider>
          <header className="w-full py-4 px-8 bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/dashboard">
                <p className="text-2xl font-semibold text-red-800">
                  Crucible
                </p>
              </Link>
              <SignOutButton />
            </div>
          </header>
          <main className="container mx-auto mt-8">{children}</main>
        </AuthContextProvider>
      </body>
    </html>
  )
}
