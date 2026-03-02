import React from 'react';
import {
    Brain,
    Zap,
    ShieldCheck,
    Search,
    Cpu,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NeuralPatternBoxProps {
    patterns: {
        technicalAptitude: number;
        confidence: number;
        creativity: number;
        notes: string[];
        hiddenBriefing?: {
            vibe: string;
            theOneThing: string;
            probe: string;
            redFlags: string[];
        };
    };
}

export const NeuralPatternBox: React.FC<NeuralPatternBoxProps> = ({ patterns }) => {
    // If no data, show high-tech processing state
    if (!patterns || (!patterns.technicalAptitude && !patterns.notes?.length)) {
        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                <Search size={14} className="text-zinc-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Scanning Neural Signature...</span>
            </div>
        );
    }

    const latestInsight = patterns.notes?.[patterns.notes.length - 1] || "Pattern decoding in progress...";

    return (
        <div className="flex flex-col gap-3 py-1">
            {/* Insight Metrics */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-[120px]">
                        <Cpu size={12} className="text-emerald-500" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Knowledge: {patterns.technicalAptitude}%</span>
                        <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${patterns.technicalAptitude}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-indigo-500" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Flexibility: {patterns.creativity}%</span>
                        <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${patterns.creativity}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-[100px]">
                        <ShieldCheck size={12} className="text-blue-500" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Confidence: {patterns.confidence}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Target size={12} className="text-amber-500" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Status: {patterns.technicalAptitude > 75 ? 'Expert' : 'Novice'}</span>
                    </div>
                </div>
            </div>

            {/* Best Hidden Pattern Briefing */}
            <div className="flex items-start gap-2 p-2.5 bg-zinc-900 dark:bg-zinc-950 rounded-xl border border-zinc-800 shadow-inner group transition-all hover:bg-black">
                <Brain size={12} className="shrink-0 mt-0.5 text-indigo-400 group-hover:animate-pulse" />
                <p className="text-[11px] text-zinc-400 leading-tight font-medium">
                    <span className="text-indigo-300 font-bold mr-1 italic uppercase tracking-widest text-[9px]">Neural Brief:</span>
                    {patterns.hiddenBriefing?.theOneThing
                        ? (patterns.hiddenBriefing.theOneThing.length > 90 ? patterns.hiddenBriefing.theOneThing.substring(0, 90) + '...' : patterns.hiddenBriefing.theOneThing)
                        : (latestInsight.length > 90 ? latestInsight.substring(0, 90) + '...' : latestInsight)}
                </p>
            </div>
        </div>
    );
};
