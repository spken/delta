"""
Azure OpenAI service for generating MR summaries.
Implements Map-Reduce strategy for handling large diffs.
"""
from typing import List, Dict, Optional
from openai import AsyncAzureOpenAI

from app.core.config import settings
from app.core.token_counter import get_token_counter


class OpenAIService:
    """Service for Azure OpenAI API interactions."""

    # Token limits (conservative estimates)
    MAX_CONTEXT_TOKENS = 120000  # GPT-4 Turbo context window
    MAX_OUTPUT_TOKENS = 4000  # Reserve for response
    SAFE_INPUT_TOKENS = 100000  # Safe limit for input

    def __init__(self):
        """Initialize Azure OpenAI client."""
        self.client = AsyncAzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        )
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT
        self.token_counter = get_token_counter()

    def get_system_prompt(self) -> str:
        """
        Get system prompt for MR summarization.

        Returns:
            System prompt string
        """
        return """You are a senior technical lead reviewing GitLab Merge Requests.

Your task is to analyze merge request changes and produce a comprehensive, technical summary.

Structure your response in this exact format:

## Context
What is this merge request about? What problem does it solve or feature does it add?

## Key Changes
List the main technical changes made:
- Component/module changes
- API modifications
- Database schema changes
- New dependencies or configurations
- Refactoring or architectural changes

## Potential Risks
Identify potential issues or concerns:
- Breaking changes
- Performance implications
- Security considerations
- Migration requirements
- Testing gaps

Be concise but technical. Focus on WHAT changed and WHY, not HOW (the code shows how).
Use bullet points for clarity. Highlight important items in **bold**."""

    def get_file_summary_prompt(self) -> str:
        """
        Get prompt for summarizing individual files (Map phase).

        Returns:
            Prompt string for file-level summaries
        """
        return """Analyze this file change and provide a brief technical summary (2-3 sentences max).

Focus on:
- What changed in this file
- Why it might have changed (infer from context)
- Any notable patterns or concerns

Be concise and technical."""

    async def generate_summary(
        self,
        title: str,
        description: str,
        changes: List[Dict],
        notes: List[Dict],
        commits: List[Dict],
    ) -> Optional[str]:
        """
        Generate MR summary using appropriate strategy.

        Automatically chooses between:
        - Direct summarization (if fits in context)
        - Map-Reduce chunking (if too large)

        Args:
            title: MR title
            description: MR description
            changes: List of file changes
            notes: List of discussion notes
            commits: List of commits

        Returns:
            Generated summary markdown, or None if failed
        """
        # Estimate token usage
        token_estimate = self.token_counter.estimate_context_usage(
            title, description, changes, notes, commits
        )

        print(f"[INFO] Token estimate: {token_estimate['total']} tokens")

        # Choose strategy based on token count
        if token_estimate["total"] < self.SAFE_INPUT_TOKENS:
            print("[INFO] Using direct summarization (fits in context)")
            return await self._generate_direct_summary(
                title, description, changes, notes, commits
            )
        else:
            print("[INFO] Using Map-Reduce chunking (exceeds context limit)")
            return await self._generate_chunked_summary(
                title, description, changes, notes, commits
            )

    async def _generate_direct_summary(
        self,
        title: str,
        description: str,
        changes: List[Dict],
        notes: List[Dict],
        commits: List[Dict],
    ) -> Optional[str]:
        """
        Generate summary directly (single API call).

        Args:
            title: MR title
            description: MR description
            changes: List of file changes
            notes: List of discussion notes
            commits: List of commits

        Returns:
            Generated summary or None
        """
        # Build user message with all context
        user_message = self._build_full_context(
            title, description, changes, notes, commits
        )

        messages = [
            {"role": "system", "content": self.get_system_prompt()},
            {"role": "user", "content": user_message},
        ]

        try:
            response = await self.client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                temperature=0.3,
                max_tokens=self.MAX_OUTPUT_TOKENS,
            )

            summary = response.choices[0].message.content
            return summary

        except Exception as e:
            print(f"[ERROR] Failed to generate summary: {e}")
            return None

    async def _generate_chunked_summary(
        self,
        title: str,
        description: str,
        changes: List[Dict],
        notes: List[Dict],
        commits: List[Dict],
    ) -> Optional[str]:
        """
        Generate summary using Map-Reduce strategy.

        MAP phase: Summarize each file individually
        REDUCE phase: Combine file summaries into final summary

        Args:
            title: MR title
            description: MR description
            changes: List of file changes
            notes: List of discussion notes
            commits: List of commits

        Returns:
            Generated summary or None
        """
        print("[INFO] MAP Phase: Summarizing individual files...")

        # MAP: Summarize each file
        file_summaries = []
        for i, change in enumerate(changes):
            filepath = change.get("new_path", change.get("old_path", "unknown"))
            diff = change.get("diff", "")

            # Skip if diff is empty
            if not diff:
                continue

            print(f"[INFO] Processing file {i+1}/{len(changes)}: {filepath}")

            file_summary = await self._summarize_file(filepath, diff)
            if file_summary:
                file_summaries.append({
                    "filepath": filepath,
                    "summary": file_summary,
                })

        print(f"[INFO] REDUCE Phase: Combining {len(file_summaries)} file summaries...")

        # REDUCE: Combine file summaries with metadata
        return await self._generate_final_summary(
            title, description, file_summaries, notes, commits
        )

    async def _summarize_file(self, filepath: str, diff: str) -> Optional[str]:
        """
        Summarize a single file change (MAP phase).

        Args:
            filepath: Path to file
            diff: Unified diff content

        Returns:
            File summary or None
        """
        # Truncate diff if too large
        max_diff_tokens = 10000
        diff_token_count = self.token_counter.count_tokens(diff)

        if diff_token_count > max_diff_tokens:
            diff = self.token_counter.truncate_to_token_limit(diff, max_diff_tokens)

        user_message = f"""File: {filepath}

Changes:
```diff
{diff}
```

Provide a brief summary of this change."""

        messages = [
            {"role": "system", "content": self.get_file_summary_prompt()},
            {"role": "user", "content": user_message},
        ]

        try:
            response = await self.client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                temperature=0.3,
                max_tokens=500,  # Brief summaries
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"[ERROR] Failed to summarize file {filepath}: {e}")
            return None

    async def _generate_final_summary(
        self,
        title: str,
        description: str,
        file_summaries: List[Dict],
        notes: List[Dict],
        commits: List[Dict],
    ) -> Optional[str]:
        """
        Generate final summary from file summaries (REDUCE phase).

        Args:
            title: MR title
            description: MR description
            file_summaries: List of per-file summaries
            notes: Discussion notes
            commits: Commit messages

        Returns:
            Final summary or None
        """
        # Build file summaries section
        files_section = "\n\n".join([
            f"**{fs['filepath']}**: {fs['summary']}"
            for fs in file_summaries
        ])

        # Build commits section
        commits_section = "\n".join([
            f"- {commit.get('title', '')}"
            for commit in commits[:10]  # Limit to 10 commits
        ])

        # Build notes section
        notes_section = "\n".join([
            f"- {note.get('author', 'Unknown')}: {note.get('body', '')[:200]}"
            for note in notes[:5]  # Limit to 5 notes
        ])

        user_message = f"""# Merge Request: {title}

## Description
{description if description else "No description provided"}

## File Changes Summary
{files_section}

## Recent Commits
{commits_section}

## Discussion Highlights
{notes_section if notes_section else "No discussions"}

Based on the above information, generate a comprehensive technical summary following the format in your system prompt."""

        messages = [
            {"role": "system", "content": self.get_system_prompt()},
            {"role": "user", "content": user_message},
        ]

        try:
            response = await self.client.chat.completions.create(
                model=self.deployment,
                messages=messages,
                temperature=0.3,
                max_tokens=self.MAX_OUTPUT_TOKENS,
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"[ERROR] Failed to generate final summary: {e}")
            return None

    def _build_full_context(
        self,
        title: str,
        description: str,
        changes: List[Dict],
        notes: List[Dict],
        commits: List[Dict],
    ) -> str:
        """
        Build full context message for direct summarization.

        Args:
            title: MR title
            description: MR description
            changes: File changes
            notes: Discussion notes
            commits: Commits

        Returns:
            Formatted context string
        """
        # Build changes section
        changes_section = ""
        for change in changes[:50]:  # Limit to 50 files
            filepath = change.get("new_path", change.get("old_path", "unknown"))
            diff = change.get("diff", "")

            # Truncate large diffs
            if self.token_counter.count_tokens(diff) > 2000:
                diff = self.token_counter.truncate_to_token_limit(diff, 2000)

            changes_section += f"\n### {filepath}\n```diff\n{diff}\n```\n"

        # Build commits section
        commits_section = "\n".join([
            f"- {commit.get('title', '')}"
            for commit in commits[:20]
        ])

        # Build notes section
        notes_section = "\n".join([
            f"- **{note.get('author', 'Unknown')}**: {note.get('body', '')[:300]}"
            for note in notes[:10]
        ])

        return f"""# Merge Request: {title}

## Description
{description if description else "No description provided"}

## File Changes
{changes_section}

## Commits
{commits_section}

## Discussion
{notes_section if notes_section else "No discussions"}

Analyze this merge request and provide a comprehensive technical summary."""


# Singleton instance
_openai_service = None


def get_openai_service() -> OpenAIService:
    """
    Get or create global OpenAIService instance.

    Returns:
        OpenAIService instance
    """
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
