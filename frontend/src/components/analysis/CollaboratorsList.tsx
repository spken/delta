/**
 * Collaborators List - Avatar group component
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/mr';
import { cn } from '@/lib/utils';

interface CollaboratorsListProps {
  collaborators: User[];
  className?: string;
}

export function CollaboratorsList({ collaborators, className }: CollaboratorsListProps) {
  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex -space-x-2">
        {collaborators.map((collaborator, index) => (
          <Avatar
            key={index}
            className="w-8 h-8 border-2 border-card ring-2 ring-card transition-transform hover:scale-110 hover:z-10"
          >
            <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {getInitials(collaborator.name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-sm text-muted-foreground font-body">
        {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
      </span>
    </div>
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
