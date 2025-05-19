"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Keep if you want a fallback uploader
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { FileDown, RefreshCw, Download as DownloadIcon } from "lucide-react"; // Updated icons
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation"; // Import useRouter
import { toast } from "sonner"; // Import toast
import { useAuth } from "../providers/auth-provider";
import { FileUp } from "lucide-react"; // Import FileUp icon

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfCompressTool() {
  const { t } = useTranslation("common");
  const { sharedFile, setSharedFile, toolTarget, setToolTarget } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  // Compression level on frontend can map to backend parameters
  const [compressionLevel, setCompressionLevel] = useState<string>("medium"); // "low", "medium", "high", "extreme"
  const [imageQuality, setImageQuality] = useState<number | null>(null); // null means backend default or not set
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true); // Corresponds to backend `remove_duplicates`
  // `remove_images` is not directly exposed in your original UI, but can be an "extreme" option
  // `removeBookmarks`, `removeAnnotations`, `removeMetadata` don't have direct backend equivalents in the provided endpoint
  // We will map `compressionLevel` and `imageQuality` to the backend parameters.

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number>(0);


  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      setOriginalSize(sharedFile.size);
      // Reset previous results when a new file is loaded
      setIsComplete(false);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setNewSize(0);
    }
  }, [sharedFile, router, t]); // Added downloadUrl to dependencies

  // Effect to reset download state if parameters or file change
   useEffect(() => {
    if (downloadUrl || isComplete) {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setIsComplete(false);
      setNewSize(0);
    }
  }, [currentFile, compressionLevel, imageQuality, removeDuplicates]);


  // Cleanup for downloadUrl when component unmounts or downloadUrl itself is replaced
  useEffect(() => {
    const currentUrl = downloadUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [downloadUrl]);


  const handleCompress = async () => {
    if (!currentFile) {
      toast.error(t("tools.compress.noFileSelectedError"));
      return;
    }

    setIsProcessing(true);
    setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setNewSize(0);

    const formData = new FormData();
    formData.append("file", currentFile);

    // Map frontend options to backend parameters
    formData.append("remove_duplicates", String(removeDuplicates));

    let backendImageQuality: number | null = null;
    let removeAllImages = false;

    // Interpret compressionLevel and imageQuality setting
    switch (compressionLevel) {
        case "low":
            backendImageQuality = imageQuality !== null ? Math.max(85, imageQuality) : 90; // Higher quality for low compression
            break;
        case "medium":
            backendImageQuality = imageQuality !== null ? imageQuality : 75; // Default or user-set
            break;
        case "high":
            backendImageQuality = imageQuality !== null ? Math.min(60, imageQuality) : 50; // Lower quality for high compression
            break;
        case "extreme":
            // For "extreme", we might choose to remove images or set very low quality
            // This specific endpoint doesn't have a "remove all text" or "simplify paths" type of extreme.
            // Let's assume extreme means lowest image quality or remove images if that becomes an option.
            // For now, let's make it very low quality if user hasn't set imageQuality to null.
            // Or, if you had a "remove_images" checkbox, you'd use it here.
            // For now, just set quality very low or remove images if the backend supported it directly.
            // Your backend has `remove_images`, let's tie "extreme" to that if imageQuality slider is not touched OR very low.
            if (imageQuality === null || imageQuality <= 30) { // Threshold for considering image removal
                // This is a UI decision: if "extreme" is selected, and user hasn't specified a higher image quality,
                // we might want to enable `remove_images`.
                // For now, let's just set a very low quality for "extreme"
                backendImageQuality = 20; // Very low quality
                // formData.append("remove_images", "true"); // If you want extreme to mean remove images
            } else {
                backendImageQuality = imageQuality !== null ? Math.min(40, imageQuality) : 40;
            }
            break;
        default: // medium
            backendImageQuality = imageQuality !== null ? imageQuality : 75;
    }

    if (backendImageQuality !== null) {
        formData.append("reduce_image_quality", String(backendImageQuality));
    }
    // If you add a checkbox for `remove_images` in UI:
    // formData.append("remove_images", String(yourRemoveImagesState));

    const headers: HeadersInit = {};
      if (user && user.token) {
        headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
      }

    try {
      const response = await fetch(`${FASTAPI_BASE_URL}/compress-pdf`, {
        method: "POST",
        body: formData,
        headers: headers,
      });

      if (!response.ok) {
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (e) {
          const textError = await response.text();
          if (textError) errorDetail = textError;
        }
        throw new Error(errorDetail);
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const errorJson = JSON.parse(reader.result as string);
                toast.error(`${t("tools.compress.errorProcessing")} ${errorJson.detail || "Invalid server response"}`);
            } catch (e) {
                toast.error(t("tools.compress.invalidResponseError"));
            }
        };
        reader.onerror = function() { toast.error(t("tools.compress.invalidResponseError")); };
        reader.readAsText(blob);
        setIsProcessing(false);
        return;
      }

      setNewSize(blob.size);
      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl);
      setIsComplete(true);
      toast.success(t("tools.compress.compressionComplete"));

    } catch (error) {
      console.error("Error compressing PDF:", error);
      toast.error(
        `${t("tools.compress.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndUploadNew = () => {
    setCurrentFile(null);
    setSharedFile(null);
    setToolTarget(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsComplete(false);
    setOriginalSize(0);
    setNewSize(0);
    // Reset options
    setCompressionLevel("medium");
    setImageQuality(null); // Reset to null to let backend decide or user to explicitly set
    setRemoveDuplicates(true);
    router.push("/");
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0 && !isComplete) return "-"; // Show dash if not yet compressed or no file
    if (bytes === 0 && isComplete) return "0 Bytes"; // Show 0 Bytes if compression results in 0
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const calculateReduction = (): string => {
    if (originalSize === 0 || newSize === 0 || !isComplete) return "0%";
    const reduction = ((originalSize - newSize) / originalSize) * 100;
    return `${reduction.toFixed(1)}%`;
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type === "application/pdf") {
          setCurrentFile(selectedFile);
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
                <CardTitle>{t("tools.titles.compress")}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    {t("tools.changeFile")}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">
                {t("tools.compress.description")}
            </p>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile?.name}>{currentFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                    {t("tools.compress.originalSizeLabel")} {formatFileSize(originalSize)}
                </p>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-base font-medium">
                        {t("tools.compress.compressionOptions")}
                    </h3>
                    <div className="space-y-2">
                        <Label>{t("tools.compress.compressionLevel")}</Label>
                        <RadioGroup
                        value={compressionLevel}
                        onValueChange={setCompressionLevel}
                        className="space-y-1"
                        >
                        {(["low", "medium", "high", "extreme"] as const).map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                                <RadioGroupItem value={level} id={`level-${level}`} />
                                <Label htmlFor={`level-${level}`} className="font-normal">
                                    {t(`tools.compress.levels.${level}`)}
                                </Label>
                            </div>
                        ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="image-quality">
                            {t("tools.compress.imageQuality")}
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                {imageQuality !== null ? `${imageQuality}%` : t("tools.compress.autoQuality")}
                            </span>
                        </div>
                        <Slider
                        id="image-quality"
                        min={20}
                        max={100}
                        step={5}
                        value={imageQuality !== null ? [imageQuality] : [75]} // Default visual if null
                        onValueChange={([v]: number[]) => setImageQuality(v)}
                        disabled={compressionLevel === "extreme"} // Example: disable if extreme implies remove images
                        />
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs"
                            onClick={() => setImageQuality(null)}
                        >
                            {t("tools.compress.resetToAutoQuality")}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                        {t("tools.compress.imageQualityDesc")}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-base font-medium">
                        {t("tools.compress.advancedOptions")}
                    </h3>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                        id="remove-duplicates"
                        checked={removeDuplicates}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                            setRemoveDuplicates(checked === true)
                        }
                        />
                        <Label htmlFor="remove-duplicates" className="font-normal">
                        {t("tools.compress.removeDuplicates")}
                        </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t("tools.compress.removeDuplicatesDesc")}
                    </p>
                    {/*
                    // Placeholders for options not in current backend endpoint:
                    <div className="flex items-center space-x-2 opacity-50">
                        <Checkbox id="remove-bookmarks" disabled />
                        <Label htmlFor="remove-bookmarks" className="font-normal">
                        {t("tools.compress.removeBookmarks")} (Not available)
                        </Label>
                    </div>
                    */}
                </div>
            </div>


          <Button onClick={handleCompress} disabled={isProcessing || !currentFile} className="w-full sm:w-auto" size="lg">
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t("tools.compress.compressing")}
              </>
            ) : (
              t("tools.compress.compressButton")
            )}
          </Button>

          {isComplete && downloadUrl && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <h3 className="text-base font-semibold text-green-700 dark:text-green-300">
                    {t("tools.compress.compressionResultTitle")}
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {t("tools.compress.originalSizeLabel")} {formatFileSize(originalSize)} → {" "}
                    {t("tools.compress.newSizeLabel")} {formatFileSize(newSize)} ({t("tools.compress.reductionLabel")} {calculateReduction()})
                  </p>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                  <a href={downloadUrl} download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_compressed.pdf`}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    <span>{t("tools.compress.downloadButton")}</span>
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How To Card (Optional - can be a separate component or at the bottom) */}
      <Card>
        <CardHeader>
            <CardTitle>{t("tools.compress.howToTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                <li>{t("tools.compress.steps.step1")}</li>
                <li>{t("tools.compress.steps.step2")}</li>
                <li>{t("tools.compress.steps.step3")}</li>
                <li>{t("tools.compress.steps.step4")}</li>
            </ol>
        </CardContent>
      </Card>
    </div>
  );
}