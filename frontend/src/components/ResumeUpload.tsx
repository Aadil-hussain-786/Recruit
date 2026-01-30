"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
    onParsed: (data: any) => void;
}

export default function ResumeUpload({ onParsed }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!validTypes.includes(selectedFile.type)) {
                setError("Please select a PDF or DOCX file.");
                return;
            }

            setFile(selectedFile);
            setError("");
            handleUpload(selectedFile);
        }
    };

    const handleUpload = async (fileToUpload: File) => {
        setIsParsing(true);
        setStatus('parsing');
        setError("");

        const formData = new FormData();
        formData.append('resume', fileToUpload);

        try {
            const res = await api.post('/candidates/parse-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setStatus('success');
                onParsed(res.data.data);
            } else {
                throw new Error("Parsing failed");
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setError(err.response?.data?.message || "Failed to parse resume. Check your network or API key.");
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="w-full">
            <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all",
                    status === 'idle' && "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 bg-zinc-50 dark:bg-zinc-900/50",
                    status === 'parsing' && "border-indigo-400 bg-indigo-50/10",
                    status === 'success' && "border-emerald-400 bg-emerald-50/10",
                    status === 'error' && "border-red-400 bg-red-50/10"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                />

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-700 mb-4">
                    {status === 'idle' && <Upload className="text-zinc-600 dark:text-zinc-400" size={24} />}
                    {status === 'parsing' && <Loader2 className="animate-spin text-indigo-600" size={24} />}
                    {status === 'success' && <CheckCircle className="text-emerald-500" size={24} />}
                    {status === 'error' && <AlertCircle className="text-red-500" size={24} />}
                </div>

                <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {status === 'parsing' ? "AI is analyzing resume..." :
                            status === 'success' ? "Resume parsed successfully!" :
                                "Upload Candidate Resume"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        PDF or Word (max 5MB)
                    </p>
                </div>
            </div>

            {error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                </p>
            )}

            {file && status !== 'idle' && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <FileText className="text-zinc-400" size={18} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            )}
        </div>
    );
}
