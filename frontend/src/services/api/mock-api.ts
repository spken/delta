/**
 * Mock API implementation with realistic timing and progress simulation
 */

import type { MRAnalysisService } from './types';
import type { AnalysisProgress } from '@/types/api';
import type { AnalysisResult, MRDetails, DiffSummary } from '@/types/mr';

interface Stage {
  stage: AnalysisProgress['stage'];
  duration: number;
  message: string;
}

const STAGES: Stage[] = [
  { stage: 'fetching', duration: 8000, message: 'Fetching MR data from GitLab...' },
  { stage: 'parsing', duration: 12000, message: 'Parsing diff files...' },
  { stage: 'analyzing', duration: 15000, message: 'Analyzing code changes...' },
  { stage: 'summarizing', duration: 5000, message: 'Generating natural language summary...' },
];

// Mock data sets
const MOCK_AUTHORS = [
  { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Jordan Kim', avatar: 'https://i.pravatar.cc/150?img=8' },
  { name: 'Taylor Swift', avatar: 'https://i.pravatar.cc/150?img=23' },
];

const MOCK_COLLABORATORS = [
  { name: 'Morgan Lee', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Casey Johnson', avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Riley Parker', avatar: 'https://i.pravatar.cc/150?img=16' },
  { name: 'Quinn Davis', avatar: 'https://i.pravatar.cc/150?img=29' },
];

const MOCK_MR_TITLES = [
  'Refactor authentication middleware for better security',
  'Add support for real-time notifications',
  'Optimize database queries in user service',
  'Implement dark mode theme switching',
  'Fix memory leak in WebSocket connection handler',
  'Add comprehensive error handling to API routes',
];

const MOCK_SUMMARIES = [
  {
    overview: `## Overview

This merge request introduces a comprehensive refactoring of the authentication middleware to enhance security and improve performance. The implementation focuses on three main areas: JWT token rotation, rate limiting, and session management.

## Key Changes

### Security Improvements
- Implemented JWT token rotation to prevent token replay attacks
- Added sliding window rate limiting to protect against brute force attempts
- Enhanced session validation with Redis-backed storage for horizontal scaling
- Improved error handling to prevent information leakage

### Performance Optimizations
- Reduced authentication overhead by 35% through optimized token validation
- Implemented connection pooling for Redis session store
- Added request caching for frequently accessed user permissions

### Testing & Documentation
- Increased test coverage from 65% to 92% for authentication flows
- Added comprehensive documentation for new security features
- Created migration guide for existing implementations

## Impact

This change affects all authenticated endpoints and improves both security posture and performance. No breaking changes to the public API.`,
    keyChanges: [
      { file: 'src/middleware/auth.ts', description: 'Refactored JWT verification with token rotation support' },
      { file: 'src/services/session.ts', description: 'Added Redis-based session store for improved scalability' },
      { file: 'src/utils/rate-limit.ts', description: 'Implemented sliding window rate limiting algorithm' },
      { file: 'tests/auth.test.ts', description: 'Added comprehensive test coverage for new auth flows' },
    ],
  },
  {
    overview: `## Overview

This MR implements a production-ready real-time notification system using WebSockets, enabling instant updates for user interactions across the platform.

## Architecture

### WebSocket Implementation
- Built on top of Socket.io for cross-browser compatibility
- Implements connection pooling with automatic load balancing
- Supports horizontal scaling with Redis pub/sub adapter
- Includes automatic reconnection with exponential backoff

### Message Queue System
- Offline message queuing ensures no notifications are lost
- Message deduplication prevents duplicate notifications
- Priority queue for time-sensitive notifications
- Persistent storage with automatic cleanup after 7 days

### Client Integration
- Custom React hook for easy WebSocket integration
- Automatic connection management and cleanup
- Type-safe event system with TypeScript
- Built-in error handling and retry logic

## Performance Metrics

- Average message delivery latency: <100ms
- Supports 10,000+ concurrent connections per instance
- 99.9% message delivery success rate
- Zero-downtime deployments with connection migration

## Testing

- Added integration tests for WebSocket lifecycle
- Load testing validated with 50,000 concurrent users
- Chaos engineering tests for connection failures`,
    keyChanges: [
      { file: 'src/services/websocket.ts', description: 'Implemented WebSocket server with connection pooling' },
      { file: 'src/components/NotificationBell.tsx', description: 'Created real-time notification UI component' },
      { file: 'src/hooks/useWebSocket.ts', description: 'Added custom hook for WebSocket connection management' },
      { file: 'src/utils/message-queue.ts', description: 'Implemented offline message queuing system' },
    ],
  },
  {
    overview: `## Overview

Major performance optimization initiative for the user service, achieving a 60% reduction in average response time through strategic database improvements.

## Database Optimizations

### Indexing Strategy
- Added composite indexes on frequently queried column combinations
- Implemented partial indexes for filtered queries
- Created covering indexes to eliminate table lookups
- Reduced index size by 40% through selective column indexing

### Query Optimization
- Eliminated all N+1 query patterns using DataLoader
- Implemented batch loading for related entities
- Refactored complex JOIN operations into more efficient queries
- Added query result caching with intelligent invalidation

### Caching Layer
- Implemented Redis-based caching with 5-minute TTL
- Added cache warming for frequently accessed data
- Implemented cache stampede prevention
- Created cache hit rate monitoring and alerting

## Performance Results

**Before:**
- Average response time: 250ms
- 95th percentile: 850ms
- Database CPU: 65%

**After:**
- Average response time: 100ms (-60%)
- 95th percentile: 280ms (-67%)
- Database CPU: 35% (-46%)

## Migration Plan

Changes are backward compatible. Cache warming runs during deployment. Zero downtime deployment validated in staging.`,
    keyChanges: [
      { file: 'src/services/user.ts', description: 'Refactored queries to use batched data loading' },
      { file: 'database/migrations/20250112_add_indexes.sql', description: 'Added composite indexes for frequent query patterns' },
      { file: 'src/cache/redis-client.ts', description: 'Implemented query result caching layer' },
      { file: 'src/utils/data-loader.ts', description: 'Created DataLoader pattern for batch operations' },
    ],
  },
];

export class MockMRAnalysisService implements MRAnalysisService {
  async analyzeAsync(
    url: string,
    onProgress: (progress: AnalysisProgress) => void
  ): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const totalDuration = STAGES.reduce((sum, stage) => sum + stage.duration, 0);
      let elapsedTime = 0;
      let currentStageIndex = 0;

      const updateProgress = () => {
        if (currentStageIndex >= STAGES.length) {
          // Analysis complete
          const result = this.generateMockResult(url);
          resolve(result);
          return;
        }

        const currentStage = STAGES[currentStageIndex];
        const stageDuration = currentStage.duration;
        const updateInterval = 100; // Update every 100ms
        let stageElapsed = 0;

        const stageInterval = setInterval(() => {
          stageElapsed += updateInterval;
          elapsedTime += updateInterval;

          const stageProgress = Math.min((stageElapsed / stageDuration) * 100, 100);
          const overallProgress = Math.min((elapsedTime / totalDuration) * 100, 100);
          const timeRemaining = Math.ceil((totalDuration - elapsedTime) / 1000);

          onProgress({
            stage: currentStage.stage,
            progress: Math.round(overallProgress),
            message: currentStage.message,
            estimatedTimeRemaining: timeRemaining,
          });

          if (stageElapsed >= stageDuration) {
            clearInterval(stageInterval);
            currentStageIndex++;
            updateProgress();
          }
        }, updateInterval);
      };

      // Start the progress simulation
      updateProgress();
    });
  }

  private generateMockResult(url: string): AnalysisResult {
    // Parse URL to extract MR number (or use hash for variety)
    const urlHash = this.hashCode(url);
    const mockIndex = Math.abs(urlHash) % 3;

    const author = MOCK_AUTHORS[Math.abs(urlHash) % MOCK_AUTHORS.length];
    const collaboratorCount = 2 + (Math.abs(urlHash) % 3);
    const collaborators = MOCK_COLLABORATORS.slice(0, collaboratorCount);
    const mockSummary = MOCK_SUMMARIES[mockIndex];

    const filesChanged = mockSummary.keyChanges.length + (Math.abs(urlHash) % 5);
    const additions = 150 + (Math.abs(urlHash) % 500);
    const deletions = 50 + (Math.abs(urlHash) % 200);

    const mrDetails: MRDetails = {
      url,
      title: MOCK_MR_TITLES[Math.abs(urlHash) % MOCK_MR_TITLES.length],
      description: 'This merge request implements important changes to improve the codebase.',
      author,
      collaborators,
      sourceBranch: `feature/update-${Math.abs(urlHash) % 1000}`,
      targetBranch: 'main',
      createdAt: new Date(Date.now() - (Math.abs(urlHash) % 10) * 24 * 60 * 60 * 1000).toISOString(),
    };

    const diffSummary: DiffSummary = {
      overview: mockSummary.overview,
      filesChanged,
      additions,
      deletions,
      keyChanges: mockSummary.keyChanges,
    };

    return {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mrDetails,
      diffSummary,
      analyzedAt: new Date().toISOString(),
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}
