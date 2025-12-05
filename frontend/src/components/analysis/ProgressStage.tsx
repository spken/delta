/**
 * Individual Progress Stage Component
 */

import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StageStatus = 'pending' | 'active' | 'complete';

interface ProgressStageProps {
  label: string;
  status: StageStatus;
  index: number;
}

export function ProgressStage({ label, status, index }: ProgressStageProps) {
  return (
    <div className="flex items-center gap-3 group">
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
          status === 'complete' && 'bg-accent text-accent-foreground scale-100',
          status === 'active' && 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30',
          status === 'pending' && 'bg-muted text-muted-foreground scale-95'
        )}
      >
        {status === 'complete' && <Check className="w-4 h-4" />}
        {status === 'active' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'pending' && <Circle className="w-3 h-3" />}
      </div>

      {/* Label */}
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-body transition-all duration-300',
            status === 'complete' && 'text-foreground font-medium',
            status === 'active' && 'text-foreground font-semibold',
            status === 'pending' && 'text-muted-foreground'
          )}
        >
          {label}
        </p>
      </div>

      {/* Status Badge */}
      <div
        className={cn(
          'text-xs font-mono px-2 py-0.5 rounded transition-all duration-300',
          status === 'complete' && 'bg-accent/10 text-accent-foreground',
          status === 'active' && 'bg-primary/10 text-primary',
          status === 'pending' && 'bg-muted text-muted-foreground'
        )}
      >
        {status === 'complete' && 'Complete'}
        {status === 'active' && 'Processing'}
        {status === 'pending' && 'Pending'}
      </div>
    </div>
  );
}
