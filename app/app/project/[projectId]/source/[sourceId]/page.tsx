"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Key, RefreshCw, Star } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, Fragment } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function SourcePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const sourceId = params.sourceId as string;
  const router = useRouter();

  const { data: source, isLoading: isLoadingSource, refetch: refetchSource } = trpc.sources.getById.useQuery({ id: sourceId });
  const { 
    data: feedbackPages, 
    isLoading: isLoadingFeedbacks, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = trpc.feedbacks.getAll.useInfiniteQuery(
      { sourceId, limit: 10 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const regenerateTokenMutation = trpc.sources.regenerateToken.useMutation();
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const handleRegenerateToken = async () => {
    if (!confirm("Are you sure? This will invalidate the old token.")) return;
    try {
        await regenerateTokenMutation.mutateAsync({ id: sourceId });
        refetchSource();
        toast.success("Token regenerated!");
    } catch (err) {
        toast.error("Failed to regenerate token");
    }
  };

  if (isLoadingSource) return <div className="p-6">Loading...</div>;
  if (!source) return <div className="p-6">Source not found</div>;

  return (
    <div className="space-y-6">
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
                    <Button variant="destructive" onClick={handleRegenerateToken} disabled={regenerateTokenMutation.isPending}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${regenerateTokenMutation.isPending ? "animate-spin" : ""}`} />
                        Regenerate Token
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingFeedbacks ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">Loading feedbacks...</TableCell>
                </TableRow>
            ) : feedbackPages?.pages[0].items.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No feedbacks yet.</TableCell>
                </TableRow>
            ) : (
                feedbackPages?.pages.map((page, i) => (
                    <Fragment key={i}>
                        {page.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        {item.rating} <Star className="h-3 w-3 ml-1 fill-current text-yellow-500" />
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-md truncate" title={item.message}>{item.message}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-xs">{JSON.stringify(item.metadata)}</TableCell>
                            </TableRow>
                        ))}
                    </Fragment>
                ))
            )}
          </TableBody>
        </Table>
      </div>
      {hasNextPage && (
          <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
            >
                  {isFetchingNextPage ? "Loading more..." : "Load More"}
              </Button>
          </div>
      )}
    </div>
  );
}
