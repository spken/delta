"""
Token counting utilities using tiktoken.
Estimates token usage for Azure OpenAI API calls.
"""
import tiktoken
from typing import List, Dict


class TokenCounter:
    """Utility for counting tokens in text."""

    def __init__(self, model: str = "gpt-4"):
        """
        Initialize token counter for specific model.

        Args:
            model: Model name (default: gpt-4)
        """
        try:
            self.encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            # Fallback to cl100k_base for GPT-4 and newer models
            self.encoding = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in a text string.

        Args:
            text: Text to count

        Returns:
            Number of tokens
        """
        if not text:
            return 0
        return len(self.encoding.encode(text))

    def count_tokens_in_messages(self, messages: List[Dict]) -> int:
        """
        Count tokens in a list of chat messages.

        Args:
            messages: List of message dicts with 'role' and 'content'

        Returns:
            Total number of tokens including message formatting
        """
        num_tokens = 0

        for message in messages:
            # Every message follows <|start|>{role/name}\n{content}<|end|>\n
            num_tokens += 4  # Message formatting overhead

            for key, value in message.items():
                if isinstance(value, str):
                    num_tokens += self.count_tokens(value)

                if key == "name":
                    num_tokens += -1  # Role is always required and name is optional

        num_tokens += 2  # Every reply is primed with <|start|>assistant

        return num_tokens

    def estimate_context_usage(
        self,
        title: str,
        description: str,
        changes: List[Dict],
        notes: List[Dict],
        commits: List[Dict],
    ) -> Dict[str, int]:
        """
        Estimate token usage for MR components.

        Args:
            title: MR title
            description: MR description
            changes: List of file changes
            notes: List of discussion notes
            commits: List of commits

        Returns:
            Dictionary with token counts:
            {
                "title": int,
                "description": int,
                "changes": int,
                "notes": int,
                "commits": int,
                "total": int
            }
        """
        title_tokens = self.count_tokens(title)
        description_tokens = self.count_tokens(description)

        # Count tokens in changes (diffs)
        changes_tokens = 0
        for change in changes:
            diff = change.get("diff", "")
            changes_tokens += self.count_tokens(diff)

        # Count tokens in notes
        notes_tokens = 0
        for note in notes:
            body = note.get("body", "")
            notes_tokens += self.count_tokens(body)

        # Count tokens in commits
        commits_tokens = 0
        for commit in commits:
            message = commit.get("message", "")
            commits_tokens += self.count_tokens(message)

        total = (
            title_tokens
            + description_tokens
            + changes_tokens
            + notes_tokens
            + commits_tokens
        )

        return {
            "title": title_tokens,
            "description": description_tokens,
            "changes": changes_tokens,
            "notes": notes_tokens,
            "commits": commits_tokens,
            "total": total,
        }

    def truncate_to_token_limit(self, text: str, max_tokens: int) -> str:
        """
        Truncate text to fit within token limit.

        Args:
            text: Text to truncate
            max_tokens: Maximum number of tokens

        Returns:
            Truncated text
        """
        if not text:
            return text

        tokens = self.encoding.encode(text)

        if len(tokens) <= max_tokens:
            return text

        # Truncate tokens and decode back to text
        truncated_tokens = tokens[:max_tokens]
        truncated_text = self.encoding.decode(truncated_tokens)

        return truncated_text + "..."


# Global instance
_token_counter = None


def get_token_counter(model: str = "gpt-4") -> TokenCounter:
    """
    Get or create global TokenCounter instance.

    Args:
        model: Model name

    Returns:
        TokenCounter instance
    """
    global _token_counter
    if _token_counter is None:
        _token_counter = TokenCounter(model)
    return _token_counter
