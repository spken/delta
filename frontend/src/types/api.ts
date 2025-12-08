/**
 * TypeScript types for API requests and responses.
 * These match the Pydantic schemas from the backend.
 */

// Authentication types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface UserProfile {
  gitlab_user_id: string;
  username?: string;
  email?: string;
}

// Analysis types
export interface AnalyzeRequest {
  url: string;
}

export interface MRHeader {
  title: string;
  author: string;
  status: string;
  url: string;
}

export interface AnalyzeResponse {
  mr_header: MRHeader;
  summary_markdown: string;
  cached: boolean;
  scanned_at: string;
}

// History types
export interface ScanHistoryItem {
  id: number;
  project_id: number;
  mr_iid: number;
  mr_url: string;
  title: string;
  scanned_at: string;
  is_up_to_date: boolean;
}

export interface HistoryResponse {
  scans: ScanHistoryItem[];
  total: number;
}
