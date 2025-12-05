/**
 * API configuration - Easy switch between mock and real implementations
 */

import { MockMRAnalysisService } from '@/services/api/mock-api';
import { RealMRAnalysisService } from '@/services/api/real-api';

// Use mock API by default, can be toggled via environment variable
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const mrAnalysisService = USE_MOCK_API
  ? new MockMRAnalysisService()
  : new RealMRAnalysisService();

// Export for debugging/testing
export { USE_MOCK_API };
