// app/components/recent-files-grid.tsx
"use client";

import { useTranslation } from "react-i18next";
import { PdfCard, PdfFile } from "@/components/pdf-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText as FileIcon } from "lucide-react";

interface RecentFilesGridProps {
  files: PdfFile[];
  isLoading: boolean;
  maxFilesToShow?: number; // Optional: if you want the component to handle slicing
  skeletonCount?: number;
}

const DEFAULT_SKELETON_COUNT = 5; // Default skeletons for this preview component

export function RecentFilesGrid({
  files,
  isLoading,
  // maxFilesToShow = 5, // If component handles slicing, use this
  skeletonCount = DEFAULT_SKELETON_COUNT,
}: RecentFilesGridProps) {
  const { t } = useTranslation("common");

  // Dummy handlers for PdfCard props as selection/detailed actions might not be primary on dashboard
  const handleDummyAction = () => {};
  const handleViewFile = (file: PdfFile) => {
    window.open(file.url, "_blank");
  };

  const renderSkeletons = () => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6`}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div key={`skeleton-${index}`} className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-7 w-7 rounded" />
          </div>
          <div className="p-0 flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-800 min-h-[180px] max-h-[250px]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return renderSkeletons();
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400 border border-dashed rounded-md">
        <FileIcon size={36} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
        <p>{t("dashboard.noRecentFiles")}</p>
      </div>
    );
  }

  // The parent component (app/page.tsx) will be responsible for slicing the files array
  // to ensure only the desired number (e.g., max 5) are passed to this component.
  const filesToDisplay = files;

  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
        filesToDisplay.length === 1 ? 'sm:grid-cols-1' :
        filesToDisplay.length === 2 ? 'sm:grid-cols-2' :
        filesToDisplay.length === 3 ? 'sm:grid-cols-2 md:grid-cols-3' :
        filesToDisplay.length === 4 ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
        'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' // Max 5, assuming parent sends max 5
      }`}>
      {filesToDisplay.map((pdf) => (
        <PdfCard
          key={`recent-grid-${pdf.id}`}
          file={pdf}
          isSelected={false}
          onSelectChange={handleDummyAction}
          onView={handleViewFile}
          onDownload={handleViewFile}
          onDelete={handleDummyAction}
        />
      ))}
    </div>
  );
}