import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const SITE = "https://skuld.alexcloud.se"
const DESC =
  "Håll koll på vem som är skyldig vad. Lägg till utgifter och återbetalningar, se aktuellt saldo, kategorier och hur skulden utvecklats över tid."

export const metadata: Metadata = {
  title: "Skuld – håll koll på skulder",
  description: DESC,
  metadataBase: new URL(SITE),
  openGraph: {
    type: "website",
    url: SITE + "/",
    siteName: "Skuld",
    title: "Skuld – håll koll på skulder",
    description: DESC,
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skuld – håll koll på skulder",
    description: DESC,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
