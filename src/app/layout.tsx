import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { KeyboardManager } from "@/components/KeyboardManager";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arise Log",
  description: "Personal RPG life tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased">
        <KeyboardManager />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
