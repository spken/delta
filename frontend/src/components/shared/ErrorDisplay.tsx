import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RetryButton } from './RetryButton';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  onRetry,
  retrying,
}: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" role="alert" aria-live="assertive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message}</p>
        {onRetry && <RetryButton onRetry={onRetry} retrying={retrying} />}
      </AlertDescription>
    </Alert>
  );
}
