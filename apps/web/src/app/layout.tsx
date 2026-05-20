import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Nunito, Lato, Montserrat, Merriweather, Playfair_Display, Roboto, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "@/lib/query-client";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
});
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const lato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["300", "400", "700"] });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-merriweather", weight: ["300", "400", "700"] });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-opensans" });

export const metadata: Metadata = {
  title: {
    default: "SeatSnaps",
    template: "%s | SeatSnaps",
  },
  description: "Your event companion app",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SeatSnaps",
    startupImage: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#c4955a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} ${nunito.variable} ${lato.variable} ${montserrat.variable} ${merriweather.variable} ${playfairDisplay.variable} ${roboto.variable} ${openSans.variable} ${inter.className}`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster richColors position="top-center" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
