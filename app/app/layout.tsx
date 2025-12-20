"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import TRPCProvider from "@/lib/trpc/provider";
import { Search, Home, Plus, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <TRPCProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r hidden md:block">
          <div className="flex items-center justify-center h-16 border-b">
            <Link href="/app" className="text-xl font-bold">
              Loopback
            </Link>
          </div>
          <nav className="p-4 space-y-2">
            <Link
              href="/app"
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/app"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Home size={18} />
              Overview
            </Link>
            {/* Add more links as needed */}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
            <div className="md:hidden">
              <Link href="/app" className="font-bold">Loopback</Link>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <UserButton />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </TRPCProvider>
  );
}
