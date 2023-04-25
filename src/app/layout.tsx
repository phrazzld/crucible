import './globals.css'
import Link from "next/link";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Crucible',
  description: 'Test, optimize, and perfect your AI\'s performance effortlessly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`min-h-screen bg-gradient-to-br from-red-800 to-indigo-800 ${inter.className}`}
      >
        <header className="w-full py-4 px-8 bg-white shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
              <p className="text-2xl font-semibold text-red-800">
                Crucible
              </p>
            </Link>
          </div>
        </header>
        <main className="container mx-auto mt-8">{children}</main>
      </body>
    </html>
  )
}
