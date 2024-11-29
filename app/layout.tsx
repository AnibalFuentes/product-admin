// import type { Metadata } from "next";
// import localFont from "next/font/local";
"use client";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { useUser } from "@/hooks/use-user";
import { redirect, usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// import { Metadata } from 'next'

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const pathName = usePathname();

  const authRoutes = ["/", "/forgot-password"];
  const isInAuthRoute = authRoutes.includes(pathName);

  if (user && isInAuthRoute) return redirect("/dashboard");

  return (
    <html lang="es" suppressHydrationWarning>
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="ligth"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

        <Toaster />
      </body>
    </html>
  );
}
