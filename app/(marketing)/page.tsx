import { Header } from "@/components/header";
import { Hero3 } from "@/components/hero3";
import { HeroFeedbackWidget } from "@/components/hero-feedback-widget";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col justify-center">
        <Hero3
          heading="Modern Feedback Management for Product Teams"
          description="Stop chasing feedback across Slack, Discord, and Email. Centralize your user insights and turn feedback into features with Loopback."
          buttons={{
            primary: {
              text: "Get Started",
              url: "/sign-up",
            },
            secondary: {
              text: "Log In",
              url: "/login",
            },
          }}
          className="bg-background text-foreground py-20"
        />
      </main>
      <footer className="w-full shrink-0 border-t">
        <div className="container mx-auto px-4 lg:px-20 py-6 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Loopback. All rights reserved.</p>
        </div>
      </footer>
      <HeroFeedbackWidget />
    </div>
  );
}
