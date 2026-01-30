"use client";

import React from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface CandidateMatchListProps {
    candidates: any[];
    biasAnalysis: any;
    onViewProfile: (id: string) => void;
}

export default function CandidateMatchList({ candidates, biasAnalysis, onViewProfile }: CandidateMatchListProps) {
    return (
        <div className="space-y-6">
            {biasAnalysis && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-amber-600 dark:text-amber-500" size={18} />
                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-400">AI Bias & DEI Analysis</h3>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-500/80 mb-3">
                        Our AI has analyzed the top matches for potential bias. Score: <span className="font-bold">{biasAnalysis.score}/100</span>
                    </p>
                    <ul className="space-y-1">
                        {biasAnalysis.findings?.map((finding: string, i: number) => (
                            <li key={i} className="text-[10px] flex gap-2 text-amber-700 dark:text-amber-500/70">
                                <span>•</span> {finding}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-3">
                {candidates.length > 0 ? candidates.map((candidate, index) => (
                    <div
                        key={candidate._id}
                        className={cn(
                            "group p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:shadow-md",
                            index === 0 && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950"
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <User className="text-zinc-500" size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{candidate.firstName} {candidate.lastName}</h4>
                                        {index === 0 && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                                                Best Match
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{candidate.currentTitle} • {candidate.currentCompany}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                    <Target size={14} />
                                    <span className="text-lg font-bold">{candidate.matchScore}%</span>
                                </div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Match Score</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {candidate.skills?.slice(0, 4).map((skill: string) => (
                                <span key={skill} className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]">
                                    {skill}
                                </span>
                            ))}
                            {candidate.skills?.length > 4 && (
                                <span className="text-[10px] text-zinc-400 self-center">+{candidate.skills.length - 4} more</span>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    Skills Verified
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                    <TrendingUp size={12} className="text-blue-500" />
                                    High Growth
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => onViewProfile(candidate._id)} className="h-8 text-xs">
                                View Full Profile
                            </Button>
                        </div>
                    </div>
                )) : (
                    <div className="p-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <p className="text-sm text-zinc-500">No candidates matched this job description yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
