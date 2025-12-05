import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import type { MRDetails } from '@/types/mr';

interface MRDetailsCardProps {
  details: MRDetails;
}

export function MRDetailsCard({ details }: MRDetailsCardProps) {
  const createdDate = new Date(details.createdAt).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{details.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          by {details.author.name} on {createdDate}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.description && (
          <>
            <p className="text-sm">{details.description}</p>
            <Separator />
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium mb-2">Branches</p>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{details.sourceBranch}</Badge>
              <span>→</span>
              <Badge variant="outline">{details.targetBranch}</Badge>
            </div>
          </div>

          {details.collaborators.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Collaborators</p>
              <div className="flex flex-wrap gap-2">
                {details.collaborators.map((collab, i) => (
                  <Badge key={i} variant="secondary">{collab.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <a
          href={details.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View on GitLab
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
