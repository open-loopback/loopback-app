"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";

export default function AppPage() {
  const router = useRouter();
  const { data: projects, isLoading } = trpc.projects.getAll.useQuery();

  useEffect(() => {
    if (!isLoading && projects) {
      if (projects.length > 0) {
        // Redirect to the first project
        router.push(`/app/project/${projects[0].id}`);
      }
      // If no projects, we stay here. You might want to show a "Create Project" prompt.
    }
  }, [projects, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold">No Projects Found</h2>
        <p className="text-muted-foreground">
          Create a project using the sidebar to get started.
        </p>
      </div>
    );
  }

  return null; // Redirecting...
}
