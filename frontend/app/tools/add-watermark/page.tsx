"use client";

import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard-header";
import { PdfAddWatermarkTool } from "@/components/tools/pdf-add-watermark-tool";

export default function AddWatermarkPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("tools.addWatermark.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("tools.addWatermark.pageSubtitle")}
        </p>

        <PdfAddWatermarkTool />
      </main>
    </div>
  );
}
