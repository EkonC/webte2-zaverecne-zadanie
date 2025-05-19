"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { FileUp, FileDown } from "lucide-react";

export function PdfCompressTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<string>("medium");
  const [imageQuality, setImageQuality] = useState<number>(80);
  const [removeBookmarks, setRemoveBookmarks] = useState<boolean>(false);
  const [removeAnnotations, setRemoveAnnotations] = useState<boolean>(false);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [newSize, setNewSize] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
    }
  };

  const handleCompress = () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      // Simulate compression result based on selected options
      let compressionRatio = 0.8; // Default medium compression

      if (compressionLevel === "low") {
        compressionRatio = 0.9;
      } else if (compressionLevel === "high") {
        compressionRatio = 0.6;
      } else if (compressionLevel === "extreme") {
        compressionRatio = 0.4;
      }

      // Further reduce size based on image quality
      compressionRatio *= (imageQuality + 20) / 100;

      // Additional reduction for removed elements
      if (removeBookmarks) compressionRatio -= 0.02;
      if (removeAnnotations) compressionRatio -= 0.03;
      if (removeMetadata) compressionRatio -= 0.05;

      // Ensure ratio doesn't go below 0.2 (80% reduction)
      compressionRatio = Math.max(0.2, compressionRatio);

      const compressedSize = Math.floor(originalSize * compressionRatio);
      setNewSize(compressedSize);

      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const calculateReduction = (): string => {
    if (originalSize === 0 || newSize === 0) return "0%";
    const reduction = ((originalSize - newSize) / originalSize) * 100;
    return `${reduction.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">
              {t("tools.compress.uploadPdfFile")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <FileUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium">
                {t("tools.compress.compressionOptions")}
              </h3>

              <div className="space-y-2">
                <Label>{t("tools.compress.compressionLevel")}</Label>
                <RadioGroup
                  defaultValue="medium"
                  value={compressionLevel}
                  onValueChange={setCompressionLevel}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">{t("tools.compress.low")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">{t("tools.compress.medium")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">{t("tools.compress.high")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extreme" id="extreme" />
                    <Label htmlFor="extreme">
                      {t("tools.compress.extreme")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-quality">
                  {t("tools.compress.imageQuality")}: {imageQuality}%
                </Label>
                <Slider
                  id="image-quality"
                  min={20}
                  max={100}
                  step={5}
                  value={[imageQuality]}
                  onValueChange={([v]: number[]) => setImageQuality(v)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("tools.compress.imageQualityDesc")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("tools.compress.removeElements")}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remove-bookmarks"
                      checked={removeBookmarks}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setRemoveAnnotations(checked === true)
                      }
                    />
                    <Label htmlFor="remove-bookmarks">
                      {t("tools.compress.removeBookmarks")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remove-annotations"
                      checked={removeAnnotations}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setRemoveAnnotations(checked === true)
                      }
                    />
                    <Label htmlFor="remove-annotations">
                      {t("tools.compress.removeAnnotations")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remove-metadata"
                      checked={removeMetadata}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setRemoveAnnotations(checked === true)
                      }
                    />
                    <Label htmlFor="remove-metadata">
                      {t("tools.compress.removeMetadata")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button onClick={handleCompress} disabled={isProcessing}>
                  {isProcessing
                    ? t("tools.compress.compressing")
                    : t("tools.compress.compress")}
                </Button>
                {isComplete && (
                  <div className="p-4 bg-positive rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {t("tools.compress.compressionResult")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(newSize)} ({calculateReduction()})
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
