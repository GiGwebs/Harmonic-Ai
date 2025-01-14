import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AnalyzePage } from './pages/AnalyzePage';
import { GenerateLyricsPage } from './pages/GenerateLyrics';
import { DatabasePage } from './pages/DatabasePage';
import { ErrorBoundary } from './components/ErrorBoundary';

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
            <Route path="/database" element={<DatabasePage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}