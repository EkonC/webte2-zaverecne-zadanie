"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "./providers/auth-provider";
import { toast } from "sonner"; // Or your preferred toast library

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define the structure of a history item based on your backend's HistoryRead schema
interface HistoryItem {
  id: number;
  user_email: string;
  action: string;
  source: string | null;
  city: string | null;
  country: string | null;
  timestamp: string; // ISO date string
}

// The component now accepts a 'key' prop which, when changed,
// will cause React to remount it, thus triggering useEffect for a fresh fetch.
// This is useful for the parent component to force a refresh.
export function UsageHistoryTable({ key: _key }: { key?: number }) {
  const { t } = useTranslation("common");
  const { user, isLoadingAuth } = useAuth();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Items per page
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user?.token || isLoadingAuth) {
      // If auth is still loading, or no token, don't fetch yet.
      // If no token after auth load, it might be handled by parent or useRequireAdmin
      if (!isLoadingAuth && !user?.token) {
         setError(t("errors.unauthenticated", "Authentication required to view history."));
         setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const offset = (currentPage - 1) * pageSize;

    try {
      const response = await fetch(
        `${API_URL}/history/?limit=${pageSize}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || t("history.errors.fetchFailed", "Failed to fetch history.")
        );
      }

      const data: HistoryItem[] = await response.json();
      setHistoryItems(data);
      setHasNextPage(data.length === pageSize); // If we got a full page, there might be more
    } catch (err: any) {
      setError(err.message || t("errors.unexpected", "An unexpected error occurred."));
      setHistoryItems([]); // Clear data on error
      toast.error(err.message || t("errors.unexpected", "An unexpected error occurred."));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, user?.token, isLoadingAuth, t]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // `fetchHistory` includes all its dependencies

  if (historyItems.length === 0 && currentPage === 1) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {t("history.noEntries", "No history entries found.")}
      </div>
    );
  }


  const formatLocation = (city: string | null, country: string | null) => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return t("common.notAvailable", "N/A");
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = (currentPage - 1) * pageSize + historyItems.length;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("history.operationId")}</TableHead>
            <TableHead>{t("history.action")}</TableHead>
            <TableHead>{t("history.dateTime")}</TableHead>
            <TableHead>{t("history.author")}</TableHead>
            <TableHead>{t("history.provider")}</TableHead>
            <TableHead>{t("history.location")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.action}</TableCell>
              <TableCell>
                {new Date(item.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>{item.user_email}</TableCell>
              <TableCell>{item.source || t("common.notAvailable", "N/A")}</TableCell>
              <TableCell>
                {formatLocation(item.city, item.country)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {historyItems.length > 0
            ? t("history.showingRange", "Showing {{start}} to {{end}} entries", { start: startIndex, end: endIndex})
            : t("history.noEntriesFoundForPage", "No entries on this page.")
          }
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t("history.page")} {currentPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNextPage || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}