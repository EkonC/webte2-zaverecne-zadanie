"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileUpload } from "@/components/file-upload";
import { FeatureGrid } from "@/components/feature-grid";
import { RecentFilesGrid } from "@/components/recent-files-grid";
import { PdfFile } from "@/components/pdf-card"; // PdfFile type is still needed
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock data - in a real app, fetch this from your backend
const allMockPdfs: PdfFile[] = [
  { id: "1", name: "Sample Document Alpha.pdf", url: "/sample1.pdf" },
  { id: "2", name: "Annual Report 2023.pdf", url: "/sample2.pdf" },
  { id: "3", name: "Product Presentation Q4.pdf", url: "/sample3.pdf" },
  { id: "4", name: "Invoice_INV12345.pdf", url: "/sample-does-not-exist.pdf" },
  { id: "5", name: "User Manual Version 2.1.pdf", url: "/sample1.pdf" },
  { id: "6", name: "Contract Agreement Final.pdf", url: "/sample2.pdf" },
  { id: "7", name: "Research Paper on AI.pdf", url: "/sample3.pdf" },
];

const MAX_RECENT_FILES_DISPLAY = 5;

export default function Home() {
  const { t } = useTranslation("common");
  const [recentFilesData, setRecentFilesData] = useState<PdfFile[]>([]);
  const [isLoadingRecentFiles, setIsLoadingRecentFiles] = useState<boolean>(true);

  //TODO: Check if the user is authenticated
  const isAuthenticated = true; // For demo purposes

  if (!isAuthenticated) {
    redirect("/login");
  }

  useEffect(() => {
    setIsLoadingRecentFiles(true);
    setTimeout(() => {
      // Slice the data here before passing to the component
      setRecentFilesData(allMockPdfs.slice(0, MAX_RECENT_FILES_DISPLAY));
      setIsLoadingRecentFiles(false);
    }, 1000);
  }, []);

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

        {/* Recent Files Section */}
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