"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download as DownloadIcon, RefreshCw, FileMinus2 } from "lucide-react";
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react"; // Import FileUp icon
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfDeletePagesTool() {
  const { t } = useTranslation(["common", "tools"]);
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0); // For display

  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      // Reset previous results when a new sharedFile is processed
      setIsComplete(false);

      // If there was an old downloadUrl, it should be revoked.
      // Calling setDownloadUrl(null) here will trigger the other specific
      // useEffect that cleans up downloadUrl.
      // Or, you can manage it like this:
      setDownloadUrl(prevUrl => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null; // Set to null for the new file
      });

      setPageRange(""); // Reset page range for the new file

      // Logic to set totalPages (as in your original code)
      // This is a placeholder, use a proper PDF library for accuracy
      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              setTotalPages(0); 
          } catch (error) {
              console.error("Failed to get page count:", error);
              setTotalPages(0); // Set to 0 or handle error
              toast.error(t("tools:deletePages.errorGettingPageCount"));
          }
      };
      reader.onerror = () => {
          setTotalPages(0);
          toast.error(t("tools:deletePages.errorReadingFile"));
      };
      setTotalPages(0);

    } 
  }, [sharedFile, router, t, toolTarget, setSharedFile]);

  useEffect(() => {
    if (downloadUrl || isComplete) {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setIsComplete(false);
    }
  }, [currentFile, pageRange]);

  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [downloadUrl]);

  const handleDeletePages = async () => {
    if (!currentFile || !pageRange.trim()) {
      toast.error(t("tools:deletePages.fileOrRangeMissing"));
      return;
    }

    setIsProcessing(true);
    setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("page_range", pageRange); // Backend needs to accept this

    // FIXME: Backend endpoint for deleting pages is NOT provided.
    // Replace '/delete-pdf-pages' with your actual endpoint when available.
    const apiEndpoint = `${FASTAPI_BASE_URL}/remove-pages`;
    const headers: HeadersInit = {};
      if (user && user.token) {
        headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
      }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t("tools:deletePages.errorDeletingPages"));
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        throw new Error("Invalid response type, expected PDF.");
      }
      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl);
      setIsComplete(true);
      toast.success(t("tools:merge.mergeComplete"));
    } catch (error: any) {
      setIsProcessing(false);
      setIsComplete(false);
      setDownloadUrl(null);
      toast.error(error.message || t("tools:deletePages.errorDeletingPages"));
    }finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndUploadNew = () => {
    setCurrentFile(null); setSharedFile(null); setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); setIsComplete(false); setPageRange(""); setTotalPages(0);
    router.push("/");
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
          setTotalPages(0);
          if (sharedFile) setSharedFile(null); // Clear context if local is chosen
        } else {
          toast.error(t("upload.errorMessage"));
          setCurrentFile(null);
          if (e.target) e.target.value = ""; // Reset file input
        }
      }
    };

  // Fallback if no file is loaded (e.g., direct navigation)
  if (!currentFile && !sharedFile) {
    return (
      <Card className="p-6 text-center w-full mx-auto">
        <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("tools.addWatermark.noFileLoadedTitle")}</h3>
        <p className="text-muted-foreground mb-4">{t("tools.addWatermark.noFileLoadedDesc")}</p>
        <Label htmlFor="pdf-upload-fallback" className="sr-only">
          {t("tools.addWatermark.uploadPdfFileFallback")}
        </Label>
        <div className="flex items-center gap-2 max-w-md mx-auto mb-4">
          <Input
            id="pdf-upload-fallback"
            type="file"
            accept=".pdf"
            onChange={handleLocalFileChange}
            className="flex-1"
          />
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>
          {t("tools.addWatermark.goBackToUpload")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("tools:titles.deletePages")}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
              <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools:changeFile")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-1">{t("tools:descriptions.deletePages")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile?.name}>{currentFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentFile ? (currentFile.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                    {totalPages > 0 ? ` • ${totalPages} ${t("tools:common.pages")}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-range">{t("tools:deletePages.pageRangeLabel")}</Label>
            <Input
              id="page-range"
              placeholder={t("tools:deletePages.pageRangePlaceholder")}
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">{t("tools:deletePages.pageRangeDesc")}</p>
          </div>

          <Button
            onClick={handleDeletePages}
            disabled={isProcessing || !pageRange.trim()}
            className="w-full sm:w-auto" size="lg"
          >
            {isProcessing ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t("tools:deletePages.processing")}</>
            ) : (
              <><FileMinus2 className="mr-2 h-4 w-4" />{t("tools:deletePages.deleteButton")}</>
            )}
          </Button>

          {isComplete && ( // Download button shown even for simulation
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <h3 className="text-base font-semibold text-green-700 dark:text-green-300">{t("tools:deletePages.deleteCompleteTitle")}</h3>
                  <p className="text-xs text-green-600 dark:text-green-400">{t("tools:deletePages.deleteCompleteDesc")}</p>
                </div>
                <Button
                  asChild={!!downloadUrl && downloadUrl !== "#"} // Only make it a link if URL is real
                  disabled={!downloadUrl || downloadUrl === "#"} // Disable if simulated or no URL
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  {downloadUrl && downloadUrl !== "#" ? (
                    <a href={downloadUrl} download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_modified.pdf`}>
                      <DownloadIcon className="mr-2 h-4 w-4" />{t("tools:deletePages.downloadButton")}
                    </a>
                  ) : (
                    <> {/* Button for simulated completion */}
                      <DownloadIcon className="mr-2 h-4 w-4" />{t("tools:deletePages.downloadButton")} (Simulated)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("tools:deletePages.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools:deletePages.steps.step1")}</li>
                <li>{t("tools:deletePages.steps.step2", { totalPages: totalPages > 0 ? totalPages : 'N' })}</li>
                <li>{t("tools:deletePages.steps.step3")}</li>
                <li>{t("tools:deletePages.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}