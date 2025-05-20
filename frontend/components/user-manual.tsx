"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function UserManual() {
  const { t } = useTranslation("common");

  // Function to export the user manual content as a PDF
  const handleExportAsPdf = async () => {
    const container = document.getElementById("user-manual-container");
    if (!container) return;

    // 1) Un-hide all tab panels
    container.querySelectorAll("[hidden]").forEach((el) => el.removeAttribute("hidden"));

    try {
      // 2) Render entire container to canvas
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // 3) Build PDF and split into pages
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // scale canvas px → PDF pts
      const pxToPt = (px: number) => (px * 72) / 96;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgWidth  = pageWidth;
      const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

      let remainingHeight = pdfImgHeight;
      let positionY       = 0;

      // add first page
      pdf.addImage(imgData, "PNG", 0, 0, pdfImgWidth, pdfImgHeight);
      remainingHeight -= pageHeight;

      // add extra pages as needed
      while (remainingHeight > 0) {
        positionY -= pageHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          positionY,
          pdfImgWidth,
          pdfImgHeight
        );
        remainingHeight -= pageHeight;
      }

      pdf.save("user-manual.pdf");
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  return (
    <div className="space-y-6" id="user-manual-container">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("guide.userGuide")}</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleExportAsPdf}>
          <FileDown className="h-4 w-4" />
          <span>{t("guide.exportAsPdf")}</span>
        </Button>
      </div>

      <div defaultValue="getting-started">
        <div className="space-y-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("guide.gettingStarted")}</h3>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("guide.welcome")}</h3>
            <p>{t("guide.welcomeDesc")}</p>

            <h4 className="text-md font-medium mt-6">{t("guide.quickStart")}</h4>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>{t("guide.quickStartSteps.step1")}</li>
              <li>{t("guide.quickStartSteps.step2")}</li>
              <li>{t("guide.quickStartSteps.step3")}</li>
              <li>{t("guide.quickStartSteps.step4")}</li>
              <li>{t("guide.quickStartSteps.step5")}</li>
            </ol>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">{t("guide.tools")}</h3>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">{t("tools.merge.title")}</h3>
              <p className="mt-1">{t("tools.merge.description")}</p>
              <p className="mt-1">{t("tools.merge.howToTitle")}</p>
              <ul>
                <li>- {t("tools.merge.steps.step1")}</li>
                <li>- {t("tools.merge.steps.step2")}</li>
                <li>- {t("tools.merge.steps.step3")}</li>
                <li>- {t("tools.merge.steps.step4")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.split.title")}</h3>
              <p className="mt-1">{t("tools.split.description")}</p>
              <p className="mt-1">{t("tools.split.howToTitle")}</p>
              <ol>
                <li>- {t("tools.split.steps.step1")}</li>
                <li>- {t("tools.split.steps.step2")}</li>
                <li>- {t("tools.split.steps.step3")}</li>
                <li>- {t("tools.split.steps.step4")}</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium">{t("tools.deletePages.title")}</h3>
              <p className="mt-1">{t("tools.deletePages.description")}</p>
              <p className="mt-1">{t("tools.deletePages.howToTitle")}</p>
              <ol>
                <li>- {t("tools.deletePages.steps.step1")}</li>
                <li>- {t("tools.deletePages.steps.step2")}</li>
                <li>- {t("tools.deletePages.steps.step3")}</li>
                <li>- {t("tools.deletePages.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.compress.title")}</h3>
              <p className="mt-1">{t("tools.compress.description")}</p>
              <p className="mt-1">{t("tools.compress.howToTitle")}</p>
              <ol>
                <li>- {t("tools.compress.steps.step1")}</li>
                <li>- {t("tools.compress.steps.step2")}</li>
                <li>- {t("tools.compress.steps.step3")}</li>
                <li>- {t("tools.compress.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.exportJpg.title")}</h3>
              <p className="mt-1">{t("tools.exportJpg.description")}</p>
              <p className="mt-1">{t("tools.exportJpg.howToTitle")}</p>
              <ol>
                <li>- {t("tools.exportJpg.steps.step1")}</li>
                <li>- {t("tools.exportJpg.steps.step2")}</li>
                <li>- {t("tools.exportJpg.steps.step3")}</li>
                <li>- {t("tools.exportJpg.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.exportJpg.title")}</h3>
              <p className="mt-1">{t("tools.exportPng.description")}</p>
              <p className="mt-1">{t("tools.exportPng.howToTitle")}</p>
              <ol>
                <li>- {t("tools.exportPng.steps.step1")}</li>
                <li>- {t("tools.exportPng.steps.step2")}</li>
                <li>- {t("tools.exportPng.steps.step3")}</li>
                <li>- {t("tools.exportPng.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.extractImages.title")}</h3>
              <p className="mt-1">{t("tools.extractImages.description")}</p>
              <p className="mt-1">{t("tools.extractImages.howToTitle")}</p>
              <ol>
                <li>- {t("tools.extractImages.steps.step1")}</li>
                <li>- {t("tools.extractImages.steps.step2")}</li>
                <li>- {t("tools.extractImages.steps.step3")}</li>
                <li>- {t("tools.extractImages.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.nUp.title")}</h3>
              <p className="mt-1">{t("tools.nUp.description")}</p>
              <p className="mt-1">{t("tools.nUp.howToTitle")}</p>
              <ol>
                <li>- {t("tools.nUp.steps.step1")}</li>
                <li>- {t("tools.nUp.steps.step2")}</li>
                <li>- {t("tools.nUp.steps.step3")}</li>
                <li>- {t("tools.nUp.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.extractText.title")}</h3>
              <p className="mt-1">{t("tools.extractText.description")}</p>
              <p className="mt-1">{t("tools.extractText.howToTitle")}</p>
              <ol>
                <li>- {t("tools.extractText.steps.step1")}</li>
                <li>- {t("tools.extractText.steps.step2")}</li>
                <li>- {t("tools.extractText.steps.step3")}</li>
                <li>- {t("tools.extractText.steps.step4")}</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-medium">{t("tools.addWatermark.title")}</h3>
              <p className="mt-1">{t("tools.addWatermark.description")}</p>
              <p className="mt-1">{t("tools.addWatermark.howToTitle")}</p>
              <ol>
                <li>- {t("tools.addWatermark.steps.step1")}</li>
                <li>- {t("tools.addWatermark.steps.step2")}</li>
                <li>- {t("tools.addWatermark.steps.step3")}</li>
                <li>- {t("tools.addWatermark.steps.step4")}</li>
              </ol>
            </div>
          </div>
        </div>


        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-medium">
            {t("guide.apiUsageTitle")}
          </h3>

          <p className="text-sm">
            {t("guide.apiUsageDesc")}{" "}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {t("guide.apiSwaggerLink")}
            </a>.
          </p>

          <p className="text-sm">
            <strong>{t("guide.apiBaseUrl")}:</strong>{" "}
            <code className="bg-muted px-1 rounded">
              https://node32.webte.fei.stuba.sk/api/v1
            </code>
          </p>

          <p className="text-sm">{t("guide.apiExample")}</p>
          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`curl -X POST -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -F "files=@first.pdf" -F "files=@second.pdf" \\
  http://localhost:8000/pdf/merge-pdf -o merged.pdf`}
          </pre>
        </div>
        
      </div>
    </div>
  );
}
