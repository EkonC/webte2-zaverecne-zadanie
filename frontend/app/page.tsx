"use client";

import { useTranslation } from "react-i18next";
import { redirect } from "next/navigation";
import { FileUpload } from "@/components/file-upload";
import { FeatureGrid } from "@/components/feature-grid";

export default function Home() {
  const { t } = useTranslation("common");

  //TODO: Check if the user is authenticated
  // For demo purposes, we'll assume the user is authenticated
  const isAuthenticated = true;

  if (!isAuthenticated) {
    redirect("/login");
  }

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
