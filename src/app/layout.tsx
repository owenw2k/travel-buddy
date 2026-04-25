import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Buddy",
  description: "Track the regions you've visited, driven through, and lived in.",
};

/**
 * Root layout wrapping all pages with fonts, theme provider, and base styles.
 *
 * @param children - Page content rendered inside the layout.
 * @returns The HTML shell with ThemeProvider and font variables applied.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
