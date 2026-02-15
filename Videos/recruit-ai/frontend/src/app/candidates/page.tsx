"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    Users,
    Plus,
    MoreVertical,
    Filter,
    Loader2,
    AlertCircle,
    Search,
    Mail,
    Phone,
    X,
    MessageSquare,
    Calendar
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ResumeUpload from "@/components/ResumeUpload";
import CandidateCommunication from "@/components/CandidateCommunication";
import InterviewScheduler from "@/components/InterviewScheduler";

export default function CandidatesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConnectDrawer, setShowConnectDrawer] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    // New Candidate Form State
    const [newCandidate, setNewCandidate] = useState<any>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        currentCompany: "",
        currentTitle: "",
        skills: [],
        status: "new"
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchCandidates = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get("/candidates");
            setCandidates(res.data.data);
        } catch (err: any) {
            setError("Failed to fetch candidates.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [user]);

    const handleResumeParsed = (data: any) => {
        setNewCandidate({
            ...newCandidate,
            ...data,
            skills: data.skills || []
        });
    };

    const handleCreateCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/candidates', newCandidate);
            if (res.data.success) {
                setShowAddModal(false);
                fetchCandidates();
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to create candidate profile.");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Candidates Pool</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">View and manage your entire talent pool with AI-powered insights.</p>
                    </div>
                    <Button variant="premium" className="gap-2 self-start" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} />
                        Add Candidate
                    </Button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* MODAL / SLIDE OVER for Adding Candidate */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm">
                        <div className="h-full w-full max-w-xl bg-white dark:bg-zinc-950 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Add New Candidate</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Step 1: AI Resume Parsing</h3>
                                    <ResumeUpload onParsed={handleResumeParsed} />
                                </section>

                                <form onSubmit={handleCreateCandidate} className="space-y-6">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Step 2: Verify Profile</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newCandidate.firstName}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, firstName: e.target.value })}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newCandidate.lastName}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, lastName: e.target.value })}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={newCandidate.email}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Current Title</label>
                                            <input
                                                type="text"
                                                value={newCandidate.currentTitle}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, currentTitle: e.target.value })}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Current Company</label>
                                            <input
                                                type="text"
                                                value={newCandidate.currentCompany}
                                                onChange={(e) => setNewCandidate({ ...newCandidate, currentCompany: e.target.value })}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" variant="premium" className="w-full py-6">Create AI-Indexed Profile</Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, skills, or email..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} />
                            Advanced Filter
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Candidate</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {candidates.length > 0 ? candidates.map((candidate) => (
                                <tr key={candidate._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold uppercase">
                                                {candidate.firstName?.[0] || '?'}{candidate.lastName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-50">{candidate.firstName} {candidate.lastName}</p>
                                                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-500">
                                                    <span className="flex items-center gap-1"><Mail size={10} /> {candidate.email}</span>
                                                    <span className="font-bold text-zinc-300 dark:text-zinc-700">|</span>
                                                    <span>{candidate.currentTitle} @ {candidate.currentCompany}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                            candidate.status === "new" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                                                candidate.status === "hired" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCandidate(candidate);
                                                    setShowConnectDrawer(true);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            <button className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                        No candidates found. Start by adding your first candidate!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* CONNECT DRAWER */}
                {showConnectDrawer && selectedCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm">
                        <div className="h-full w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                                        {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Connect with {selectedCandidate.firstName}</h2>
                                        <p className="text-xs text-zinc-500">{selectedCandidate.currentTitle} • {selectedCandidate.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowConnectDrawer(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">AI Interview Scheduling</h3>
                                    <InterviewScheduler
                                        applicationId="placeholder-app-id"
                                        candidateName={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                                    />
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Direct Messaging</h3>
                                    <CandidateCommunication candidate={selectedCandidate} />
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
