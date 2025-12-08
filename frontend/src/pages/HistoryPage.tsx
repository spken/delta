/**
 * History page - View past MR scans with search and pagination.
 * Displays all previously analyzed merge requests.
 */
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Search, Loader2, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { ScanHistoryItem } from '@/types/api';

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentLimit] = useState(20);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [searchQuery, currentOffset]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getHistory({
        search: searchQuery || undefined,
        limit: currentLimit,
        offset: currentOffset,
      });

      setScans(response.scans);
      setTotalCount(response.total);
      setHasMore(currentOffset + currentLimit < response.total);
    } catch (error: any) {
      toast.error('Failed to load history');
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentOffset(0); // Reset to first page on new search
  };

  const handleLoadMore = () => {
    setCurrentOffset((prev) => prev + currentLimit);
  };

  const handleLoadPrevious = () => {
    setCurrentOffset((prev) => Math.max(0, prev - currentLimit));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Scan History</h1>
          <p className="text-gray-400">
            View and re-analyze previously scanned merge requests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by MR title or URL..."
              className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Result count */}
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-2">
              {totalCount === 0
                ? 'No scans found'
                : totalCount === 1
                ? '1 scan found'
                : `${totalCount} scans found`}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && scans.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-400">Loading scan history...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && scans.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <div className="mb-4">
              <Clock className="w-16 h-16 mx-auto text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Scans Yet</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery
                ? 'No scans match your search query'
                : 'Start by analyzing a merge request on the Analysis tab'}
            </p>
          </div>
        )}

        {/* Scan Cards */}
        {!isLoading && scans.length > 0 && (
          <>
            <div className="space-y-4">
              {scans.map((scan) => (
                <a
                  key={scan.id}
                  href={scan.mr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side: Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors truncate">
                        {scan.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span>MR !{scan.mr_iid}</span>
                        <span className="text-gray-600">•</span>
                        <span>{formatDate(scan.scanned_at)}</span>
                      </div>

                      <p className="text-sm text-gray-500 truncate">
                        {scan.mr_url}
                      </p>
                    </div>

                    {/* Right side: Status and Icon */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {scan.is_up_to_date ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">
                              Up to date
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-orange-400">
                              Outdated
                            </span>
                          </>
                        )}
                      </div>

                      <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handleLoadPrevious}
                disabled={currentOffset === 0}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Showing {currentOffset + 1} -{' '}
                {Math.min(currentOffset + currentLimit, totalCount)} of{' '}
                {totalCount}
              </span>

              <button
                onClick={handleLoadMore}
                disabled={!hasMore}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
