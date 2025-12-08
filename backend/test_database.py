"""
Database testing script.
Tests database initialization and CRUD operations.
"""
import asyncio
import sys
import os
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 >nul 2>&1')
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import init_db, AsyncSessionLocal
from app.services import user_service, scan_service


async def test_database():
    """Test database initialization and operations."""
    print("=" * 60)
    print("DELTA Database Testing")
    print("=" * 60)

    # Step 1: Initialize database
    print("\n[1/5] Initializing database...")
    try:
        await init_db()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return

    # Step 2: Test User CRUD
    print("\n[2/5] Testing User CRUD operations...")
    async with AsyncSessionLocal() as db:
        try:
            # Create user
            user = await user_service.create_user(
                db=db,
                gitlab_user_id="test_user_123",
                access_token="test_token_abc",
                refresh_token="test_refresh_xyz",
                username="testuser",
                email="test@example.com"
            )
            print(f"✓ User created: {user.gitlab_user_id} (ID: {user.id})")

            # Get user by GitLab ID
            fetched_user = await user_service.get_user_by_gitlab_id(
                db=db,
                gitlab_user_id="test_user_123"
            )
            assert fetched_user is not None
            assert fetched_user.username == "testuser"
            print(f"✓ User fetched: {fetched_user.username}")

            # Update tokens
            updated_user = await user_service.update_user_tokens(
                db=db,
                user_id=user.id,
                access_token="new_token_abc",
                refresh_token="new_refresh_xyz"
            )
            assert updated_user.access_token == "new_token_abc"
            print(f"✓ User tokens updated")

            # Test upsert (should update existing)
            upserted_user = await user_service.upsert_user(
                db=db,
                gitlab_user_id="test_user_123",
                access_token="upserted_token",
                username="updateduser"
            )
            assert upserted_user.username == "updateduser"
            print(f"✓ User upserted (updated existing)")

        except Exception as e:
            print(f"✗ User CRUD failed: {e}")
            import traceback
            traceback.print_exc()
            return

    # Step 3: Test Scan CRUD
    print("\n[3/5] Testing Scan CRUD operations...")
    async with AsyncSessionLocal() as db:
        try:
            # Create scan
            scan = await scan_service.create_scan(
                db=db,
                project_id=100,
                mr_iid=42,
                mr_url="https://gitlab.com/project/repo/-/merge_requests/42",
                title="Add new feature",
                last_commit_sha="abc123def456",
                summary_markdown="# Summary\n\nThis MR adds a new feature."
            )
            print(f"✓ Scan created: Project {scan.project_id}, MR !{scan.mr_iid}")

            # Get scan by MR
            fetched_scan = await scan_service.get_scan_by_mr(
                db=db,
                project_id=100,
                mr_iid=42
            )
            assert fetched_scan is not None
            assert fetched_scan.title == "Add new feature"
            print(f"✓ Scan fetched: {fetched_scan.title}")

            # Test cache validity check (should be valid)
            is_valid, cached_scan = await scan_service.check_cache_validity(
                db=db,
                project_id=100,
                mr_iid=42,
                current_sha="abc123def456"
            )
            assert is_valid is True
            print(f"✓ Cache validity check (valid): {is_valid}")

            # Test cache invalidation (different SHA)
            is_valid, cached_scan = await scan_service.check_cache_validity(
                db=db,
                project_id=100,
                mr_iid=42,
                current_sha="different_sha"
            )
            assert is_valid is False
            print(f"✓ Cache validity check (invalid): {is_valid}")

            # Update scan (simulate rescan)
            updated_scan = await scan_service.update_scan(
                db=db,
                scan_id=scan.id,
                last_commit_sha="new_sha_789",
                summary_markdown="# Updated Summary\n\nThis is updated."
            )
            assert updated_scan.last_commit_sha == "new_sha_789"
            print(f"✓ Scan updated with new SHA")

            # Create another scan for history test
            await scan_service.create_scan(
                db=db,
                project_id=200,
                mr_iid=99,
                mr_url="https://gitlab.com/project/repo/-/merge_requests/99",
                title="Fix critical bug",
                last_commit_sha="xyz789abc123",
                summary_markdown="# Bug Fix\n\nFixed a critical bug."
            )
            print(f"✓ Second scan created for history test")

        except Exception as e:
            print(f"✗ Scan CRUD failed: {e}")
            import traceback
            traceback.print_exc()
            return

    # Step 4: Test History/List functionality
    print("\n[4/5] Testing history/list operations...")
    async with AsyncSessionLocal() as db:
        try:
            # Get all scans
            scans, total = await scan_service.get_all_scans(db=db)
            assert len(scans) == 2
            assert total == 2
            print(f"✓ Retrieved all scans: {total} total")

            # Test search
            scans, total = await scan_service.get_all_scans(
                db=db,
                search="feature"
            )
            assert len(scans) == 1
            assert scans[0].title == "Add new feature"
            print(f"✓ Search functionality works: found {len(scans)} match(es)")

            # Test pagination
            scans, total = await scan_service.get_all_scans(
                db=db,
                limit=1,
                offset=0
            )
            assert len(scans) == 1
            print(f"✓ Pagination works: retrieved {len(scans)} scan (limit=1)")

        except Exception as e:
            print(f"✗ History operations failed: {e}")
            import traceback
            traceback.print_exc()
            return

    # Step 5: Test Upsert (smart insert/update)
    print("\n[5/5] Testing upsert operations...")
    async with AsyncSessionLocal() as db:
        try:
            # Upsert existing scan (should update)
            scan = await scan_service.upsert_scan(
                db=db,
                project_id=100,
                mr_iid=42,
                mr_url="https://gitlab.com/project/repo/-/merge_requests/42",
                title="Add new feature (updated)",
                last_commit_sha="final_sha_999",
                summary_markdown="# Final Summary\n\nFinal version."
            )
            assert scan.last_commit_sha == "final_sha_999"
            assert scan.title == "Add new feature (updated)"
            print(f"✓ Upsert updated existing scan")

            # Upsert new scan (should create)
            scan = await scan_service.upsert_scan(
                db=db,
                project_id=300,
                mr_iid=111,
                mr_url="https://gitlab.com/project/repo/-/merge_requests/111",
                title="New MR via upsert",
                last_commit_sha="upsert_sha_123",
                summary_markdown="# Upsert Summary\n\nCreated via upsert."
            )
            assert scan.project_id == 300
            print(f"✓ Upsert created new scan")

        except Exception as e:
            print(f"✗ Upsert operations failed: {e}")
            import traceback
            traceback.print_exc()
            return

    # Success!
    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nDatabase is ready for use.")
    print("Test database file: ./delta.db")
    print("\nYou can inspect it with: sqlite3 delta.db")


if __name__ == "__main__":
    asyncio.run(test_database())
