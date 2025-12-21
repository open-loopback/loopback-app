"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Folder } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { trpc } from "@/lib/trpc/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function ProjectSwitcher() {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const params = useParams()
    const projectId = params.projectId as string

    // Queries
    const { data: projects, refetch } = trpc.projects.getAll.useQuery()
    const createProjectMutation = trpc.projects.create.useMutation()

    // State
    const [open, setOpen] = React.useState(false) // Dialog state
    const [newProjectName, setNewProjectName] = React.useState("")

    const activeProject = React.useMemo(() => {
        return projects?.find((p) => p.id === projectId)
    }, [projects, projectId])

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const project = await createProjectMutation.mutateAsync({ name: newProjectName });
            setOpen(false);
            setNewProjectName("");
            toast.success("Project created!");
            refetch();
            router.push(`/app/project/${project.id}`);
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Folder className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {activeProject ? activeProject.name : "Select Project"}
                                    </span>
                                    <span className="truncate text-xs">
                                        {activeProject ? "Active" : "No Project"}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Projects
                            </DropdownMenuLabel>
                            {projects?.map((project) => (
                                <DropdownMenuItem
                                    key={project.id}
                                    onClick={() => router.push(`/app/project/${project.id}`)}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                        <Folder className="size-4" />
                                    </div>
                                    {project.name}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DialogTrigger asChild>
                                <DropdownMenuItem className="gap-2 p-2 cursor-pointer">
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium text-muted-foreground">Add project</div>
                                </DropdownMenuItem>
                            </DialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateProject}>
                            <DialogHeader>
                                <DialogTitle>Create Project</DialogTitle>
                                <DialogDescription>
                                    Enter a name for your new project.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-4">
                                    <Label htmlFor="name">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="My Awesome Project"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createProjectMutation.isPending}>
                                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
