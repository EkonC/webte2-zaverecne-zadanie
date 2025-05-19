"use client";

import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard-header";
import { PdfExportPngTool } from "@/components/tools/pdf-export-png-tool";

export default function ExportPngPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex max-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("tools.exportPng.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("tools.exportPng.description")}
        </p>

        <PdfExportPngTool />
      </main>
    </div>
  );
}
