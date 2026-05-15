import { ReactNode } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-club-display",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-club-sans",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${cormorant.variable} ${outfit.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
