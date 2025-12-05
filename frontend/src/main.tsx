import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AnalysisProvider } from './context/analysis-context';
import { ThemeProvider } from './components/shared/ThemeProvider';
import { Toaster } from './components/ui/sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="gitlab-mr-theme">
      <AnalysisProvider>
        <App />
        <Toaster richColors position="top-right" />
      </AnalysisProvider>
    </ThemeProvider>
  </StrictMode>
);
