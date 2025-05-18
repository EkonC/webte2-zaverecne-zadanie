"use client";

import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard-header";
import { PdfSplitTool } from "@/components/tools/pdf-split-tool";

export default function SplitPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("tools.split.pageTitle")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("tools.split.pageSubtitle")}
        </p>

        <PdfSplitTool />
      </main>
    </div>
  );
}
