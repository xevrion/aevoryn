import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/Layout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aevoryn",
  description: "A radically minimal Pomodoro experience optimized for quiet productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans" suppressHydrationWarning>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

