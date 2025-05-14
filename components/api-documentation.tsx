"use client";

import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ApiDocumentation() {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{t("api.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("api.version")}</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span>{t("api.downloadSpec")}</span>
        </Button>
      </div>

      <Tabs defaultValue="authentication">
        <TabsList>
          <TabsTrigger value="authentication">
            {t("api.authentication")}
          </TabsTrigger>
          <TabsTrigger value="endpoints">{t("api.endpoints")}</TabsTrigger>
          <TabsTrigger value="examples">{t("api.examples")}</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("api.authDesc")}</h3>
            <p>{t("api.authDetails")}</p>

            <div className="bg-muted p-4 rounded-md mt-4">
              <h4 className="text-sm font-medium mb-2">
                {t("api.exampleRequest")}
              </h4>
              <pre className="text-xs overflow-x-auto p-2 bg-background rounded border">
                {`curl -X POST https://api.pdfmanipulator.com/v1/merge \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"files": ["file1.pdf", "file2.pdf"]}'`}
              </pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                  GET
                </span>
                <span className="font-mono text-sm">/v1/files</span>
              </div>
              <p className="text-sm">List all uploaded PDF files</p>
            </div>

            <div className="border rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                  POST
                </span>
                <span className="font-mono text-sm">/v1/upload</span>
              </div>
              <p className="text-sm">Upload a new PDF file</p>
            </div>

            <div className="border rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                  POST
                </span>
                <span className="font-mono text-sm">/v1/merge</span>
              </div>
              <p className="text-sm">Merge multiple PDF files</p>
            </div>

            <div className="border rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                  POST
                </span>
                <span className="font-mono text-sm">/v1/split</span>
              </div>
              <p className="text-sm">Split a PDF into multiple files</p>
            </div>

            <div className="border rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                  POST
                </span>
                <span className="font-mono text-sm">/v1/edit</span>
              </div>
              <p className="text-sm">Edit PDF content</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("api.mergeExample")}</h3>
            <div className="bg-muted p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">{t("api.request")}</h4>
              <pre className="text-xs overflow-x-auto p-2 bg-background rounded border">
                {`POST /v1/merge HTTP/1.1
Host: api.pdfmanipulator.com
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "files": [
    "https://example.com/file1.pdf",
    "https://example.com/file2.pdf"
  ],
  "output_filename": "merged_document.pdf"
}`}
              </pre>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">{t("api.response")}</h4>
              <pre className="text-xs overflow-x-auto p-2 bg-background rounded border">
                {`HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "file_url": "https://api.pdfmanipulator.com/files/merged_document.pdf",
  "expires_at": "2023-12-31T23:59:59Z"
}`}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
