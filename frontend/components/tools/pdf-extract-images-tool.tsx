"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileUp, Archive } from "lucide-react";

export function PdfExtractImagesTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [imageFormat, setImageFormat] = useState<string>("all");
  const [minWidth, setMinWidth] = useState<number>(100);
  const [minHeight, setMinHeight] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [imagesFound, setImagesFound] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setIsComplete(false);
    setImagesFound(0);

    const form = new FormData();
    form.append("file", file);
    form.append("page_range", pageRange);
    form.append("image_format", imageFormat);
    form.append("min_width", minWidth.toString());
    form.append("min_height", minHeight.toString());

    try {
      const res = await fetch("/api/extract-images", { method: "POST", body: form });
      if (!res.ok) throw new Error(res.statusText);
      const countHeader = res.headers.get("x-image-count") || "0";
      setImagesFound(parseInt(countHeader, 10));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.zip";
      a.click();
      URL.revokeObjectURL(url);

      setIsComplete(true);
    } catch (err) {
      console.error(err);
      // optionally show user feedback
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">
              {t("tools.extractImages.uploadPdfFile")}
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
            <>
              <div className="p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} {t("upload.mb")} •{" "}
                      {totalPages} {t("tools.split.pages")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  {t("tools.extractImages.extractOptions")}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="page-range">
                    {t("tools.extractImages.pageRange")}
                  </Label>
                  <Input
                    id="page-range"
                    placeholder="e.g., 1-3, 5-8"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("tools.extractImages.pageRangeDesc")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("tools.extractImages.formatOptions")}</Label>

                  <div className="space-y-4">
                    <div>
                      <Label>{t("tools.extractImages.imageFormat")}</Label>
                      <RadioGroup
                        defaultValue="all"
                        value={imageFormat}
                        onValueChange={setImageFormat}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="jpeg" id="jpeg" />
                          <Label htmlFor="jpeg">
                            {t("tools.extractImages.jpeg")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="png" id="png" />
                          <Label htmlFor="png">
                            {t("tools.extractImages.png")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all">
                            {t("tools.extractImages.all")}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>{t("tools.extractImages.minSize")}</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("tools.extractImages.minSizeDesc")}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-width" className="text-xs">
                            {t("tools.extractImages.width")}
                          </Label>
                          <Input
                            id="min-width"
                            type="number"
                            min={0}
                            value={minWidth}
                            onChange={(e) =>
                              setMinWidth(Number.parseInt(e.target.value))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="min-height" className="text-xs">
                            {t("tools.extractImages.height")}
                          </Label>
                          <Input
                            id="min-height"
                            type="number"
                            min={0}
                            value={minHeight}
                            onChange={(e) =>
                              setMinHeight(Number.parseInt(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExtract}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing
                    ? t("tools.extractImages.processing")
                    : t("tools.extractImages.extractButton")}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <h3 className="text-sm font-medium">
                {t("tools.extractImages.extractCompleteDesc")}
              </h3>
              <p className="text-sm mt-2">
                <strong>{imagesFound}</strong> {t("tools.extractImages.imagesFound")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleExtract} className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.extractImages.downloadZip")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {t("tools.extractImages.howTo")}
        </h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.extractImages.steps.step1")}</li>
          <li>{t("tools.extractImages.steps.step2")}</li>
          <li>{t("tools.extractImages.steps.step3")}</li>
          <li>{t("tools.extractImages.steps.step4")}</li>
          <li>{t("tools.extractImages.steps.step5")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.extractImages.note")}</p>
          <p className="mt-1">{t("tools.extractImages.noteDesc")}</p>
        </div>
      </Card>
    </div>
  );
}
