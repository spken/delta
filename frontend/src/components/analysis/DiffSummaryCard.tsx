import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { DiffSummary } from '@/types/mr';

interface DiffSummaryCardProps {
  summary: DiffSummary;
}

export function DiffSummaryCard({ summary }: DiffSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">{summary.filesChanged} files</Badge>
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
            +{summary.additions}
          </Badge>
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20">
            -{summary.deletions}
          </Badge>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-2">Overview</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary.overview}</p>
        </div>

        {summary.keyChanges.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Key Changes</h3>
              <div className="space-y-3">
                {summary.keyChanges.map((change, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-mono">{change.file}</p>
                    <p className="text-sm text-muted-foreground pl-4">{change.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
