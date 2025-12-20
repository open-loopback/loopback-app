import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center font-bold text-xl" href="/">
          Loopback
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/sign-up">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Feedback Management Simplified.
        </h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Collect, organize, and analyze feedback from all your sources in one intuitive dashboard.
        </p>
        <div className="flex gap-4">
          <Link href="/sign-up">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Log In</Button>
          </Link>
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Loopback. All rights reserved.</p>
      </footer>
    </div>
  );
}
