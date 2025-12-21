"use client";
import { useScroll } from "@/hooks/use-scroll";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export const navLinks = [
	{
		label: "Features",
		href: "/#features",
	},
	{
		label: "Pricing",
		href: "/#pricing",
	},
	{
		label: "GitHub",
		href: "https://github.com/anishroy/open-loopback",
	},
];

export function Header() {
	const scrolled = useScroll(10);

	return (
		<header
			className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
				"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-14 w-full items-center justify-between px-4 lg:px-20">
				<Link className="rounded-md p-2 hover:bg-accent font-bold text-xl" href="/">
					Loopback
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					{navLinks.map((link, i) => (
						<Link
							className={buttonVariants({ variant: "ghost" })}
							href={link.href}
							key={i}
						>
							{link.label}
						</Link>
					))}
					<Link href="/login" className={buttonVariants({ variant: "outline" })}>
						Login
					</Link>
					<Link href="/sign-up" className={buttonVariants()}>
						Sign Up
					</Link>
					<ModeToggle />
				</div>
				<div className="flex items-center gap-2 md:hidden">
					<ModeToggle />
					<MobileNav />
				</div>
			</nav>
		</header>
	);
}
