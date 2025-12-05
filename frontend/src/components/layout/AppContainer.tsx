/**
 * App Container - Max-width container with padding
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppContainerProps {
  children: ReactNode;
  className?: string;
}

export function AppContainer({ children, className }: AppContainerProps) {
  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
      {children}
    </div>
  );
}
