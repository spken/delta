/**
 * Analysis page - Main MR analysis interface.
 * Will be implemented in Milestone 8.
 */
export default function AnalysisPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Analyze Merge Request</h1>
      <div className="max-w-2xl">
        <input
          type="text"
          placeholder="Paste GitLab MR URL here..."
          className="w-full px-4 py-3 border rounded-lg mb-4"
          disabled
        />
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled
        >
          Summarize Changes
        </button>
      </div>
      <p className="text-gray-500 mt-4 text-sm">
        This feature will be implemented in Milestone 8
      </p>
    </div>
  );
}
