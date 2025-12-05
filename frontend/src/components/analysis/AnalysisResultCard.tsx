import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { AnalysisResult } from '@/types/mr';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  const { mrDetails, diffSummary } = result;
  const createdDate = new Date(mrDetails.createdAt).toLocaleDateString();

  return (
    <div className="space-y-4">
      {/* Metadata Card */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">{mrDetails.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span>{mrDetails.author.name}</span>
                <span>•</span>
                <span>{createdDate}</span>
                <span>•</span>
                <a
                  href={mrDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View on GitLab
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Files Changed</div>
                <div className="text-lg font-semibold">{diffSummary.filesChanged}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Additions</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  +{diffSummary.additions}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Deletions</div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  −{diffSummary.deletions}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Net Change</div>
                <div className="text-lg font-semibold">
                  {diffSummary.additions - diffSummary.deletions > 0 ? '+' : ''}
                  {diffSummary.additions - diffSummary.deletions}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-20">Branches:</span>
                <span className="font-mono">
                  {mrDetails.sourceBranch} → {mrDetails.targetBranch}
                </span>
              </div>
              {mrDetails.collaborators.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-20">Contributors:</span>
                  <span>{mrDetails.collaborators.map(c => c.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Card */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2 prose-p:text-sm prose-p:leading-relaxed prose-ul:text-sm prose-li:my-1">
            <ReactMarkdown>{diffSummary.overview}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
