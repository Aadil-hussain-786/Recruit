'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessingResult {
  resumeId: string;
  overallMatchScore: number;
  matchedQualifications: string[];
  missingQualifications: string[];
  recommendations: string[];
  processedAt: string;
}

export default function ResumeUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescriptionId, setJobDescriptionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState('');
  const [uploadedResumeId, setUploadedResumeId] = useState('');

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);
    if (jobDescriptionId) {
      formData.append('jobDescriptionId', jobDescriptionId);
    }

    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/v1/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      setUploadedResumeId(data.data.resumeId);
      
      // Poll for results
      pollForResults(data.data.resumeId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const pollForResults = async (resumeId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:5000/api/v1/resumes/${resumeId}/result`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.data.overallMatchScore !== undefined) {
          setResult(data.data);
          setLoading(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setError('Processing timed out');
          setLoading(false);
        }
      } catch (err: any) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setError('Failed to get processing results');
          setLoading(false);
        }
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resume Upload & Analysis</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume File (PDF, DOC, DOCX, TXT)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description ID (optional)
            </label>
            <input
              type="text"
              value={jobDescriptionId}
              onChange={(e) => setJobDescriptionId(e.target.value)}
              placeholder="Enter job ID for targeted analysis"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold
              ${!selectedFile || loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processing...' : 'Upload & Analyze'}
          </button>
        </div>

        {/* Loading State */}
        {loading && !result && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Analyzing resume...</span>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            {/* Overall Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Overall Match Score</span>
                <span className={`text-2xl font-bold ${
                  result.overallMatchScore >= 70 ? 'text-green-600' :
                  result.overallMatchScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {result.overallMatchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.overallMatchScore >= 70 ? 'bg-green-600' :
                    result.overallMatchScore >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${result.overallMatchScore}%` }}
                ></div>
              </div>
            </div>

            {/* Matched Qualifications */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Matched Qualifications</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedQualifications.map((qual, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {qual}
                  </span>
                ))}
                {result.matchedQualifications.length === 0 && (
                  <span className="text-gray-500 text-sm">No matches found</span>
                )}
              </div>
            </div>

            {/* Missing Qualifications */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Missing Qualifications</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingQualifications.map((qual, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {qual}
                  </span>
                ))}
                {result.missingQualifications.length === 0 && (
                  <span className="text-gray-500 text-sm">All requirements met!</span>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}