import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { generateMarkdown, downloadMarkdown } from '@/services/export/markdown-export';
import { toast } from 'sonner';
import type { AnalysisResult } from '@/types/mr';

interface ExportButtonProps {
  result: AnalysisResult;
}

export function ExportButton({ result }: ExportButtonProps) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    try {
      const markdown = generateMarkdown(result);
      const filename = `mr-analysis-${result.id}.md`;
      downloadMarkdown(markdown, filename);

      setExported(true);
      toast.success('Exported to Markdown');

      setTimeout(() => setExported(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export');
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      {exported ? <Check className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
      {exported ? 'Exported' : 'Export'}
    </Button>
  );
}
