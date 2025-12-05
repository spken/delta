/**
 * History Empty State
 */

import { History } from 'lucide-react';

export function HistoryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 text-muted-foreground mb-4">
        <History className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-display font-normal text-foreground mb-2">
        No analysis history yet
      </h3>
      <p className="text-sm text-muted-foreground font-body text-center max-w-sm">
        Your analyzed merge requests will appear here. Start by entering a GitLab MR URL above.
      </p>
    </div>
  );
}
