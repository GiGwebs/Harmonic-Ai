import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LyricsForm } from '../components/lyrics/LyricsForm';
import { LyricsPreview } from '../components/lyrics/LyricsPreview';
import { TitleGenerator } from '../components/lyrics/TitleGenerator';
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
    if (!title || !generatedLyrics) {
      toast.error('Please generate lyrics before saving');
      return;
    }

    try {
      const id = await saveLyrics({
        title,
        content: generatedLyrics,
        options,
        type: 'generated',
        createdAt: new Date().toISOString()
      });
      
      // Show success message
      toast.success('Lyrics saved successfully!');
      
      // Navigate to database page with hash
      navigate('/database', { 
        state: { savedLyricsId: id },
        replace: true,
        hash: 'generated' // This will be properly handled by React Router
      });
    } catch (error) {
      console.error('Failed to save lyrics:', error);
      toast.error('Failed to save lyrics. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Generate Lyrics
        </h1>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <TitleGenerator
                value={title}
                onChange={setTitle}
                options={options}
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

            <LyricsPreview
              lyrics={generatedLyrics}
              onSave={handleSave}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}