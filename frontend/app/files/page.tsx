"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PdfCard, PdfFile } from "@/components/pdf-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { UploadCloud, Trash2, FileText as FileIcon, Loader2 } from "lucide-react";

// Mock data - replace with actual data fetching logic
const initialMockPdfs: PdfFile[] = [
  { id: "1", name: "Sample Document Alpha.pdf", url: "/sample1.pdf" },
  { id: "2", name: "Annual Report 2023.pdf", url: "/sample2.pdf" },
  { id: "3", name: "Product Presentation Q4.pdf", url: "/sample3.pdf" },
  { id: "4", name: "Invoice_INV12345.pdf", url: "/sample-does-not-exist.pdf" },
  { id: "5", name: "User Manual Version 2.1.pdf", url: "/sample1.pdf" },
  { id: "6", name: "Contract Agreement Final.pdf", url: "/sample2.pdf" },
  { id: "7", name: "Research Paper on AI.pdf", url: "/sample3.pdf" },
];

// Number of skeleton cards to display during loading
const SKELETON_CARD_COUNT = 10;

export default function FilesPage() {
  const { t } = useTranslation("common");
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setFiles(initialMockPdfs);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleFileSelect = (fileId: string, isSelected: boolean) => {
    setSelectedFiles(prev => {
      const newSelected = new Set(prev);
      if (isSelected) newSelected.add(fileId);
      else newSelected.delete(fileId);
      return newSelected;
    });
  };

  const handleViewFile = (file: PdfFile) => window.open(file.url, "_blank");

  const handleDownloadFile = (file: PdfFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(t("files.downloading", { fileName: file.name }));
  };

  const handleDeleteFile = (fileToDelete: PdfFile) => {
    if (window.confirm(t("files.confirmDelete", { fileName: fileToDelete.name }))) {
      setFiles(currentFiles => currentFiles.filter(f => f.id !== fileToDelete.id));
      setSelectedFiles(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(fileToDelete.id);
        return newSelected;
      });
      alert(t("files.deleted", { fileName: fileToDelete.name }));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.size === 0) {
      alert(t("files.noFilesSelected"));
      return;
    }
    if (window.confirm(t("files.confirmDeleteSelected", { count: selectedFiles.size }))) {
      setFiles(currentFiles => currentFiles.filter(f => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
      alert(t("files.selectedDeleted", { count: selectedFiles.size }));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = event.target.files;
    if (uploaded && uploaded.length > 0) {
      const newFiles: PdfFile[] = Array.from(uploaded).map((f, index) => ({
        id: `uploaded-${Date.now()}-${index}`,
        name: f.name,
        url: URL.createObjectURL(f),
      }));
      setFiles(prev => [...prev, ...newFiles]);
      alert(t("files.filesUploaded", { count: newFiles.length}));
      event.target.value = "";
    }
  };

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
        <div key={index} className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between p-3 space-y-0 border-b">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-7 w-7 rounded" />
          </div>
          <div className="p-0 flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-800 min-h-[200px] max-h-[280px]">
            <Skeleton className="h-full w-full " />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">{t("files.title")}</h1>
          <div className="flex gap-2">
            {selectedFiles.size > 0 && (
              <Button variant="destructive" onClick={handleDeleteSelected} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("files.deleteSelected", { count: selectedFiles.size })}
              </Button>
            )}
            <Button asChild disabled={isLoading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadCloud className="mr-2 h-4 w-4" />
                {t("files.upload")}
              </label>
            </Button>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>
        </div>

        {isLoading ? (
          renderSkeletonCards()
        ) : files.length === 0 ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <FileIcon size={48} className="mx-auto mb-4" />
            <p>{t("files.noFiles")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {files.map((pdf) => (
              <PdfCard
                key={pdf.id}
                file={pdf}
                isSelected={selectedFiles.has(pdf.id)}
                onSelectChange={(isSelected) => handleFileSelect(pdf.id, isSelected)}
                onView={handleViewFile}
                onDownload={handleDownloadFile}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}