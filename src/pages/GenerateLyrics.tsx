import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LyricsForm } from '../components/lyrics/LyricsForm';
import { LyricsPreview } from '../components/lyrics/LyricsPreview';
import { TitleGenerator } from '../components/lyrics/TitleGenerator';
import { TrendingGenresBox } from '../components/trends/TrendingGenresBox';
import { YouTubeInsightsBox } from '../components/trends/YouTubeInsightsBox';
import { generateLyrics } from '../lib/lyrics/generate';
import { generateTitle } from '../lib/lyrics/titleGenerator';
import type { GenerateOptions } from '../types/lyrics';
import { saveLyrics } from '../lib/db/lyrics';
import { MUSIC_GENRES, SONG_STRUCTURES } from '../constants/genres';
import { toast } from 'react-hot-toast';

export function GenerateLyricsPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<GenerateOptions>({
    genre: 'afrobeats',
    subGenre: MUSIC_GENRES.afrobeats.subGenres[0],
    mood: 'upbeat',
    theme: 'love',
    structure: 'verse-chorus',
    featuredArtist: ''
  });
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const handleGenerate = async () => {
    if (!title) return;
    
    setIsGenerating(true);
    try {
      const result = await generateLyrics(title, options);
      setGeneratedLyrics(result.content);
    } catch (error) {
      console.error('Failed to generate lyrics:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTitle = async () => {
    setIsGeneratingTitle(true);
    try {
      const generatedTitle = await generateTitle(options);
      setTitle(generatedTitle);
    } catch (error) {
      console.error('Failed to generate title:', error);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLyrics || !title) return;
    
    try {
      await saveLyrics({
        title,
        content: generatedLyrics,
        ...options,
        createdAt: new Date()
      });
      toast.success('Lyrics saved successfully!');
      navigate('/database');
    } catch (error) {
      console.error('Failed to save lyrics:', error);
      toast.error('Failed to save lyrics');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Generate Lyrics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <TitleGenerator
              title={title}
              setTitle={setTitle}
              onGenerate={handleGenerateTitle}
              isGenerating={isGeneratingTitle}
            />
            <LyricsForm
              options={options}
              onOptionsChange={setOptions}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
          {generatedLyrics && (
            <LyricsPreview
              title={title}
              lyrics={generatedLyrics}
              onSave={handleSave}
              isGenerating={isGenerating}
            />
          )}
        </div>
        <div className="space-y-8">
          <TrendingGenresBox />
          <YouTubeInsightsBox />
        </div>
      </div>
    </div>
  );
}