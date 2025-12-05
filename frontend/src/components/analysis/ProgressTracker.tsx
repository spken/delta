import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgress } from '@/hooks/use-progress';
import type { AnalysisProgress } from '@/types/api';

interface ProgressTrackerProps {
  progress: AnalysisProgress;
  startedAt: Date;
}

export function ProgressTracker({ progress, startedAt }: ProgressTrackerProps) {
  const { elapsedFormatted, remainingFormatted, progressPercentage } = useProgress(startedAt, progress);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setDisplayProgress(progressPercentage), 50);
    return () => clearTimeout(timeout);
  }, [progressPercentage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Analyzing</CardTitle>
        <CardDescription>{progress.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={displayProgress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{elapsedFormatted}</span>
          <span>{displayProgress}%</span>
          <span>{remainingFormatted}</span>
        </div>
      </CardContent>
    </Card>
  );
}
