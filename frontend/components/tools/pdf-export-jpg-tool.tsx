"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileUp, Archive, ImageIcon } from "lucide-react";

export function PdfExportJpgTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [dpi, setDpi] = useState<number>(300);
  const [quality, setQuality] = useState<number>(90);
  const [colorMode, setColorMode] = useState<string>("color");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [convertedImages, setConvertedImages] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  const handleExport = () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      // If page range is specified, calculate number of pages in that range
      // Otherwise use all pages
      if (pageRange.trim()) {
        // Simple calculation for demo purposes
        setConvertedImages(Math.min(5, totalPages));
      } else {
        setConvertedImages(totalPages);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">
              {t("tools.exportJpg.uploadPdfFile")}
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
                  {t("tools.exportJpg.exportOptions")}
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-range">
                      {t("tools.exportJpg.pageRange")}
                    </Label>
                    <Input
                      id="page-range"
                      placeholder="e.g., 1-3, 5-8"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("tools.exportJpg.pageRangeDesc")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t("tools.exportJpg.resolution")}</Label>
                      <span className="text-sm">{dpi} DPI</span>
                    </div>
                    <Slider
                      value={[dpi]}
                      min={72}
                      max={600}
                      step={72}
                      onValueChange={(value) => setDpi(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("tools.exportJpg.resolutionDesc")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t("tools.exportJpg.quality")}</Label>
                      <span className="text-sm">{quality}%</span>
                    </div>
                    <Slider
                      value={[quality]}
                      min={10}
                      max={100}
                      step={5}
                      onValueChange={(value) => setQuality(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("tools.exportJpg.qualityDesc")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("tools.exportJpg.colorMode")}</Label>
                    <RadioGroup
                      defaultValue="color"
                      value={colorMode}
                      onValueChange={setColorMode}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="color" />
                        <Label htmlFor="color">
                          {t("tools.exportJpg.colorRgb")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grayscale" id="grayscale" />
                        <Label htmlFor="grayscale">
                          {t("tools.exportJpg.grayscale")}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="blackwhite" id="blackwhite" />
                        <Label htmlFor="blackwhite">
                          {t("tools.exportJpg.blackAndWhite")}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    t("tools.exportJpg.processing")
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {t("tools.exportJpg.exportButton")}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.exportJpg.exportComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.exportJpg.exportCompleteDesc")}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>{convertedImages}</strong>{" "}
                    {t("tools.exportJpg.pagesConverted")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{t("tools.exportJpg.downloadAll")}</span>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Archive className="h-4 w-4" />
                    <span>{t("tools.exportJpg.downloadZip")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {t("tools.exportJpg.howTo")}
        </h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.exportJpg.steps.step1")}</li>
          <li>{t("tools.exportJpg.steps.step2")}</li>
          <li>{t("tools.exportJpg.steps.step3")}</li>
          <li>{t("tools.exportJpg.steps.step4")}</li>
          <li>{t("tools.exportJpg.steps.step5")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.exportJpg.tips.title")}</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>{t("tools.exportJpg.tips.tip1")}</li>
            <li>{t("tools.exportJpg.tips.tip2")}</li>
            <li>{t("tools.exportJpg.tips.tip3")}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
