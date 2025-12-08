/**
 * History page - View past MR scans.
 * Will be implemented in Milestone 9.
 */
import Navbar from '@/components/Navbar';

export default function HistoryPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Scan History</h1>
        <div className="text-gray-500">
          <p>Your previously scanned merge requests will appear here.</p>
          <p className="text-sm mt-2">
            This feature will be implemented in Milestone 9
          </p>
        </div>
      </div>
    </>
  );
}
