import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import I18nProviderComponent from "@/components/i18n-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Manipulator",
  description: "A modern web application for PDF file manipulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className={inter.className}>
        <I18nProviderComponent>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </I18nProviderComponent>
      </body>
    </html>
  );
}
