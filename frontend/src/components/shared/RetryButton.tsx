/**
 * Retry Button for failed operations
 */

import { Button, type ButtonProps } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps extends Omit<ButtonProps, 'onClick'> {
  onRetry: () => void;
  retrying?: boolean;
}

export function RetryButton({
  onRetry,
  retrying,
  className,
  variant = 'outline',
  size = 'default',
  ...props
}: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={retrying}
      variant={variant}
      size={size}
      className={cn('font-body transition-smooth', className)}
      {...props}
    >
      <RefreshCw className={cn('w-4 h-4 mr-2', retrying && 'animate-spin')} />
      {retrying ? 'Retrying...' : 'Retry'}
    </Button>
  );
}
