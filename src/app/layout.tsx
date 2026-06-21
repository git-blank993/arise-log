import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Arise Log - System Status",
  description: "Minimal Daily System Status Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans h-full antialiased dark`}>
      <body className="min-h-full bg-neutral-950 text-neutral-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
