import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, FileText } from 'lucide-react';
import { ClearHistoryButton } from './ClearHistoryButton';
import type { AnalysisResult } from '@/types/mr';

interface HistoryListProps {
  history: AnalysisResult[];
  loading?: boolean;
  onItemClick: (result: AnalysisResult) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryList({
  history,
  loading,
  onItemClick,
  onDelete,
  onClearAll,
}: HistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No analysis history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-muted-foreground">{history.length} analyses</h2>
        <ClearHistoryButton count={history.length} onClear={onClearAll} />
      </div>

      <div className="space-y-2">
        {history.map((result) => (
          <div
            key={result.id}
            className="border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors group"
            onClick={() => onItemClick(result)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-medium text-sm">
                  {result.mrDetails.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.mrDetails.author.name} • {new Date(result.analyzedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{result.diffSummary.filesChanged} files</span>
                  <span className="text-green-600 dark:text-green-400">+{result.diffSummary.additions}</span>
                  <span className="text-red-600 dark:text-red-400">−{result.diffSummary.deletions}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(result.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
