"use client";

import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard-header";
import { UsageHistoryTable } from "@/components/usage-history-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t("history.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("history.subtitle")}
            </p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>{t("history.exportCsv")}</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t("history.clearHistory")}</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("history.activityLog")}</CardTitle>
            <CardDescription>{t("history.activityLogDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <UsageHistoryTable />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
