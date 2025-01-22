import type { Request, Response } from 'express';
import type { GenerateOptions } from '../types/lyrics';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client with proper error handling
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.');
  }

  console.log('[API] Initializing OpenAI client for title generation');
  return new OpenAI({ apiKey });
}

const openai = initializeOpenAI();

interface TitleRequest {
  options: GenerateOptions;
}

export async function titleHandler(req: Request, res: Response) {
  try {
    console.log('[API] Title generation request received:', JSON.stringify(req.body, null, 2));
    const { options } = req.body as TitleRequest;

    // Validate required fields
    if (!options.genre || !options.mood || !options.theme) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Genre, mood, and theme are required'
      });
    }

    // Create a detailed prompt for OpenAI
    const prompt = `Generate a creative song title for a ${options.genre} song with the following specifications:
      Mood: ${options.mood}
      Theme: ${options.theme}
      ${options.subGenre ? `Sub-genre: ${options.subGenre}` : ''}
      ${options.featuredGenre ? `Featured Artist Genre: ${options.featuredGenre}` : ''}

      Please follow these guidelines:
      1. Make it catchy and memorable
      2. Keep it relevant to the ${options.genre} genre
      3. Reflect the ${options.mood} mood
      4. Incorporate the theme of ${options.theme}
      5. Keep it under 5 words
      6. Make it commercially viable
      
      Return only the title, nothing else.`;

    console.log('[API] Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.9,
      max_tokens: 50
    });

    const title = response.choices[0].message?.content?.trim();
    if (!title) throw new Error('Failed to generate title');

    console.log('[API] Successfully generated title:', title);
    res.json({ title });
  } catch (error) {
    console.error('[API] Error in title handler:', error);
    
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
      message: error instanceof Error ? error.message : 'Failed to generate title',
      details: 'An unexpected error occurred while processing your request.'
    });
  }
}
