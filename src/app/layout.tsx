import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "365 Reflexiones — Una para cada día",
  description:
    "Devocional interactivo con 365 reflexiones diarias del pastor Nicolás Abreu. Encuentra inspiración, paz y fortaleza cada día.",
  keywords: [
    "reflexiones",
    "devocional",
    "fe",
    "cristiano",
    "365",
    "inspiración",
    "Nicolás Abreu",
  ],
  authors: [{ name: "Pastor Nicolás Abreu" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "365 Reflexiones — Una para cada día",
    description:
      "Devocional interactivo con 365 reflexiones diarias para fortalecer tu fe.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#C4956A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
