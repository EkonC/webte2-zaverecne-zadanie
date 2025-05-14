import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="p-4 bg-muted rounded-md">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
