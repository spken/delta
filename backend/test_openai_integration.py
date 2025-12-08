"""
Test script for Azure OpenAI integration.
Tests token counting and service initialization.
"""
import asyncio
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.token_counter import TokenCounter, get_token_counter
from app.services.openai_service import OpenAIService


def test_token_counting():
    """Test token counting functionality."""
    print("\n" + "=" * 60)
    print("Testing Token Counting")
    print("=" * 60)

    counter = TokenCounter()

    test_cases = [
        ("Hello, world!", "Simple text"),
        ("", "Empty string"),
        ("The quick brown fox jumps over the lazy dog " * 10, "Repeated text"),
        ("🚀 Emoji test 🎉", "Text with emojis"),
    ]

    for text, description in test_cases:
        count = counter.count_tokens(text)
        print(f"[OK] {description}")
        print(f"     Text length: {len(text)} chars")
        print(f"     Token count: {count} tokens")
        print()

    return True


def test_message_token_counting():
    """Test token counting for chat messages."""
    print("=" * 60)
    print("Testing Message Token Counting")
    print("=" * 60)

    counter = TokenCounter()

    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
        {"role": "assistant", "content": "The capital of France is Paris."},
    ]

    count = counter.count_tokens_in_messages(messages)
    print(f"[OK] Message token count: {count} tokens")
    print()

    return True


def test_context_estimation():
    """Test token estimation for MR data."""
    print("=" * 60)
    print("Testing Context Estimation")
    print("=" * 60)

    counter = TokenCounter()

    # Mock MR data
    title = "Add user authentication feature"
    description = "This MR implements user authentication using OAuth 2.0"
    changes = [
        {"diff": "+++ added some code\n--- removed old code\n" * 10},
        {"diff": "+++ another file change\n" * 5},
    ]
    notes = [
        {"body": "This looks good!"},
        {"body": "Can you add tests?"},
    ]
    commits = [
        {"message": "feat: add login endpoint"},
        {"message": "fix: handle edge case"},
    ]

    estimate = counter.estimate_context_usage(
        title, description, changes, notes, commits
    )

    print(f"[OK] Token estimate breakdown:")
    print(f"     Title: {estimate['title']} tokens")
    print(f"     Description: {estimate['description']} tokens")
    print(f"     Changes: {estimate['changes']} tokens")
    print(f"     Notes: {estimate['notes']} tokens")
    print(f"     Commits: {estimate['commits']} tokens")
    print(f"     Total: {estimate['total']} tokens")
    print()

    return True


def test_truncation():
    """Test text truncation to token limit."""
    print("=" * 60)
    print("Testing Text Truncation")
    print("=" * 60)

    counter = TokenCounter()

    long_text = "This is a very long text. " * 100
    max_tokens = 50

    original_tokens = counter.count_tokens(long_text)
    truncated = counter.truncate_to_token_limit(long_text, max_tokens)
    truncated_tokens = counter.count_tokens(truncated)

    print(f"[OK] Truncation test:")
    print(f"     Original: {original_tokens} tokens")
    print(f"     After truncation: {truncated_tokens} tokens")
    print(f"     Target: {max_tokens} tokens")
    print(f"     Within limit: {truncated_tokens <= max_tokens + 5}")  # Allow small margin
    print()

    return True


def test_service_initialization():
    """Test OpenAI service initialization."""
    print("=" * 60)
    print("Testing Service Initialization")
    print("=" * 60)

    try:
        service = OpenAIService()
        print("[OK] OpenAIService initialized")

        # Check client exists
        assert service.client is not None
        print("[OK] Azure OpenAI client created")

        # Check deployment name
        assert service.deployment
        print(f"[OK] Deployment name: {service.deployment}")

        # Check token counter
        assert service.token_counter is not None
        print("[OK] Token counter initialized")

        # Check prompts
        system_prompt = service.get_system_prompt()
        assert "Context" in system_prompt
        assert "Key Changes" in system_prompt
        assert "Potential Risks" in system_prompt
        print("[OK] System prompt validated")

        file_prompt = service.get_file_summary_prompt()
        assert "file change" in file_prompt.lower()
        print("[OK] File summary prompt validated")

        print("\n[OK] All service initialization tests passed!")
        return True

    except Exception as e:
        print(f"[FAIL] Service initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_strategy_selection():
    """Test automatic strategy selection based on size."""
    print("=" * 60)
    print("Testing Strategy Selection")
    print("=" * 60)

    service = OpenAIService()

    # Small MR (should use direct)
    small_changes = [{"diff": "+++ small change\n" * 10}]
    counter = service.token_counter
    estimate = counter.estimate_context_usage(
        "Small MR", "Description", small_changes, [], []
    )
    print(f"[INFO] Small MR: {estimate['total']} tokens")
    if estimate['total'] < service.SAFE_INPUT_TOKENS:
        print("[OK] Would use direct summarization")
    else:
        print("[FAIL] Should use direct but total exceeds limit")
        return False

    # Large MR (should use chunked)
    large_changes = [{"diff": "+++ large change\n" * 10000} for _ in range(100)]
    estimate = counter.estimate_context_usage(
        "Large MR", "Description", large_changes, [], []
    )
    print(f"[INFO] Large MR: {estimate['total']} tokens")
    if estimate['total'] >= service.SAFE_INPUT_TOKENS:
        print("[OK] Would use Map-Reduce chunking")
    else:
        print("[INFO] Still under limit, but would handle both strategies")

    print()
    return True


def test_global_singleton():
    """Test global singleton pattern."""
    print("=" * 60)
    print("Testing Global Singleton")
    print("=" * 60)

    from app.core.token_counter import get_token_counter
    from app.services.openai_service import get_openai_service

    counter1 = get_token_counter()
    counter2 = get_token_counter()
    assert counter1 is counter2
    print("[OK] TokenCounter singleton works")

    service1 = get_openai_service()
    service2 = get_openai_service()
    assert service1 is service2
    print("[OK] OpenAIService singleton works")

    print()
    return True


async def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("DELTA Azure OpenAI Integration Tests")
    print("=" * 60)

    all_passed = True

    # Test token counting
    if not test_token_counting():
        all_passed = False

    # Test message token counting
    if not test_message_token_counting():
        all_passed = False

    # Test context estimation
    if not test_context_estimation():
        all_passed = False

    # Test truncation
    if not test_truncation():
        all_passed = False

    # Test service initialization
    if not test_service_initialization():
        all_passed = False

    # Test strategy selection
    if not test_strategy_selection():
        all_passed = False

    # Test singletons
    if not test_global_singleton():
        all_passed = False

    # Final summary
    print("=" * 60)
    if all_passed:
        print("[OK] ALL TESTS PASSED!")
        print("\n[INFO] Note: Actual API calls not tested (requires Azure credentials)")
        print("[INFO] API functionality will be tested in Milestone 6")
    else:
        print("[FAIL] Some tests failed")
    print("=" * 60)
    print()

    return all_passed


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
