import React from 'react';
import { Wand2, Brain, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-purple-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Create Chart-Topping Music with AI
          </h1>
          <p className="text-xl mb-12 text-gray-300">
            Analyze songs, generate lyrics, and craft viral hits across genres with our intelligent music assistant
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Smart Analysis"
              description="Extract detailed insights from any song"
            />
            <FeatureCard
              icon={<Wand2 className="h-8 w-8" />}
              title="AI Lyrics"
              description="Generate genre-specific viral-ready lyrics"
            />
            <FeatureCard
              icon={<Database className="h-8 w-8" />}
              title="Knowledge Base"
              description="Access top songs data and patterns"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <Link
              to="/analyze"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Analyzing
            </Link>
            <Link
              to="/generate"
              className="bg-transparent border-2 border-purple-600 hover:bg-purple-600/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Generate Lyrics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-purple-800/30 p-6 rounded-xl backdrop-blur-sm">
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}