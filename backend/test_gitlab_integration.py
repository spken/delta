"""
Test script for GitLab integration.
Tests URL parsing, validation, and service initialization.
"""
import asyncio
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.utils import parse_gitlab_mr_url, validate_gitlab_url, truncate_text


def test_url_parsing():
    """Test GitLab URL parsing."""
    print("\n" + "=" * 60)
    print("Testing GitLab URL Parsing")
    print("=" * 60)

    test_cases = [
        (
            "https://gitlab.com/group/project/-/merge_requests/123",
            ("group/project", 123),
            "Simple project path"
        ),
        (
            "https://gitlab.com/group/subgroup/project/-/merge_requests/456",
            ("group/subgroup/project", 456),
            "Nested project path"
        ),
        (
            "https://gitlab.example.com/namespace/repo/-/merge_requests/789",
            ("namespace/repo", 789),
            "Custom GitLab instance"
        ),
        (
            "https://invalid-url.com/not/a/gitlab/mr",
            None,
            "Invalid URL (should fail)"
        ),
        (
            "not-even-a-url",
            None,
            "Malformed URL (should fail)"
        ),
    ]

    passed = 0
    failed = 0

    for url, expected, description in test_cases:
        result = parse_gitlab_mr_url(url)
        if result == expected:
            print(f"[OK] {description}")
            print(f"     URL: {url}")
            print(f"     Result: {result}")
            passed += 1
        else:
            print(f"[FAIL] {description}")
            print(f"       URL: {url}")
            print(f"       Expected: {expected}")
            print(f"       Got: {result}")
            failed += 1
        print()

    print(f"Results: {passed} passed, {failed} failed\n")
    return failed == 0


def test_url_validation():
    """Test GitLab URL validation."""
    print("=" * 60)
    print("Testing GitLab URL Validation")
    print("=" * 60)

    test_cases = [
        (
            "https://gitlab.com/foo/bar/-/merge_requests/1",
            "https://gitlab.com",
            True,
            "Same instance"
        ),
        (
            "https://gitlab.example.com/foo/bar/-/merge_requests/1",
            "https://gitlab.example.com",
            True,
            "Custom instance match"
        ),
        (
            "https://other.com/foo/bar/-/merge_requests/1",
            "https://gitlab.com",
            False,
            "Different instance (should fail)"
        ),
        (
            "http://gitlab.com/foo/bar/-/merge_requests/1",
            "https://gitlab.com",
            False,
            "Different scheme (should fail)"
        ),
    ]

    passed = 0
    failed = 0

    for url, expected_gitlab, expected_result, description in test_cases:
        result = validate_gitlab_url(url, expected_gitlab)
        if result == expected_result:
            print(f"[OK] {description}")
            print(f"     URL: {url}")
            print(f"     Expected GitLab: {expected_gitlab}")
            print(f"     Valid: {result}")
            passed += 1
        else:
            print(f"[FAIL] {description}")
            print(f"       URL: {url}")
            print(f"       Expected GitLab: {expected_gitlab}")
            print(f"       Expected: {expected_result}")
            print(f"       Got: {result}")
            failed += 1
        print()

    print(f"Results: {passed} passed, {failed} failed\n")
    return failed == 0


def test_utilities():
    """Test utility functions."""
    print("=" * 60)
    print("Testing Utility Functions")
    print("=" * 60)

    # Test truncate_text
    test_cases = [
        ("Hello World", 5, "Hello...", "Truncate long text"),
        ("Short", 10, "Short", "Don't truncate short text"),
        ("", 5, "", "Empty string"),
    ]

    passed = 0
    failed = 0

    for text, max_len, expected, description in test_cases:
        result = truncate_text(text, max_len)
        if result == expected:
            print(f"[OK] {description}")
            passed += 1
        else:
            print(f"[FAIL] {description}")
            print(f"       Input: '{text}' (max_len={max_len})")
            print(f"       Expected: '{expected}'")
            print(f"       Got: '{result}'")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed\n")
    return failed == 0


async def test_services():
    """Test service initialization."""
    print("=" * 60)
    print("Testing Service Initialization")
    print("=" * 60)

    try:
        # Test GitLabService initialization
        from app.services.gitlab_service import GitLabService
        gitlab_service = GitLabService("test_token")
        print("[OK] GitLabService initialized")

        # Test that client is created
        assert gitlab_service.client is not None
        print("[OK] GitLab client created")

        # Test MRAnalysisService initialization
        from app.services.mr_analysis_service import MRAnalysisService
        from app.core.database import AsyncSessionLocal

        async with AsyncSessionLocal() as db:
            analysis_service = MRAnalysisService(gitlab_service, db)
            print("[OK] MRAnalysisService initialized")

            # Test file skipping logic
            should_skip_lock = await analysis_service.should_skip_file("package-lock.json")
            assert should_skip_lock == True
            print("[OK] Lock file detection works")

            should_skip_code = await analysis_service.should_skip_file("main.py")
            assert should_skip_code == False
            print("[OK] Code file detection works")

        print("\n[OK] All service tests passed!\n")
        return True

    except Exception as e:
        print(f"[FAIL] Service initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("DELTA GitLab Integration Tests")
    print("=" * 60)

    all_passed = True

    # Test URL parsing
    if not test_url_parsing():
        all_passed = False

    # Test URL validation
    if not test_url_validation():
        all_passed = False

    # Test utilities
    if not test_utilities():
        all_passed = False

    # Test services
    if not await test_services():
        all_passed = False

    # Final summary
    print("=" * 60)
    if all_passed:
        print("[OK] ALL TESTS PASSED!")
    else:
        print("[FAIL] Some tests failed")
    print("=" * 60)
    print()

    return all_passed


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
