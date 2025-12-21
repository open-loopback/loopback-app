"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface JsonViewerProps {
    data: any;
}

export function JsonViewer({ data }: JsonViewerProps) {
    return (
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/50 font-mono text-sm">
            <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(data, null, 2)}
            </pre>
        </ScrollArea>
    );
}
