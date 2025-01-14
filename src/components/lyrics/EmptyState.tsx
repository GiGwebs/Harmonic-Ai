import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'songs' | 'lyrics';
}

export function EmptyState({ type }: EmptyStateProps) {
  const config = {
    songs: {
      title: 'No analyzed songs yet',
      description: 'Start analyzing music to see results here!',
      action: {
        text: 'Analyze Music',
        link: '/analyze'
      }
    },
    lyrics: {
      title: 'No lyrics saved yet',
      description: 'Generate some lyrics to view them here!',
      action: {
        text: 'Generate Lyrics',
        link: '/generate'
      }
    }
  };

  const { title, description, action } = config[type];

  return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link
        to={action.link}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        {action.text}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
}