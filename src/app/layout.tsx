import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/contact";
import { isClerkConfigured } from "@/lib/portal/clerk";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "YUSFAITH GLOBAL ENTERPRISES",
    template: "%s · YUSFAITH",
  },
  description:
    "Cement and building materials for contractors, retailers, developers, and wholesale buyers in Nigeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="yusfaith"
      className={`${geistSans.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {isClerkConfigured() ? <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
