import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Nunito, Lato } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "SeatSnaps",
    template: "%s | SeatSnaps",
  },
  description: "Your event companion app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SeatSnaps",
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
        className={`${inter.variable} ${cormorant.variable} ${nunito.variable} ${lato.variable} ${inter.className}`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster richColors position="top-center" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
