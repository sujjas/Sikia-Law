import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import { InterfaceKit } from "interface-kit/react";
import { Agentation } from "agentation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sikia Law — Legal research for Ugandan law students",
  description:
    "A study companion for Ugandan law students. Notes, case law, statutes, statutory documents — organised by year, semester, and course.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-UG"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        {process.env.NODE_ENV === "development" && (
          <>
            <InterfaceKit />
            <Agentation endpoint="http://localhost:4747" />
          </>
        )}
      </body>
    </html>
  );
}
