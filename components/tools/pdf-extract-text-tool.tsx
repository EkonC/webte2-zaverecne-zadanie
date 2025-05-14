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
import { Textarea } from "@/components/ui/textarea";
import { Download, FileUp, Copy } from "lucide-react";

export function PdfExtractTextTool() {
  const { t } = useTranslation("common");
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [textFormat, setTextFormat] = useState<string>("plainText");
  const [preserveLayout, setPreserveLayout] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate getting page count from PDF
      setTotalPages(Math.floor(Math.random() * 20) + 5);
    }
  };

  const handleExtract = () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      setExtractedText(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl."
      );
    }, 2000);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">
              {t("tools.extractText.uploadPdfFile")}
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
                  {t("tools.extractText.extractOptions")}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="page-range">
                    {t("tools.extractText.pageRange")}
                  </Label>
                  <Input
                    id="page-range"
                    placeholder="e.g., 1-3, 5-8"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("tools.extractText.pageRangeDesc")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("tools.extractText.formatOptions")}</Label>

                  <div className="space-y-4">
                    <div>
                      <Label>{t("tools.extractText.textFormat")}</Label>
                      <RadioGroup
                        defaultValue="plainText"
                        value={textFormat}
                        onValueChange={setTextFormat}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="plainText" id="plainText" />
                          <Label htmlFor="plainText">
                            {t("tools.extractText.plainText")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="richText" id="richText" />
                          <Label htmlFor="richText">
                            {t("tools.extractText.richText")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="html" id="html" />
                          <Label htmlFor="html">
                            {t("tools.extractText.html")}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="preserve-layout"
                        checked={preserveLayout}
                        onCheckedChange={(checked) =>
                          setPreserveLayout(checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="preserve-layout">
                          {t("tools.extractText.preserveLayout")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t("tools.extractText.preserveLayoutDesc")}
                        </p>
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
                    ? t("tools.extractText.processing")
                    : t("tools.extractText.extractButton")}
                </Button>
              </div>
            </>
          )}

          {isComplete && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-md">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("tools.extractText.extractComplete")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("tools.extractText.extractCompleteDesc")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("tools.extractText.textPreview")}</Label>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{t("tools.extractText.downloadText")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                  <span>{t("tools.extractText.copyToClipboard")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {t("tools.extractText.howTo")}
        </h3>

        <ol className="space-y-3 list-decimal list-inside text-sm">
          <li>{t("tools.extractText.steps.step1")}</li>
          <li>{t("tools.extractText.steps.step2")}</li>
          <li>{t("tools.extractText.steps.step3")}</li>
          <li>{t("tools.extractText.steps.step4")}</li>
          <li>{t("tools.extractText.steps.step5")}</li>
        </ol>

        <div className="mt-6 text-sm text-muted-foreground">
          <p className="font-medium">{t("tools.extractText.note")}</p>
          <p className="mt-1">{t("tools.extractText.noteDesc")}</p>
        </div>
      </Card>
    </div>
  );
}
