"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <SignIn 
        routing="path" 
        path="/login" 
        signUpUrl="/sign-up"
        forceRedirectUrl="/app"
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            card: "shadow-md border border-border rounded-lg",
          }
        }}
      />
    </div>
  );
}
