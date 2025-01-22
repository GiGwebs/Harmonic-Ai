import { SongAnalysis } from '../types';
import type { GenerateOptions, GeneratedLyrics } from '../types/lyrics';

interface APIError extends Error {
  status?: number;
  retryAfter?: number;
}

const RETRY_STATUS_CODES = [429, 503];
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error: APIError = new Error('API request failed');
    error.status = response.status;
    
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
      error.retryAfter = retryAfter;
    }
    
    throw error;
  }
  
  return response.json();
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  delay = BASE_DELAY
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (RETRY_STATUS_CODES.includes(response.status) && retries > 0) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '1', 10);
      await wait(retryAfter * 1000 || delay);
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      await wait(delay);
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function analyzeSong(lyrics: string): Promise<SongAnalysis> {
  const response = await fetchWithRetry(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lyrics }),
  });
  
  return handleResponse(response);
}

export async function generateLyrics(
  title: string,
  options: GenerateOptions
): Promise<{ lyrics: string }> {
  const response = await fetchWithRetry(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, options }),
  });
  
  return handleResponse(response);
}
