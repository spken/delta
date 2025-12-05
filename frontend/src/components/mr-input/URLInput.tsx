import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';
import { validateGitLabMRUrl } from '@/lib/validation';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
}

export function URLInput({ value, onChange, onValidationChange, disabled }: URLInputProps) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: false });

  const validateUrl = useCallback((url: string) => {
    if (!url.trim()) {
      setValidationState({ isValid: false });
      onValidationChange(false);
      return;
    }

    const result = validateGitLabMRUrl(url);
    setValidationState({
      isValid: result.valid,
      error: result.error,
    });
    onValidationChange(result.valid);
  }, [onValidationChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => validateUrl(value), 300);
    return () => clearTimeout(timeoutId);
  }, [value, validateUrl]);

  return (
    <div className="space-y-2">
      <Label htmlFor="mr-url" className="text-sm font-medium">
        URL
      </Label>
      <div className="relative">
        <Input
          id="mr-url"
          type="url"
          placeholder="https://gitlab.com/owner/repo/-/merge_requests/123"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pr-10"
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationState.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
      {validationState.error && (
        <p className="text-sm text-muted-foreground">{validationState.error}</p>
      )}
    </div>
  );
}
