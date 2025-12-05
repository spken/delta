import { useEffect, useState } from 'react';

export function SuccessAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-in zoom-in duration-500 animate-out zoom-out fade-out delay-2000">
        <div className="bg-success/10 backdrop-blur-sm border border-success/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg
                className="w-12 h-12 text-success animate-in zoom-in duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="absolute inset-0 bg-success/30 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-bold text-success">Analysis Complete!</p>
              <p className="text-sm text-success/80">Your results are ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
