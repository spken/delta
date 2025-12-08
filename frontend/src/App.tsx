/**
 * Main App component with React Router setup.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from '@/pages/LoginPage';
import AnalysisPage from '@/pages/AnalysisPage';
import HistoryPage from '@/pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Toaster theme="dark" position="top-right" />

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
