"use client"

import "./globals.css";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLogin = mounted && pathname === "/login";

  return (
    <html lang="en">
      <Head>
        <title>Alfa-Bio - Sistema Clínico</title>
        <meta name="description" content="Sistema de gestión médica profesional" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-foreground nunito-sans w-full flex justify-center min-h-dvh relative">
        {isLogin && <div className="clinical-background-dense"></div>}
        <div className="relative z-10 w-full h-full flex items-center justify-center bg-gray-200">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}