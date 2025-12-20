"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();

  const { data: project, isLoading: isLoadingProject } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: sources, isLoading: isLoadingSources, refetch: refetchSources } = trpc.sources.getAll.useQuery({ projectId });
  const createSourceMutation = trpc.sources.create.useMutation();

  const [newSourceName, setNewSourceName] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSourceMutation.mutateAsync({ name: newSourceName, projectId });
      setOpen(false);
      setNewSourceName("");
      toast.success("Source created!");
      refetchSources();
    } catch (error) {
       toast.error("Failed to create source");
    }
  };

  if (isLoadingProject || isLoadingSources) {
    return <div className="p-6">Loading...</div>;
  }

  if (!project) {
      return <div className="p-6">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/app")}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">Manage your sources and settings.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sources</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Source</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateSource}>
            <DialogHeader>
              <DialogTitle>Create Source</DialogTitle>
              <DialogDescription>
                Enter a name for your new source (e.g. "Website", "Mobile App").
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createSourceMutation.isPending}>
                  {createSourceMutation.isPending ? "Creating..." : "Create Source"}
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sources?.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg space-y-4">
                <h3 className="text-lg font-medium">No sources yet</h3>
                <p className="text-sm text-muted-foreground">Create a source to start collecting feedback.</p>
           </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources?.map((source) => (
            <Link href={`/app/project/${projectId}/source/${source.id}`} key={source.id}>
                <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <CardHeader>
                    <CardTitle>{source.name}</CardTitle>
                    <CardDescription>Created on {source.createdAt ? new Date(source.createdAt).toLocaleDateString() : 'N/A'}</CardDescription>
                </CardHeader>
                </Card>
            </Link>
            ))}
        </div>
      )}
    </div>
  );
}
