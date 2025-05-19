"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { FeatureGrid } from "@/components/feature-grid";
import { useAuth } from "@/components/providers/auth-provider";

export default function Home() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isLoadingAuth, logout } = useAuth();


  useEffect(() => {
    // Redirect to login if auth check is complete and no user is found
    if (!isLoadingAuth && !user) {
      router.push("/login");
    }
  }, [user, isLoadingAuth, router]);

  // Show loading screen while checking auth or if user is not yet available (and redirecting)
  if (isLoadingAuth || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-start bg-background space-y-4 py-8">
        {/* Loading state */}
      </div>
    );
  }

  // At this point, user is authenticated
  return (
    <div className="flex min-h-screen flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("dashboard.subtitle")}</p>

        <FileUpload />

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            {t("dashboard.availableTools")}
          </h2>
          <FeatureGrid />
        </div>
      </main>
    </div>
  );
}