/**
 * Analysis page - Main MR analysis interface.
 * Allows users to input MR URL and get AI-generated summaries.
 */
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import TabNav from '@/components/TabNav';
import { apiClient } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { Loader2, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AnalyzeResponse } from '@/types/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        <TabNav />

        {/* Input Card */}
        <Card className="mb-8 mt-6">
          <CardHeader>
            <CardTitle>Analyze Merge Request</CardTitle>
            <CardDescription>
              Paste a GitLab MR URL to get an AI-generated technical summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                value={mrUrl}
                onChange={(e) => setMrUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://gitlab.com/group/project/-/merge_requests/123"
                disabled={isAnalyzing}
                className="flex-1"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="min-w-[200px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Summarize Changes</span>
                )}
              </Button>
            </div>
            {/* Helpful hint */}
            <p className="text-sm text-zinc-500 mt-2">
              Press Enter to analyze - Results are cached for instant re-analysis
            </p>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isAnalyzing && (
          <Alert variant="destructive">
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">
            {/* MR Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                      {result.mr_header.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>
                        <span className="text-zinc-400">Author:</span>{' '}
                        {result.mr_header.author}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 border-green-200"
                      >
                        {result.mr_header.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <a
                      href={result.mr_header.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <span>View on GitLab</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {result.cached ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Cached</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600">Fresh Analysis</span>
                      </>
                    )}
                  </div>
                  <span className="text-zinc-400">-</span>
                  <span className="text-zinc-500">
                    {new Date(result.scanned_at).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* AI Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Markdown content */}
                <div className="prose prose-zinc max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-zinc-900 mt-6 mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-zinc-900 mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-zinc-700 mb-4">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 text-zinc-700 mb-4">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-zinc-700">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-zinc-900 font-semibold">
                          {children}
                        </strong>
                      ),
                      code: ({ children }) => (
                        <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm text-blue-700 border border-zinc-200">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {result.summary_markdown}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
