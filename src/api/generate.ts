import type { Request, Response } from 'express';
import type { GenerateOptions } from '../types/lyrics';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { db } from '../lib/firebase.server.js';

// Load environment variables
dotenv.config();

// Initialize OpenAI client with proper error handling
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.');
  }

  console.log('[API] Initializing OpenAI client');
  return new OpenAI({ apiKey });
}

const openai = initializeOpenAI();

interface GenerateRequest {
  title: string;
  options: GenerateOptions;
}

export async function generateHandler(req: Request, res: Response) {
  try {
    console.log('[API] Generate request received:', JSON.stringify(req.body, null, 2));
    const { title, options } = req.body as GenerateRequest;

    // Validate required fields
    if (!title || !options.genre || !options.mood || !options.theme) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, genre, mood, and theme are required'
      });
    }

    // Create a detailed prompt for OpenAI
    const prompt = `Generate lyrics for a song with the following specifications:
      Title: "${title}"
      Genre: ${options.genre}${options.subGenre ? ` (${options.subGenre})` : ''}
      Mood: ${options.mood}
      Theme: ${options.theme}
      Structure: ${options.structure}
      ${options.featuredGenre ? `Featured Artist Genre: ${options.featuredGenre}` : ''}

      Please follow these guidelines:
      1. Create lyrics that authentically represent the ${options.genre} genre
      2. Maintain a ${options.mood} mood throughout
      3. Explore the theme of ${options.theme}
      4. Follow a ${options.structure} song structure
      5. Include appropriate genre-specific elements and slang
      6. Create memorable hooks and catchy phrases
      
      Format the output with clear section labels (Verse 1, Chorus, etc.)`;

    console.log('[API] Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.8,
      max_tokens: 1000
    });

    const lyrics = response.choices[0].message?.content;
    if (!lyrics) throw new Error('Failed to generate lyrics');

    console.log('[API] Successfully generated lyrics');
    res.json({ lyrics });
  } catch (error) {
    console.error('[API] Error in generate handler:', error);
    
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error('[API] OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      });
      
      if (error.status === 401) {
        return res.status(401).json({
          error: 'Authentication Error',
          message: 'Invalid API key. Please check your server configuration.',
          details: 'The provided OpenAI API key is invalid or has expired.'
        });
      }
      
      return res.status(error.status || 500).json({
        error: 'OpenAI API Error',
        message: error.message,
        details: `Error type: ${error.type}, code: ${error.code}`
      });
    }
    
    // Handle other errors
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to generate lyrics',
      details: 'An unexpected error occurred while processing your request.'
    });
  }
}

export function generateStructuredLyrics(title: string, options: GenerateOptions): string {
  const { genre, mood, theme, structure } = options;
  const sections = structure.split('-');
  
  const lyrics = sections.map((section, index) => {
    switch (section.toLowerCase()) {
      case 'verse':
        return generateVerse(index + 1, { genre, mood, theme });
      case 'chorus':
        return generateChorus({ genre, mood, theme });
      case 'bridge':
        return generateBridge({ genre, mood, theme });
      default:
        return '';
    }
  });

  return lyrics.filter(Boolean).join('\n\n');
}

export function generateVerse(number: number, options: Pick<GenerateOptions, 'genre' | 'mood' | 'theme'>): string {
  const { genre, mood, theme } = options;
  return `[Verse ${number}]
Through the ${mood} atmosphere we stride
${theme} echoes in our ${genre} pride
Every step a story to tell
In this journey we know so well`;
}

export function generateChorus(options: Pick<GenerateOptions, 'genre' | 'mood' | 'theme'>): string {
  const { mood, theme } = options;
  return `[Chorus]
This is where the ${mood} takes flight
${theme} burning oh so bright
Together we'll find our way
In this moment we'll stay`;
}

export function generateBridge(options: Pick<GenerateOptions, 'genre' | 'mood' | 'theme'>): string {
  const { mood, theme } = options;
  return `[Bridge]
Breaking through the ${mood} haze
${theme} guides us through this maze
Time stands still, yet we move on
Until this feeling is gone`;
}
