import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import I18nProviderComponent from "@/components/providers/i18n-provider";
import { DashboardHeader } from "@/components/dashboard-header";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { FileProvider } from "@/components/providers/file-provider";

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
        <AuthProvider>
          <FileProvider>
            <I18nProviderComponent>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <DashboardHeader />
                <ToastProvider />
                {children}
              </ThemeProvider>
            </I18nProviderComponent>
          </FileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
