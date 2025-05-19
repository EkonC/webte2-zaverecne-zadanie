"use client";

import { useTranslation } from "react-i18next";
import { UsageHistoryTable } from "@/components/usage-history-table"; // Assume this fetches its own data
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Trash2 } from "lucide-react";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { useAuth } from "@/components/providers/auth-provider";
import { useState } from "react";
import { toast } from "sonner"; // Example: using sonner for toasts. Replace with your preferred library.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HistoryPage() {
  const { t } = useTranslation("common");
  const { loading: adminCheckLoading } = useRequireAdmin(); // Loading state from admin check
  const { user, isLoadingAuth } = useAuth(); // User object and auth loading state

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // State to trigger re-fetch in UsageHistoryTable. Changing the key forces a remount.
  const [refreshKey, setRefreshKey] = useState(0);

  // Combined loading state for initial page render
  const pageLoading = adminCheckLoading || isLoadingAuth;

  const handleExportCsv = async () => {
    if (!user?.token) {
      toast.error(t("errors.unauthenticated", "Authentication required."));
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch(`${API_URL}/history/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        // Try to parse error detail from backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t("history.errors.exportFailed", "Failed to export CSV."));
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "history.csv"; // Default filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("history.exportSuccess", "History exported successfully."));
    } catch (error: any) {
      toast.error(error.message || t("history.errors.exportFailed", "An unexpected error occurred during export."));
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user?.token) {
      toast.error(t("errors.unauthenticated", "Authentication required."));
      return;
    }
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/history/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 204) { // Successfully deleted
        toast.success(t("history.clearSuccess", "History cleared successfully."));
        setRefreshKey(prevKey => prevKey + 1); // Trigger re-fetch in UsageHistoryTable
      } else if (response.status === 401 || response.status === 403) {
         toast.error(t("errors.unauthorized", "You are not authorized to perform this action."));
      }
      else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t("history.errors.clearFailed", "Failed to clear history."));
      }
    } catch (error: any) {
      toast.error(error.message || t("history.errors.clearFailed", "An unexpected error occurred while clearing history."));
    } finally {
      setIsDeleting(false);
    }
  };

  // Simple CSS spinner (ensure Tailwind's spin animation is available)
  const spinner = <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />;

  return (
    <div className="flex max-h-screen flex-col">
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
              onClick={handleExportCsv}
              disabled={isExporting || !user} // Disable if no user or already exporting
            >
              {isExporting ? spinner : <Download className="h-4 w-4" />}
              <span>{t("history.exportCsv")}</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleClearHistory}
              disabled={isDeleting || !user} // Disable if no user or already deleting
            >
              {isDeleting ? spinner : <Trash2 className="h-4 w-4" />}
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
            {user && <UsageHistoryTable key={refreshKey} />}
            {!user && <p>{t("errors.unauthenticated", "Please log in to view history.")}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}