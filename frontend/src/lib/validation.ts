/**
 * URL validation utilities for GitLab MR URLs
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  parsed?: {
    projectPath: string;
    mrId: string;
  };
}

export function validateGitLabMRUrl(url: string): ValidationResult {
  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check if URL is empty
  if (!trimmedUrl) {
    return {
      valid: false,
      error: 'Please enter a GitLab merge request URL',
    };
  }

  // Regex for GitLab MR URLs (supports both gitlab.com and self-hosted)
  // Pattern: https://gitlab.com/{owner}/{repo}/-/merge_requests/{id}
  const mrPattern = /^https?:\/\/(?:www\.)?gitlab\.com\/([^\/]+\/[^\/]+)\/-\/merge_requests\/(\d+)/;

  const match = trimmedUrl.match(mrPattern);

  if (!match) {
    return {
      valid: false,
      error: 'Invalid GitLab MR URL. Expected format: https://gitlab.com/{owner}/{repo}/-/merge_requests/{id}',
    };
  }

  return {
    valid: true,
    parsed: {
      projectPath: match[1],
      mrId: match[2],
    },
  };
}
