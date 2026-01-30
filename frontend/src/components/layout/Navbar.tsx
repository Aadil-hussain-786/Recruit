"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Briefcase, LogIn, UserPlus, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Jobs", href: "/jobs" },
    { name: "Candidates", href: "/candidates" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
                                <Briefcase size={18} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Recruit AI
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-indigo-600",
                                        pathname === item.href
                                            ? "text-indigo-600"
                                            : "text-zinc-600 dark:text-zinc-400"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        {!user ? (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="gap-2">
                                        <LogIn size={16} />
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="premium" className="gap-2">
                                        <UserPlus size={16} />
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <UserIcon size={16} className="text-zinc-600 dark:text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                        {user.firstName}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <LogOut size={16} />
                                    Log out
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-zinc-600 dark:text-zinc-400"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-b border-zinc-200 bg-white p-4 md:hidden dark:border-zinc-800 dark:bg-black">
                    <div className="flex flex-col gap-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-base font-medium text-zinc-600 dark:text-zinc-400"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <hr className="border-zinc-200 dark:border-zinc-800" />
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <LogIn size={16} />
                                Log in
                            </Button>
                        </Link>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="premium" className="w-full justify-start gap-2">
                                <UserPlus size={16} />
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
