"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
} from "lucide-react";

// Sample data for demonstration
const historyData = Array.from({ length: 10 }).map((_, i) => ({
  id: `op-${i + 1000}`,
  action: [
    "Merge PDFs",
    "Split PDF",
    "Edit PDF",
    "Convert to Images",
    "Delete Pages",
  ][Math.floor(Math.random() * 5)],
  timestamp: new Date(
    Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)
  ).toISOString(),
  location: [
    "New York, US",
    "London, UK",
    "Bratislava, SK",
    "Berlin, DE",
    "Paris, FR",
  ][Math.floor(Math.random() * 5)],
  fileCount: Math.floor(Math.random() * 5) + 1,
}));

export function UsageHistoryTable() {
  const { t } = useTranslation("common");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(historyData.length / pageSize);

  const paginatedData = historyData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("history.operationId")}</TableHead>
            <TableHead>{t("history.action")}</TableHead>
            <TableHead>{t("history.dateTime")}</TableHead>
            <TableHead>{t("history.location")}</TableHead>
            <TableHead>{t("history.files")}</TableHead>
            <TableHead className="text-right">{t("history.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.action}</TableCell>
              <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{item.fileCount}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">{t("history.actions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      <span>{t("history.viewDetails")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Download className="mr-2 h-4 w-4" />
                      <span>{t("history.downloadResult")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{t("history.deleteRecord")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {t("history.showing")} {(page - 1) * pageSize + 1} {t("history.to")}{" "}
          {Math.min(page * pageSize, historyData.length)} {t("history.of")}{" "}
          {historyData.length} {t("history.entries")}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t("history.page")} {page} {t("history.of")} {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
