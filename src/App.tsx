import React from 'react';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import Navigation from './components/Navigation';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailsPage from './pages/CandidateDetailsPage';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Navigate to="/jobs" replace />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/candidates/:candidateId" element={<CandidateDetailsPage />} />
                <Route path="/assessments/:jobId" element={<AssessmentBuilderPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;