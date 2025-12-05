/**
 * Key Changes Accordion - Expandable key changes list
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileCode } from 'lucide-react';
import type { KeyChange } from '@/types/mr';
import { cn } from '@/lib/utils';

interface KeyChangesAccordionProps {
  changes: KeyChange[];
  className?: string;
}

export function KeyChangesAccordion({ changes, className }: KeyChangesAccordionProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <Accordion type="multiple" className={cn('space-y-2', className)}>
      {changes.map((change, index) => (
        <AccordionItem
          key={index}
          value={`change-${index}`}
          className="border border-border rounded-lg px-4 transition-smooth hover:border-primary/30 hover:bg-primary/5"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary flex-shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-foreground font-medium truncate">
                  {change.file}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <p className="text-sm text-foreground/80 font-body leading-relaxed pl-11">
              {change.description}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
