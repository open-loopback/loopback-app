import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="text-xl text-muted-foreground">Page not found.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
