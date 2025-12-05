import { useState } from 'react';
import { AppHeader } from './components/layout/AppHeader';
import { URLInput } from './components/mr-input/URLInput';
import { AnalyzeButton } from './components/mr-input/AnalyzeButton';
import { ProgressTracker } from './components/analysis/ProgressTracker';
import { AnalysisResultCard } from './components/analysis/AnalysisResultCard';
import { ExportButton } from './components/analysis/ExportButton';
import { CopyButton } from './components/shared/CopyButton';
import { ErrorDisplay } from './components/shared/ErrorDisplay';
import { HistoryList } from './components/history/HistoryList';
import { Separator } from './components/ui/separator';
import { Button } from './components/ui/button';
import { useAnalysisContext } from './context/analysis-context';
import { useHistory } from './hooks/use-history';
import { toast } from 'sonner';
import { SkipLink } from './components/shared/SkipLink';
import { SuccessAnimation } from './components/shared/SuccessAnimation';

type View = 'analysis' | 'history';

export default function App() {
  const [view, setView] = useState<View>('analysis');
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const { currentAnalysis, startAnalysis, resetAnalysis, retryAnalysis } = useAnalysisContext();
  const { history, loading: historyLoading, saveToHistory, deleteFromHistory, clearHistory } = useHistory();
  const [selectedHistoryResult, setSelectedHistoryResult] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleAnalyze = async () => {
    if (!isValidUrl || !url) return;

    try {
      const result = await startAnalysis(url);
      await saveToHistory(result);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleRetry = async () => {
    try {
      await retryAnalysis();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleReset = () => {
    resetAnalysis();
    setUrl('');
  };

  const handleHistoryItemClick = (id: string) => {
    setSelectedHistoryResult(id);
  };

  const handleHistoryDelete = async (id: string) => {
    try {
      await deleteFromHistory(id);
      if (selectedHistoryResult === id) {
        setSelectedHistoryResult(null);
      }
      toast.success('Deleted from history');
    } catch (error) {
      toast.error('Failed to delete from history');
    }
  };

  const handleHistoryClearAll = async () => {
    try {
      await clearHistory();
      setSelectedHistoryResult(null);
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const selectedResult = selectedHistoryResult
    ? history.find((r) => r.id === selectedHistoryResult)
    : currentAnalysis.result;

  const isAnalyzing = currentAnalysis.status === 'analyzing';
  const hasResult = currentAnalysis.status === 'success' && currentAnalysis.result;
  const hasError = currentAnalysis.status === 'error';

  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <AppHeader />

      {/* Navigation */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="flex gap-8 pt-6 pb-1" role="tablist">
          <button
            onClick={() => setView('analysis')}
            role="tab"
            aria-selected={view === 'analysis'}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              view === 'analysis'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analyze
            {view === 'analysis' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setView('history')}
            role="tab"
            aria-selected={view === 'history'}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              view === 'history'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              History
              {history.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {history.length}
                </span>
              )}
            </span>
            {view === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </nav>
      </div>

      <main id="main-content" className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {view === 'analysis' ? (
          <div className="space-y-8">
            {!isAnalyzing && !hasResult && !hasError && (
              <div className="space-y-6">
                {/* Welcome */}
                <div className="space-y-2 py-4">
                  <h2 className="text-lg font-semibold">Analyze a Merge Request</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter a GitLab merge request URL
                  </p>
                </div>

                <URLInput
                  value={url}
                  onChange={setUrl}
                  onValidationChange={setIsValidUrl}
                  disabled={isAnalyzing}
                />
                <AnalyzeButton
                  onClick={handleAnalyze}
                  disabled={!isValidUrl || isAnalyzing}
                  loading={isAnalyzing}
                />
              </div>
            )}

            {isAnalyzing && currentAnalysis.progress && currentAnalysis.startedAt && (
              <ProgressTracker
                progress={currentAnalysis.progress}
                startedAt={currentAnalysis.startedAt}
              />
            )}

            {hasError && currentAnalysis.error && (
              <div className="space-y-4">
                <ErrorDisplay
                  title="Analysis Failed"
                  message={currentAnalysis.error}
                  onRetry={handleRetry}
                />
                <div className="flex justify-center">
                  <Button onClick={handleReset}>Try Another</Button>
                </div>
              </div>
            )}

            {hasResult && currentAnalysis.result && (
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <CopyButton
                    text={currentAnalysis.result.diffSummary.overview}
                    successMessage="Analysis copied"
                  />
                  <ExportButton result={currentAnalysis.result} />
                  <Button onClick={handleReset} variant="outline">
                    New Analysis
                  </Button>
                </div>

                <AnalysisResultCard result={currentAnalysis.result} />
              </div>
            )}
          </div>
        ) : (
          <div>
            {selectedResult && selectedHistoryResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={() => setSelectedHistoryResult(null)}
                    variant="ghost"
                    size="sm"
                  >
                    ← Back
                  </Button>
                  <div className="flex items-center gap-2">
                    <CopyButton
                      text={selectedResult.diffSummary.overview}
                      successMessage="Analysis copied"
                    />
                    <ExportButton result={selectedResult} />
                  </div>
                </div>

                <AnalysisResultCard result={selectedResult} />
              </div>
            ) : (
              <HistoryList
                history={history}
                loading={historyLoading}
                onItemClick={(result) => handleHistoryItemClick(result.id)}
                onDelete={handleHistoryDelete}
                onClearAll={handleHistoryClearAll}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
