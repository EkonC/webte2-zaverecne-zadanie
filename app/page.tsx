import { redirect } from "next/navigation";
//import { FileUpload } from "@/components/file-upload";
//import { FeatureGrid } from "@/components/feature-grid";
//import { DashboardHeader } from "@/components/dashboard-header";

export default function Home() {
  // In a real app, you would check authentication status here
  // For demo purposes, we'll assume the user is authenticated
  const isAuthenticated = true;

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader />*/}
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">PDF Tools Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Upload a PDF file to get started with our powerful PDF manipulation
          tools.
        </p>

        {/*<FileUpload />*/}

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Available PDF Tools</h2>
          {/* <FeatureGrid />*/}
        </div>
      </main>
    </div>
  );
}
