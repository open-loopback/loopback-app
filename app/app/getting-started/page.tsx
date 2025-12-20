"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function GettingStartedPage() {
  const router = useRouter();
  const { data: projects, isLoading } = trpc.projects.getAll.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation();
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!isLoading && projects && projects.length > 0) {
      router.push("/app");
    }
  }, [isLoading, projects, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const project = await createProjectMutation.mutateAsync({ name: projectName });
        toast.success("Project created! Welcome to Loopback.");
        router.push(`/app/project/${project.id}`);
    } catch (err) {
        toast.error("Failed to create project");
    }
  };

  if (isLoading || (projects && projects.length > 0)) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // Or generic spinner
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Loopback!</CardTitle>
          <CardDescription className="text-center">
            You don't have any projects yet. Let's create your first one.
          </CardDescription>
        </CardHeader>
         <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome App"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={createProjectMutation.isPending}>
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </CardFooter>
        </form>
      </Card>
    </div>
  );
}
