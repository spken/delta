import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function AnalyzeButton({ onClick, disabled, loading }: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Analyze'
      )}
    </Button>
  );
}
