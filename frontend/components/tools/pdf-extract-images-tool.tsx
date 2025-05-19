"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download as DownloadIcon, RefreshCw, Archive, FileImage } from "lucide-react";
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react"; // Import FileUp icon
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfExtractImagesTool() {
  const { t } = useTranslation("common");
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [imageFormat, setImageFormat] = useState<string>("all"); // "all", "jpeg", "png"
  const [minWidth, setMinWidth] = useState<string>("0"); // Send as number
  const [minHeight, setMinHeight] = useState<string>("0"); // Send as number

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [extractedImageCount, setExtractedImageCount] = useState<number>(0);

  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      // Reset state for the new shared file
      setIsComplete(false);
      if (downloadUrl) { // Accesses current state of downloadUrl
          URL.revokeObjectURL(downloadUrl);
          setDownloadUrl(null);
      }
      setPageRange("");
      setImageFormat("all");
      setMinWidth("0");
      setMinHeight("0");
      setExtractedImageCount(0);
      setTotalPages(0);
    }
    // `downloadUrl` should NOT be a dependency here.
    // `router` and `t` are fine if their change implies a reset or re-evaluation using them.
  }, [sharedFile]);


  // Effect 2: Clears results if input parameters for extraction change
  useEffect(() => {
    // console.log("Input parameters changed, clearing previous results.");
    if (isComplete || downloadUrl) { // If there was a result
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
        setIsComplete(false);
        setExtractedImageCount(0);
        // Keep totalPages as it's related to the currentFile, not the extraction params
    }
  }, [currentFile, pageRange, imageFormat, minWidth, minHeight]);


  // Effect 3: Cleanup object URL when component unmounts or downloadUrl changes to a new one
  // (or becomes null from elsewhere)
  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => {
      if (currentUrl) {
        // console.log("Cleaning up Object URL:", currentUrl);
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [downloadUrl]);

  const handleExtractImages = async () => {
    if (!currentFile) {
      toast.error(t("tools.extractImages.noFileSelectedError"));
      return;
    }
    setIsProcessing(true);
    setIsComplete(false); // Reset completion state
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl); // Revoke old URL
      setDownloadUrl(null);             // Clear old URL state
    }
    setExtractedImageCount(0); // Reset extracted image count

    const formData = new FormData();
    formData.append("file", currentFile);
    if (pageRange.trim()) formData.append("page_range", pageRange.trim());
    formData.append("image_format", imageFormat);
    formData.append("min_width", minWidth || "0");
    formData.append("min_height", minHeight || "0");

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/extract-images`, {
        method: "POST",
        body: formData,
        headers: headers,
      });

      if (!response.ok) { /* ... error handling ... */ throw new Error(`HTTP error! status: ${response.status}`); }
      
      const imageCountHeader = response.headers.get("x-image-count");
      if (imageCountHeader) {
        setExtractedImageCount(parseInt(imageCountHeader, 10) || 0);
      }

      const blob = await response.blob();
      if (blob.type !== "application/zip") { /* ... error handling ... */ throw new Error("Invalid response type, expected ZIP."); }

      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl); // Set the new URL
      setIsComplete(true);    // Set completion state
      toast.success(t("tools.extractImages.extractComplete"));
    } catch (error) {
      console.error("Error extracting images:", error);
      toast.error(`${t("tools.extractImages.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`);
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleResetAndUploadNew = () => { /* ... same as other tools ... */
    setCurrentFile(null); setSharedFile(null); setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); setIsComplete(false);
    setPageRange(""); setImageFormat("all"); setMinWidth("0"); setMinHeight("0");
    setTotalPages(0); setExtractedImageCount(0);
    router.push("/");
  };


  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
          setTotalPages(Math.floor(Math.random() * 20) + 5);
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
            <CardTitle>{t("tools.titles.extractImages")}</CardTitle>
            <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
              <RefreshCw className="h-3 w-3 mr-1.5" />{t("tools.changeFile")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-1">{t("tools.extractImages.description")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md"> {/* File Info */}
                <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile?.name}>{currentFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                    {currentFile ? (currentFile.size / 1024 / 1024).toFixed(2) : "0.00"} MB
                    {totalPages > 0 ? ` • ${totalPages} ${t("tools.common.pages")}` : ""}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4"> {/* Column 1 */}
                    <h3 className="text-base font-medium">{t("tools.extractImages.optionsTitle")}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="page-range-extract">{t("tools.extractImages.pageRangeLabel")}</Label>
                        <Input id="page-range-extract" placeholder="e.g., 1-3, 5 or leave blank for all" value={pageRange} onChange={(e) => setPageRange(e.target.value)} />
                        <p className="text-xs text-muted-foreground">{t("tools.extractImages.pageRangeDesc")}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("tools.extractImages.imageFormatLabel")}</Label>
                        <RadioGroup value={imageFormat} onValueChange={setImageFormat} className="flex space-x-4">
                            {(["all", "jpeg", "png"] as const).map(format => (
                                <div key={format} className="flex items-center space-x-1">
                                    <RadioGroupItem value={format} id={`format-${format}`} />
                                    <Label htmlFor={`format-${format}`} className="font-normal">{t(`tools.extractImages.formats.${format}`)}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
                <div className="space-y-4"> {/* Column 2 */}
                    <div className="space-y-2">
                        <Label htmlFor="min-width">{t("tools.extractImages.minWidthLabel")}</Label>
                        <Input id="min-width" type="number" placeholder="e.g., 100" value={minWidth} onChange={(e) => setMinWidth(e.target.value)} />
                        <p className="text-xs text-muted-foreground">{t("tools.extractImages.minWidthDesc")}</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="min-height">{t("tools.extractImages.minHeightLabel")}</Label>
                        <Input id="min-height" type="number" placeholder="e.g., 100" value={minHeight} onChange={(e) => setMinHeight(e.target.value)} />
                        <p className="text-xs text-muted-foreground">{t("tools.extractImages.minHeightDesc")}</p>
                    </div>
                </div>
            </div>

            <Button onClick={handleExtractImages} disabled={isProcessing || !currentFile} className="w-full sm:w-auto" size="lg">
                {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t("tools.extractImages.processing")}</>
                ) : (
                    <><FileImage className="mr-2 h-4 w-4" />{t("tools.extractImages.extractButton")}</>
                )}
            </Button>

            {isComplete && downloadUrl && ( /* Download section */
                 <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-green-700 dark:text-green-300">{t("tools.extractImages.extractCompleteTitle")}</h3>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {t("tools.extractImages.extractCompleteDesc", { count: extractedImageCount })}
                            </p>
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                        <a href={downloadUrl} download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_extracted_images.zip`}>
                            <Archive className="mr-2 h-4 w-4" />
                            <span>{t("tools.extractImages.downloadZipButton")}</span>
                        </a>
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      <Card> {/* How To Card */}
        <CardHeader><CardTitle>{t("tools.extractImages.howToTitle")}</CardTitle></CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools.extractImages.steps.step1")}</li>
                <li>{t("tools.extractImages.steps.step2")}</li>
                <li>{t("tools.extractImages.steps.step3")}</li>
                <li>{t("tools.extractImages.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}