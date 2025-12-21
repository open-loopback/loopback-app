"use client"

import * as React from "react"
import { Home, Settings, Search, Command, LifeBuoy, Send, Database, Plus } from "lucide-react"
import { ProjectSwitcher } from "@/components/project-switcher"
import { useParams, usePathname } from "next/navigation"
import { trpc } from "@/lib/trpc/client"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
    navMain: [
        {
            title: "Platform",
            items: [
                {
                    title: "Dashboard",
                    url: "/app",
                    icon: Home,
                },
                {
                    title: "Settings",
                    url: "/app/settings",
                    icon: Settings,
                },
            ],
        },
        {
            title: "Support",
            items: [
                {
                    title: "Documentation",
                    url: "#",
                    icon: LifeBuoy,
                },
                {
                    title: "Feedback",
                    url: "#",
                    icon: Send,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const params = useParams() // Get params to find active projectId
    const projectId = params.projectId as string | undefined

    // Fetch sources if a project is selected
    const { data: sources } = trpc.sources.getAll.useQuery(
        { projectId: projectId! },
        { enabled: !!projectId }
    )

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <ProjectSwitcher />
            </SidebarHeader>
            <SidebarContent>

                {/* Sources Section - Only if Project Active */}
                {projectId && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip="Overview"
                                        isActive={pathname === `/app/project/${projectId}`}
                                    >
                                        <Link href={`/app/project/${projectId}`}>
                                            <Command className="h-4 w-4" />
                                            <span>Overview</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {sources?.map((source) => (
                                    <SidebarMenuItem key={source.id}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={source.name}
                                            isActive={pathname.includes(`/source/${source.id}`)}
                                        >
                                            <Link href={`/app/project/${projectId}/source/${source.id}`}>
                                                <Database className="h-4 w-4" />
                                                <span className="truncate">{source.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                {!sources?.length && (
                                    <div className="px-2 py-1 text-xs text-muted-foreground">
                                        No sources yet.
                                    </div>
                                )}
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Add Source">
                                        <Link href={`/app/project/${projectId}?createSource=true`}>
                                            <Plus className="h-4 w-4" />
                                            <span>Add Source</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                {/* User Menu can go here */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
