import React from 'react';
import { Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Music2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Harmonic AI</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/analyze" className="hover:text-purple-200 transition-colors">
              Analyze Music
            </Link>
            <Link to="/generate" className="hover:text-purple-200 transition-colors">
              Generate Lyrics
            </Link>
            <Link to="/database" className="hover:text-purple-200 transition-colors">
              Song Database
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}