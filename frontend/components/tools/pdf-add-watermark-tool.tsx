"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Download, FileUp, Type, ImageIcon, RefreshCw } from "lucide-react"; // Added RefreshCw
import { ColorPicker } from "../color-picker"; // Adjust path if needed
import { useFile } from "../providers/file-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/pdf';

export function PdfAddWatermarkTool() {
  const { t } = useTranslation("common");
  const { sharedFile, setSharedFile } = useFile();
  const router = useRouter();
  const { user } = useAuth();

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<string>("text");
  const [watermarkText, setWatermarkText] = useState<string>("");
  const [position, setPosition] = useState<string>("center");
  const [opacity, setOpacity] = useState<number>(30); // Frontend 0-100
  const [rotation, setRotation] = useState<number>(45);
  const [fontSize, setFontSize] = useState<number>(48);
  const [color, setColor] = useState<string>("#888888");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0); // Keep for display if you have it

  // Load file from context or allow local upload
  useEffect(() => {
    if (sharedFile) {
      setCurrentFile(sharedFile);
      // Simulate getting page count (replace with actual PDF processing if possible)
      setTotalPages(Math.floor(Math.random() * 20) + 5);
      // setSharedFile(null); // Optional: clear after use
    }
  }, [sharedFile, setSharedFile]);

  // Effect to reset download state if parameters or file change
  useEffect(() => {
    if (downloadUrl || isComplete) {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setIsComplete(false);
    }
    // This effect runs when any of these dependencies change,
    // ensuring that any previous "completed" state is invalidated.
  }, [currentFile, watermarkType, watermarkText, position, opacity, rotation, fontSize, color]);

  // Cleanup for downloadUrl when component unmounts or downloadUrl itself is replaced
  useEffect(() => {
    const currentUrl = downloadUrl; // Capture current value for cleanup
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [downloadUrl]);


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

  const handleAddWatermark = async () => {
    if (!currentFile) {
      toast.error(t("tools.addWatermark.noFileSelectedError"));
      return;
    }

    // Revoke old URL if exists and reset completion state
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsComplete(false);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", currentFile);

    let apiEndpoint = "";

    if (watermarkType === "text") {
      if (!watermarkText) {
        toast.error(t("tools.addWatermark.textRequiredError"));
        setIsProcessing(false);
        return;
      }
      
      apiEndpoint = `${FASTAPI_BASE_URL}/add-text-watermark`;
      formData.append("text", watermarkText);
      formData.append("color", color);
      formData.append("font_size", String(fontSize));
      formData.append("opacity", String(opacity / 100)); // Backend expects 0.0-1.0
      formData.append("rotation", String(rotation));
      formData.append("position", position);

    }

    const headers: HeadersInit = {};
    if (user && user.token) {
      headers['Authorization'] = `${user.tokenType} ${user.token}`; // e.g., "Bearer yourjwttoken"
    }

    try {
      const response = await fetch(apiEndpoint, {
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
          // If response is not JSON or empty
          const textError = await response.text();
          if (textError) errorDetail = textError;
        }
        throw new Error(errorDetail);
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        // If backend sends an error as non-pdf, it might be caught here
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const errorJson = JSON.parse(reader.result as string);
                toast.error(`${t("tools.addWatermark.errorProcessing")} ${errorJson.detail || "Invalid server response"}`);
            } catch (e) {
                toast.error(t("tools.addWatermark.invalidResponseError"));
            }
        };
        reader.onerror = function() {
            toast.error(t("tools.addWatermark.invalidResponseError"));
        };
        reader.readAsText(blob); // Try to read as text if not PDF
        setIsProcessing(false);
        return;
      }

      const newUrl = URL.createObjectURL(blob);
      setDownloadUrl(newUrl);
      setIsComplete(true);
      toast.success(t("tools.addWatermark.watermarkComplete"));

    } catch (error) {
      console.error("Error adding watermark:", error);
      toast.error(
        `${t("tools.addWatermark.errorProcessing")} ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAndUploadNew = () => {
    setCurrentFile(null);
    setSharedFile(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsComplete(false);
    setWatermarkText(""); // Reset options
    // ... reset other options if desired
    router.push("/"); // Or your designated upload page
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
      {currentFile && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate max-w-xs sm:max-w-md" title={currentFile.name}>{currentFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(currentFile.size / 1024 / 1024).toFixed(2)} {t("upload.mb")}
                    {totalPages > 0 && ` • ${totalPages} ${t("tools.split.pages")}`}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetAndUploadNew}>
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  {t("tools.addWatermark.changeFile")}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                {t("tools.addWatermark.watermarkOptions")}
              </h3>
              <Tabs defaultValue="text" onValueChange={(value) => setWatermarkType(value)}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="text" className="flex items-center gap-1.5">
                    <Type className="h-4 w-4" />
                    <span>{t("tools.addWatermark.textWatermark")}</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  {/* Text Watermark Inputs */}
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text">{t("tools.addWatermark.watermarkText")}</Label>
                    <Input id="watermark-text" placeholder={t("tools.addWatermark.watermarkTextPlaceholder")} value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>{t("tools.addWatermark.fontSize")}</Label>
                        <span className="text-sm text-muted-foreground">{fontSize}pt</span>
                      </div>
                      <Slider value={[fontSize]} min={8} max={144} step={1} onValueChange={(value) => setFontSize(value[0])} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("tools.addWatermark.textColor")}</Label>
                      <ColorPicker color={color} onChange={setColor} />
                    </div>
                  </div>
                </TabsContent>

              </Tabs>

              {/* Common settings for both watermark types */}
              <div className="space-y-4 pt-4 border-t">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <Label>{t("tools.addWatermark.opacity")}</Label>
                        <span className="text-sm text-muted-foreground">{opacity}%</span>
                        </div>
                        <Slider value={[opacity]} min={0} max={100} step={1} onValueChange={(value) => setOpacity(value[0])} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                        <Label>{t("tools.addWatermark.rotation")}</Label>
                        <span className="text-sm text-muted-foreground">{rotation}°</span>
                        </div>
                        <Slider value={[rotation]} min={0} max={360} step={1} onValueChange={(value) => setRotation(value[0])} />
                    </div>
                 </div>

                <div className="space-y-2">
                  <Label>{t("tools.addWatermark.position")}</Label>
                  <RadioGroup defaultValue="center" value={position} onValueChange={setPosition}>
                    <div className="grid grid-cols-3 gap-2">
                      {['topLeft', 'topCenter', 'topRight', 'middleLeft', 'center', 'middleRight', 'bottomLeft', 'bottomCenter', 'bottomRight'].map(posKey => (
                        <Label
                          key={posKey}
                          htmlFor={`pos-${posKey}`}
                          className={`flex items-center justify-center p-2 border rounded-md cursor-pointer transition-colors
                                      hover:bg-accent hover:text-accent-foreground
                                      ${position === posKey ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' : 'bg-background'}`}
                        >
                          <RadioGroupItem value={posKey} id={`pos-${posKey}`} className="sr-only" />
                          <span className="text-xs">{t(`tools.addWatermark.positions.${posKey}`)}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button
                onClick={handleAddWatermark}
                disabled={
                  isProcessing ||
                  !currentFile ||
                  (watermarkType === "text" && !watermarkText)
                }
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t("tools.addWatermark.processing")}
                  </>
                ) : (
                  t("tools.addWatermark.addWatermarkButton")
                )}
              </Button>
            </div>

            {isComplete && downloadUrl && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 rounded-md mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <h3 className="text-base font-semibold text-green-700 dark:text-green-300">
                      {t("tools.addWatermark.watermarkCompleteTitle")}
                    </h3>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t("tools.addWatermark.watermarkCompleteDesc")}
                    </p>
                  </div>
                  <Button asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                    <a href={downloadUrl} download={`${currentFile?.name.replace(/\.pdf$/i, '') || 'document'}_watermarked.pdf`}>
                      <Download className="mr-2 h-4 w-4" />
                      <span>{t("tools.addWatermark.download")}</span>
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("tools.addWatermark.howTo")}</h3>
        <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
            <li>{t("tools.addWatermark.steps.step1")}</li>
            <li>{t("tools.addWatermark.steps.step2")}</li>
            <li>{t("tools.addWatermark.steps.step3")}</li>
            <li>{t("tools.addWatermark.steps.step4")}</li>
            <li>{t("tools.addWatermark.steps.step5")}</li>
        </ol>
      </Card>
    </div>
  );
}