import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { studioBrand } from "@/lib/brand";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: studioBrand.adminTitle,
  description: `${studioBrand.name} yönetim paneli`,
  manifest: "/manifest.json",
  applicationName: studioBrand.name,
  appleWebApp: {
    capable: true,
    title: studioBrand.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#100A07",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${display.variable} ${body.variable} font-body`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
