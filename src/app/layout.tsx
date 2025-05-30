"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { trTR } from "@clerk/localizations";
import Navbar from "@/app/components/Navbar";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//export const metadata: Metadata = {
//  title: "Create Next App",
//  description: "Generated by create next app",
//};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showMainNavbar = !pathname.startsWith('/chat');

  return (
    <ClerkProvider localization={trTR}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            {showMainNavbar && <Navbar />}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
