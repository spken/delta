/**
 * Merge Request domain types
 */

export interface User {
  name: string;
  avatar?: string;
}

export interface MRDetails {
  url: string;
  title: string;
  description: string;
  author: User;
  collaborators: User[];
  sourceBranch: string;
  targetBranch: string;
  createdAt: string;
}

export interface KeyChange {
  file: string;
  description: string;
}

export interface DiffSummary {
  overview: string; // Natural language summary
  filesChanged: number;
  additions: number;
  deletions: number;
  keyChanges: KeyChange[];
}

export interface AnalysisResult {
  id: string;
  mrDetails: MRDetails;
  diffSummary: DiffSummary;
  analyzedAt: string;
}
