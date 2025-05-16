"use client";

import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard-header";
import { PdfDeletePagesTool } from "@/components/tools/pdf-delete-pages-tool";

export default function DeletePagesPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("tools.delete.pageTitle")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("tools.delete.pageSubtitle")}
        </p>

        <PdfDeletePagesTool />
      </main>
    </div>
  );
}
