"use client";

import type React from "react";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileUp } from "lucide-react";

export function PdfSplitTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [splitMethod, setSplitMethod] = useState<string>("range");
  const [pageRange, setPageRange] = useState<string>("");
  const [interval, setInterval] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  const handleSplit = () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">{t("tools.split.uploadPdfFile")}</Label>
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
                  {t("tools.split.splitOptions")}
                </h3>

                <Tabs defaultValue="range" onValueChange={setSplitMethod}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="range">
                      {t("tools.split.pageRange")}
                    </TabsTrigger>
                    <TabsTrigger value="interval">
                      {t("tools.split.splitByInterval")}
                    </TabsTrigger>
                    <TabsTrigger value="extract">
                      {t("tools.split.extractPages")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="range" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="page-range">
                        {t("tools.split.pageRange")}
                      </Label>
                      <Input
                        id="page-range"
                        placeholder="e.g., 1-3, 5-8"
                        value={pageRange}
                        onChange={(e) => setPageRange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("tools.split.pageRangeDesc")}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="interval" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interval">
                        {t("tools.split.splitEveryNPages")}
                      </Label>
                      <Input
                        id="interval"
                        type="number"
                        min={1}
                        max={totalPages}
                        value={interval}
                        onChange={(e) =>
                          setInterval(Number.parseInt(e.target.value))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("tools.split.intervalDesc")}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="extract" className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("tools.split.extractOptions")}</Label>
                      <RadioGroup defaultValue="all">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all">
                            {t("tools.split.extractAll")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="even" id="even" />
                          <Label htmlFor="even">
                            {t("tools.split.extractEven")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="odd" id="odd" />
                          <Label htmlFor="odd">
                            {t("tools.split.extractOdd")}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing
                    ? t("tools.split.processing")
                    : t("tools.split.splitButton")}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="p-4 bg-primary/10 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.split.splitComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.split.splitCompleteDesc")}
                  </p>
                </div>

                <Button className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.split.downloadAll")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("tools.split.howTo")}</h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.split.steps.step1")}</li>
          <li>
            {t("tools.split.steps.step2")}
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>
                <strong>{t("tools.split.steps.step2a")}</strong>
              </li>
              <li>
                <strong>{t("tools.split.steps.step2b")}</strong>
              </li>
              <li>
                <strong>{t("tools.split.steps.step2c")}</strong>
              </li>
            </ul>
          </li>
          <li>{t("tools.split.steps.step3")}</li>
          <li>{t("tools.split.steps.step4")}</li>
          <li>{t("tools.split.steps.step5")}</li>
        </ol>
      </Card>
    </div>
  );
}
