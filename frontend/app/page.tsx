"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/file-upload";
import { FeatureGrid } from "@/components/feature-grid";
import { RecentFilesGrid } from "@/components/recent-files-grid";
import { PdfFile } from "@/components/pdf-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
// Mock data
const allMockPdfs: PdfFile[] = [
  { id: "1", name: "Sample Document Alpha.pdf", url: "/sample1.pdf" },
  { id: "2", name: "Annual Report 2023.pdf", url: "/sample2.pdf" },
  { id: "3", name: "Project Proposal Beta.pdf", url: "/sample3.pdf" },
  { id: "4", name: "Meeting Notes.pdf", url: "/sample4.pdf" },
  { id: "5", name: "Research Paper Gamma.pdf", url: "/sample5.pdf" },
  { id: "6", name: "Design Mockup Delta.pdf", url: "/sample6.pdf" },
  { id: "7", name: "Financial Overview Epsilon.pdf", url: "/sample7.pdf" },
  { id: "8", name: "User Guide Zeta.pdf", url: "/sample8.pdf" },
];
const MAX_RECENT_FILES_DISPLAY = 5;

export default function Home() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isLoadingAuth, logout } = useAuth();

  const [recentFilesData, setRecentFilesData] = useState<PdfFile[]>([]);
  const [isLoadingRecentFiles, setIsLoadingRecentFiles] = useState<boolean>(true);

  useEffect(() => {
    // Redirect to login if auth check is complete and no user is found
    if (!isLoadingAuth && !user) {
      router.push("/login");
    }
  }, [user, isLoadingAuth, router]);

  useEffect(() => {
    // Fetch recent files only if authenticated and auth check is complete
    if (user && !isLoadingAuth) {
      setIsLoadingRecentFiles(true);
      // Simulate fetching recent files
      setTimeout(() => {
        setRecentFilesData(allMockPdfs.slice(0, MAX_RECENT_FILES_DISPLAY));
        setIsLoadingRecentFiles(false);
      }, 1000);
    } else if (!user && !isLoadingAuth) {
      // If not authenticated (and auth check done), clear files and stop loading
      setRecentFilesData([]);
      setIsLoadingRecentFiles(false);
    }
  }, [user, isLoadingAuth]);

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

        <div className="mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-2xl font-semibold">
              {t("dashboard.recentFiles")}
            </h2>
            <Link href="/files" passHref legacyBehavior>
              <Button variant="outline" size="sm" asChild>
                <a>
                  {t("dashboard.viewAllFiles")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </Link>
          </div>
          <RecentFilesGrid
            files={recentFilesData}
            isLoading={isLoadingRecentFiles}
          />
        </div>
      </main>
    </div>
  );
}