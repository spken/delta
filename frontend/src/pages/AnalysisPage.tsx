/**
 * Analysis page - Main MR analysis interface.
 * Allows users to input MR URL and get AI-generated summaries.
 */
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AnalyzeResponse } from '@/types/api';

export default function AnalysisPage() {
  const [mrUrl, setMrUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    // Validate URL
    if (!mrUrl.trim()) {
      toast.error('Please enter a GitLab MR URL');
      return;
    }

    // Basic URL validation
    if (!mrUrl.includes('merge_requests') && !mrUrl.includes('merge_request')) {
      toast.error('Please enter a valid GitLab merge request URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.analyzeMR({ url: mrUrl });
      setResult(response);

      if (response.cached) {
        toast.success('Summary loaded from cache (instant!)');
      } else {
        toast.success('Summary generated successfully!');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to analyze merge request';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analyze Merge Request</h1>
          <p className="text-gray-400">
            Paste a GitLab MR URL to get an AI-generated technical summary
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={mrUrl}
              onChange={(e) => setMrUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://gitlab.com/group/project/-/merge_requests/123"
              className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAnalyzing}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[200px] justify-center"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Summarize Changes</span>
              )}
            </button>
          </div>

          {/* Helpful hint */}
          <p className="text-sm text-gray-500 mt-2">
            Press Enter to analyze • Results are cached for instant re-analysis
          </p>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Analyzing Merge Request</h3>
            <p className="text-gray-400 text-sm">
              Fetching MR data and generating AI summary...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isAnalyzing && (
          <div className="bg-red-950/30 border border-red-900 rounded-lg p-6">
            <h3 className="text-red-400 font-medium mb-2">Analysis Failed</h3>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">
            {/* MR Header Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {result.mr_header.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                      <span className="text-gray-500">Author:</span>{' '}
                      {result.mr_header.author}
                    </span>
                    <span className="px-2 py-1 bg-green-950 text-green-400 rounded text-xs font-medium uppercase">
                      {result.mr_header.status}
                    </span>
                  </div>
                </div>
                <a
                  href={result.mr_header.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <span>View on GitLab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {result.cached ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Cached</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400">Fresh Analysis</span>
                    </>
                  )}
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">
                  {new Date(result.scanned_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  AI-Generated Summary
                </span>
              </h3>

              {/* Markdown content */}
              <div className="prose prose-invert prose-zinc max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-white mt-6 mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-white mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-300 mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">
                        {children}
                      </strong>
                    ),
                    code: ({ children }) => (
                      <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-blue-300">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {result.summary_markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
