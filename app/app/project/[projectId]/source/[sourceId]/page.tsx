"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Key, RefreshCw, Star, Trash2, Eye } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Fragment, useMemo, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { JsonViewer } from "@/components/json-viewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- Types ---
type FeedbackItem = {
  id: string;
  rating: number;
  message: string;
  metadata: any;
  createdAt: string | Date | null;
};

const PAGE_SIZE = 30;

export default function SourcePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const sourceId = params.sourceId as string;
  const router = useRouter();

  const [pagination, setPagination] = useState({
    pageIndex: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 0,
    pageSize: PAGE_SIZE,
  });

  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const { data: source, isLoading: isLoadingSource, refetch: refetchSource } = trpc.sources.getById.useQuery({ id: sourceId });

  const {
    data: feedbackData,
    isLoading: isLoadingFeedbacks,
    refetch: refetchFeedbacks
  } = trpc.feedbacks.getAll.useQuery(
    { 
      sourceId, 
      limit: pagination.pageSize, 
      page: pagination.pageIndex,
      q: searchValue
    }
  );

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (pagination.pageIndex > 0) {
      newParams.set("page", pagination.pageIndex.toString());
    } else {
      newParams.delete("page");
    }
    
    if (searchValue) {
      newParams.set("q", searchValue);
    } else {
      newParams.delete("q");
    }

    if (newParams.toString() !== currentParams.toString()) {
      router.replace(`?${newParams.toString()}`);
    }
  }, [pagination.pageIndex, searchValue, router, searchParams]);

  const regenerateTokenMutation = trpc.sources.regenerateToken.useMutation();
  const deleteFeedbackMutation = trpc.feedbacks.delete.useMutation();
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const handleRegenerateToken = async () => {
    try {
      await regenerateTokenMutation.mutateAsync({ id: sourceId });
      refetchSource();
      toast.success("Token regenerated!");
    } catch (err) {
      toast.error("Failed to regenerate token");
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteFeedbackMutation.mutateAsync({ id });
      refetchFeedbacks();
      toast.success("Feedback deleted");
    } catch (err) {
      toast.error("Failed to delete feedback");
    }
  };

  const columns: ColumnDef<FeedbackItem>[] = useMemo(() => [
    {
      id: "serial",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {totalCount - (pagination.pageIndex * pagination.pageSize + row.index)}
        </span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number;
        return (
          <div className="flex items-center gap-1">
            <span className="font-semibold">{rating}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        );
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message") as string;
        const isLong = message.length > 50;
        const display = isLong ? message.slice(0, 50) + "..." : message;

        return (
          <div className="space-y-1">
            <span title={message}>{display}</span>
            {isLong && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-xs text-muted-foreground">View More</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Feedback Message</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 border rounded-md bg-muted/20 text-sm leading-relaxed whitespace-pre-wrap">
                    {message}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "metadata",
      header: "Metadata",
      cell: ({ row }) => {
        const metadata = row.getValue("metadata");
        if (!metadata || Object.keys(metadata).length === 0) return <span className="text-muted-foreground text-xs">None</span>;

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs"><Eye className="mr-1 h-3 w-3" /> View Data</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Metadata</DialogTitle>
              </DialogHeader>
              <JsonViewer data={metadata} />
            </DialogContent>
          </Dialog>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date;
        return <div className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleString() : "N/A"}</div>
      },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const feedback = row.original;
            return (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete feedback</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the feedback.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => handleDeleteFeedback(feedback.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        }
    }
  ], [deleteFeedbackMutation, refetchFeedbacks]);

  const items = feedbackData?.items || [];
  const totalCount = feedbackData?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  if (isLoadingSource) return <div className="p-6">Loading...</div>;
  if (!source) return <div className="p-6">Source not found</div>;

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/app/project/${projectId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{source.name}</h1>
          <p className="text-muted-foreground">View feedbacks and manage integration.</p>
        </div>
        <div className="ml-auto">
          <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Key className="mr-2 h-4 w-4" /> Source Token</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Source Integration Token</DialogTitle>
                <DialogDescription>
                  Use this token in your client-side code to send feedback.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 py-4">
                <Input readOnly value={source.sourceId} className="font-mono bg-muted" />
                <Button variant="ghost" size="icon" onClick={() => {
                  navigator.clipboard.writeText(source.sourceId);
                  toast.success("Copied to clipboard");
                }}>
                  <span className="sr-only">Copy</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006V2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006H9.5C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H13.5C14.3284 4.00006 15 4.67163 15 5.50006V12.5001C15 13.3285 14.3284 14.0001 13.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6.5 5.00006H13.5C13.7761 5.00006 14 5.22392 14 5.50006V12.5001C14 12.7762 13.7761 13.0001 13.5 13.0001H6.5C6.22386 13.0001 6 12.7762 6 12.5001V5.50006C6 5.22392 6.22386 5.00006 6.5 5.00006Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </Button>
              </div>
              <DialogFooter>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={regenerateTokenMutation.isPending}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${regenerateTokenMutation.isPending ? "animate-spin" : ""}`} />
                            Regenerate Token
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will invalidate the current token and generate a new one. Any applications using the old token will no longer be able to send feedback.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleRegenerateToken}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Regenerate
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border p-4 bg-background">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Feedbacks</h2>
        </div>
        {isLoadingFeedbacks ? (
          <div className="flex justify-center p-8">Loading feedbacks...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={items} 
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            onRefresh={() => refetchFeedbacks()}
            searchValue={searchValue}
            onSearchChange={(val) => {
              setSearchValue(val);
              setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
            }}
          />
        )}
      </div>
    </div>
  );
}
