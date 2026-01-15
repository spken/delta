/**
 * History page - View past MR scans with search and pagination.
 * Displays all previously analyzed merge requests.
 */
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TabNav from '@/components/TabNav';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Search, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <TabNav />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-zinc-900">Scan History</h1>
          <p className="text-zinc-500">
            View and re-analyze previously scanned merge requests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by MR title or URL..."
              className="pl-11"
            />
          </div>

          {/* Result count */}
          {!isLoading && (
            <p className="text-sm text-zinc-400 mt-2">
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && scans.length === 0 && (
          <Card className="p-12 text-center">
            <CardContent className="p-0">
              <div className="mb-4">
                <Clock className="w-16 h-16 mx-auto text-zinc-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900">No Scans Yet</h3>
              <p className="text-zinc-500">
                {searchQuery
                  ? 'No scans match your search query'
                  : 'Start by analyzing a merge request on the Analysis tab'}
              </p>
            </CardContent>
          </Card>
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
                  className="block"
                >
                  <Card className="p-0 hover:border-zinc-300 hover:shadow-md transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        {/* Left side: Content */}
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-lg font-semibold mb-2 text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                            {scan.title}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                            <span>MR !{scan.mr_iid}</span>
                            <span className="text-zinc-300">&#8226;</span>
                            <span>{formatDate(scan.scanned_at)}</span>
                          </div>

                          <p className="text-sm text-zinc-500 truncate">
                            {scan.mr_url}
                          </p>
                        </div>

                        {/* Right side: Status and Icon */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {scan.is_up_to_date ? (
                            <Badge
                              variant="outline"
                              className="border-green-600 text-green-600 bg-green-50"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Up to date
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-orange-600 text-orange-600 bg-orange-50"
                            >
                              <XCircle className="w-3 h-3" />
                              Outdated
                            </Badge>
                          )}

                          <ExternalLink className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleLoadPrevious}
                disabled={currentOffset === 0}
              >
                Previous
              </Button>

              <span className="text-sm text-zinc-400">
                Showing {currentOffset + 1} -{' '}
                {Math.min(currentOffset + currentLimit, totalCount)} of{' '}
                {totalCount}
              </span>

              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={!hasMore}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
