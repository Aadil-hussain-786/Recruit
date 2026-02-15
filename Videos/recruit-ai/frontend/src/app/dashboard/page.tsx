"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    Users,
    Briefcase,
    Plus,
    MoreVertical,
    Clock,
    TrendingUp,
    Filter,
    Loader2,
    AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                const [statsRes, jobsRes] = await Promise.all([
                    api.get("/jobs/stats"),
                    api.get("/jobs")
                ]);

                setStats([
                    { name: "Total Candidates", value: statsRes.data.data.totalCandidates, icon: Users, change: "+0%", changeType: "neutral" },
                    { name: "Active Jobs", value: statsRes.data.data.activeJobs, icon: Briefcase, change: "Current", changeType: "neutral" },
                    { name: "Time to Hire", value: statsRes.data.data.timeToHire, icon: Clock, change: "Org Avg", changeType: "neutral" },
                    { name: "Interview Pass Rate", value: statsRes.data.data.interviewPassRate, icon: TrendingUp, change: "Org Avg", changeType: "neutral" },
                ]);

                setJobs(jobsRes.data.data);
            } catch (err: any) {
                setError("Failed to fetch dashboard data. Please ensure the backend is running.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white dark:bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black min-h-screen">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                            Hello, {user?.firstName}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Welcome back, here's what's happening with your hiring pipeline.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Filter size={16} />
                            Filter
                        </Button>
                        <Button variant="premium" className="gap-2" onClick={() => router.push('/jobs')}>
                            <Plus size={16} />
                            Create Job
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats?.map((stat: any) => (
                        <div key={stat.name} className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <stat.icon size={20} />
                                </div>
                                <span className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    stat.changeType === "increase" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                )}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.name}</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Jobs Table */}
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recent Job Listings</h2>
                        <Button variant="ghost" size="sm">View all</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Job Title</th>
                                    <th className="px-6 py-3 font-semibold">Department</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Openings</th>
                                    <th className="px-6 py-3 font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <tr key={job._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{job.title}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-400">{job.department}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                                job.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                    job.status === "closed" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                                                        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                            )}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-zinc-600 dark:text-zinc-400">{job.numberOfOpenings}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                            No jobs found. Start by creating your first job listing!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
