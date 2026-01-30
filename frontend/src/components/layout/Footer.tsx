import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 py-12 dark:border-zinc-800 dark:bg-black/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
                                <Briefcase size={18} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Recruit AI
                            </span>
                        </div>
                        <p className="mt-4 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
                            The modern way to hire based on skills and performance, powered by AI.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product</h3>
                        <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li><Link href="/jobs" className="hover:text-indigo-600">Jobs</Link></li>
                            <li><Link href="/candidates" className="hover:text-indigo-600">Candidates</Link></li>
                            <li><Link href="/pricing" className="hover:text-indigo-600">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Company</h3>
                        <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li><Link href="/about" className="hover:text-indigo-600">About</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-indigo-600">Privacy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        &copy; {new Date().getFullYear()} Recruit AI Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
