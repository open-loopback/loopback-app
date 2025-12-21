"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MessageSquare, Star, Folder, Users, ArrowUpRight } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateSourceDialog } from "@/components/create-source-dialog";
import { useEffect, useState } from "react";

export default function ProjectDashboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const shouldCreateSource = searchParams.get("createSource") === "true";

  const [isCreateSourceOpen, setIsCreateSourceOpen] = useState(false);

  useEffect(() => {
    if (shouldCreateSource) {
      setIsCreateSourceOpen(true);
    }
  }, [shouldCreateSource]);

  const handleOpenChange = (open: boolean) => {
    setIsCreateSourceOpen(open);
    if (!open && shouldCreateSource) {
      // Remove the query param when closing
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("createSource");
      router.replace(`/app/project/${projectId}?${newParams.toString()}`);
    }
  };

  const { data: stats, isLoading } = trpc.analytics.getStats.useQuery({ projectId });
  const { data: sources } = trpc.sources.getAll.useQuery({ projectId });

  if (isLoading) {
    return <div className="p-8">Loading stats...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CreateSourceDialog
            projectId={projectId}
            open={isCreateSourceOpen}
            onOpenChange={handleOpenChange}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedbacks
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFeedbacks ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              For this project
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.averageRating ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sources
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Collecting data
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Feedback activity for this project over the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.feedbacksOverTime}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    cursor={{ fill: 'var(--muted)' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sources</CardTitle>
            <CardDescription>
              Your integration sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sources?.slice(0, 5).map(source => (
                <div className="flex items-center" key={source.id}>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{source.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(source.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/app/project/${projectId}/source/${source.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {!sources?.length && (
                <div className="text-sm text-zinc-500 p-4 text-center">No sources created yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
