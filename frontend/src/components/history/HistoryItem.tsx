/**
 * History Item - Single history entry card
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExportButton } from '@/components/analysis/ExportButton';
import { Calendar, FileCode2, Plus, Minus, Trash2 } from 'lucide-react';
import type { AnalysisResult } from '@/types/mr';
import { cn } from '@/lib/utils';

interface HistoryItemProps {
  result: AnalysisResult;
  onDelete: (id: string) => void;
  onClick: () => void;
  className?: string;
}

export function HistoryItem({ result, onDelete, onClick, className }: HistoryItemProps) {
  const analyzedDate = new Date(result.analyzedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const analyzedTime = new Date(result.analyzedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(result.id);
  };

  return (
    <Card
      className={cn(
        'border-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 group',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <Avatar className="w-10 h-10 border-2 border-primary/20 flex-shrink-0">
            <AvatarImage src={result.mrDetails.author.avatar} alt={result.mrDetails.author.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {getInitials(result.mrDetails.author.name)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <h3 className="font-display text-base font-normal text-foreground leading-tight group-hover:text-primary transition-colors truncate">
              {result.mrDetails.title}
            </h3>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body flex-wrap">
              <span className="font-medium">{result.mrDetails.author.name}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{analyzedDate}</span>
                <span className="font-mono">{analyzedTime}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs font-mono">
                <FileCode2 className="w-3 h-3 mr-1" />
                {result.diffSummary.filesChanged} files
              </Badge>
              <Badge className="text-xs font-mono bg-accent/10 text-accent border-accent/20">
                <Plus className="w-3 h-3 mr-1" />
                {result.diffSummary.additions}
              </Badge>
              <Badge className="text-xs font-mono bg-destructive/10 text-destructive border-destructive/20">
                <Minus className="w-3 h-3 mr-1" />
                {result.diffSummary.deletions}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExportButton result={result} variant="ghost" size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
