/**
 * Login page - Entry point for authentication.
 * Will be implemented in Milestone 7.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">DELTA</h1>
        <p className="text-gray-400 mb-8">
          Diff Explanation & Linguistic Transformation Assistant
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Connect with GitLab
        </button>
      </div>
    </div>
  );
}
