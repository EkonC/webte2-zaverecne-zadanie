"use client";

import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard-header";
import { PdfExtractTextTool } from "@/components/tools/pdf-extract-text-tool";

export default function ExtractTextPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex max-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("tools.extractText.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("tools.extractText.description")}
        </p>

        <PdfExtractTextTool />
      </main>
    </div>
  );
}
