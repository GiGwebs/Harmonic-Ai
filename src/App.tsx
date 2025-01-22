import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AnalyzePage } from './pages/AnalyzePage';
import { GenerateLyricsPage } from './pages/GenerateLyrics';
import SongDatabasePage from './pages/SongDatabasePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import VerifyAccessPage from './pages/debug/verify-access';

export default function App() {
  return (
    <ErrorBoundary>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/generate" element={<GenerateLyricsPage />} />
            <Route path="/database" element={<SongDatabasePage />} />
            <Route path="/debug/verify-access" element={<VerifyAccessPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}