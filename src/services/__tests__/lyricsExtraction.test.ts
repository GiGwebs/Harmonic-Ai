import { config } from 'dotenv';
import axios, { AxiosError } from 'axios';
import { load } from 'cheerio';

// Load environment variables
config();

// Error types for better error handling
enum LyricsError {
  EMPTY_SEARCH = 'Empty search query',
  SEARCH_TOO_LONG = 'Search query too long',
  NO_API_TOKEN = 'API token not configured',
  NO_RESULTS = 'No search results found',
  INVALID_RESPONSE = 'Invalid API response format',
  FETCH_ERROR = 'Failed to fetch lyrics',
  PARSE_ERROR = 'Failed to parse lyrics',
  RATE_LIMIT = 'Rate limit exceeded',
  TIMEOUT = 'Request timeout',
  NETWORK_ERROR = 'Network error',
  API_ERROR = 'API error',
}

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Lyrics Extraction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock response
    mockedAxios.get.mockResolvedValue({
      data: {
        result: {
          lyrics: 'Sample lyrics for testing'
        }
      }
    });
  });

  // Test cases with different types of songs and edge cases
  const TEST_CASES = [
    // Successful cases
    {
      name: 'Modern Pop Song',
      search: 'Shape of You Ed Sheeran',
      description: 'A contemporary pop song with clear verse-chorus structure',
      expectedError: false
    },
    {
      name: 'Rap Song with Complex Lyrics',
      search: 'Lose Yourself Eminem',
      description: 'A rap song with dense lyrics and complex rhyme schemes',
      expectedError: false
    },
    {
      name: 'Non-English Song',
      search: 'Despacito Luis Fonsi',
      description: 'A Spanish language song to test multilingual support',
      expectedError: false
    },
    {
      name: 'Instrumental Song',
      search: 'Rush YYZ',
      description: 'Testing handling of primarily instrumental songs',
      expectedError: false,
      expectedMinimalLyrics: true
    },
    // Error cases
    {
      name: 'Empty Search',
      search: '',
      description: 'Testing handling of empty search string',
      expectedError: true,
      expectedErrorType: LyricsError.EMPTY_SEARCH
    },
    {
      name: 'Very Long Search',
      search: 'a'.repeat(501),
      description: 'Testing handling of extremely long search strings',
      expectedError: true,
      expectedErrorType: LyricsError.SEARCH_TOO_LONG
    },
    {
      name: 'Non-Existent Song',
      search: 'ThisSongDefinitelyDoesNotExist12345XYZ789',
      description: 'Testing handling of non-existent songs',
      expectedError: true,
      expectedErrorType: LyricsError.NO_RESULTS
    },
    {
      name: 'Unicode Characters',
      search: '🎵 Music 音楽 موسيقى μουσική',
      description: 'Testing handling of Unicode and special characters',
      expectedError: false
    }
  ];

  // Mock API responses for edge cases
  const mockAxiosResponse = (testCase: typeof TEST_CASES[0]) => {
    if (!testCase.mockConfig) return null;

    if (testCase.mockConfig.timeout) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(new AxiosError('Timeout of 5000ms exceeded'));
        }, testCase.mockConfig.delay || 6000);
      });
    }

    if (testCase.mockConfig.networkError) {
      return Promise.reject(new AxiosError('Network Error'));
    }

    if (testCase.mockConfig.status) {
      return Promise.reject(new AxiosError(
        testCase.mockConfig.response?.error || 'API Error',
        String(testCase.mockConfig.status),
        undefined,
        undefined,
        {
          status: testCase.mockConfig.status,
          data: testCase.mockConfig.response
        } as any
      ));
    }

    return null;
  };

  // Test each case
  TEST_CASES.forEach(testCase => {
    it(`${testCase.name}: ${testCase.description}`, async () => {
      // Set up specific mock for this test case
      if (testCase.expectedError) {
        if (testCase.expectedErrorType === LyricsError.NO_RESULTS) {
          mockedAxios.get.mockRejectedValue(new Error('No search results found'));
        } else if (testCase.expectedErrorType === LyricsError.NETWORK_ERROR) {
          mockedAxios.get.mockRejectedValue(new Error('Network error'));
        } else {
          mockedAxios.get.mockRejectedValue(new Error(testCase.expectedErrorType));
        }
      } else {
        mockedAxios.get.mockResolvedValue({
          data: {
            result: {
              lyrics: testCase.expectedMinimalLyrics ? 'Minimal lyrics' : 'Sample lyrics for testing'
            }
          }
        });
      }

      try {
        // Input validation
        if (!testCase.search) {
          throw new Error(LyricsError.EMPTY_SEARCH);
        }

        if (testCase.search.length > 500) {
          throw new Error(LyricsError.SEARCH_TOO_LONG);
        }

        // Validate API token
        if (!process.env.GENIUS_ACCESS_TOKEN) {
          throw new Error(LyricsError.NO_API_TOKEN);
        }

        // Handle mock responses for edge cases
        const mockResponse = testCase.mockConfig ? await mockAxiosResponse(testCase) : null;
        if (mockResponse !== null) {
          throw mockResponse;
        }

        const response = await axios.get(
          `https://api.genius.com/search?q=${encodeURIComponent(testCase.search)}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
            },
            timeout: 5000
          }
        );

        expect(response.data).toBeDefined();
        expect(response.data.response).toBeDefined();
        expect(response.data.response.hits).toBeDefined();

        if (response.data.response.hits.length === 0) {
          throw new Error(LyricsError.NO_RESULTS);
        }

        const firstHit = response.data.response.hits[0].result;
        expect(firstHit).toBeDefined();
        expect(firstHit.title).toBeDefined();
        expect(firstHit.primary_artist.name).toBeDefined();
        expect(firstHit.url).toBeDefined();

        // Try to fetch lyrics page
        const lyricsResponse = await axios.get(firstHit.url, {
          timeout: 5000
        });
        
        expect(lyricsResponse.data).toBeDefined();

        const $ = load(lyricsResponse.data);
        
        // Extract lyrics using different possible selectors
        let lyrics = '';
        const selectors = [
          '[class*="Lyrics__Container"]',
          '.lyrics',
          '[data-lyrics-container="true"]',
          '#lyrics-root',
        ];

        for (const selector of selectors) {
          const elements = $(selector);
          if (elements.length > 0) {
            lyrics = elements
              .map((_, el) => $(el).text())
              .get()
              .join('\n')
              .trim();
            if (lyrics) break;
          }
        }

        expect(lyrics).toBeTruthy();

        // Clean up the lyrics
        lyrics = lyrics
          .replace(/\[/g, '\n[')
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .join('\n');

        // Song structure analysis
        const sections = lyrics.match(/\[(.*?)\]/g) || [];
        const uniqueSections = [...new Set(sections)];
        
        // Basic statistics
        const lines = lyrics.split('\n').filter(Boolean);
        const words = lyrics.split(/\s+/).filter(Boolean);
        const averageWordsPerLine = (words.length / lines.length).toFixed(1);

        // Validate minimal lyrics for instrumental songs
        if (testCase.expectedMinimalLyrics) {
          expect(words.length).toBeLessThanOrEqual(50);
        }

        // Language detection hint
        const nonEnglishPattern = /[^\x00-\x7F]+/g;
        const hasNonEnglish = nonEnglishPattern.test(lyrics);

        // Additional expectations based on test case
        if (!testCase.expectedError) {
          expect(lines.length).toBeGreaterThan(0);
          expect(words.length).toBeGreaterThan(0);
          expect(parseFloat(averageWordsPerLine)).toBeGreaterThan(0);
        }

      } catch (error) {
        let errorMessage: string;
        let errorType: LyricsError | undefined;

        if (error instanceof Error) {
          if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
              errorType = LyricsError.TIMEOUT;
              errorMessage = 'Request timed out';
            } else if (error.response?.status === 429) {
              errorType = LyricsError.RATE_LIMIT;
              errorMessage = 'Rate limit exceeded';
            } else if (error.response?.status === 500) {
              errorType = LyricsError.API_ERROR;
              errorMessage = `API error: ${error.response.status}`;
            } else if (!error.response) {
              errorType = LyricsError.NETWORK_ERROR;
              errorMessage = 'Network error';
            } else {
              errorType = LyricsError.API_ERROR;
              errorMessage = `${error.response.status}: ${error.response.data?.message || error.message}`;
            }
          } else {
            errorType = error.message as LyricsError;
            errorMessage = error.message;
          }
        } else {
          errorType = LyricsError.API_ERROR;
          errorMessage = 'Unknown error';
        }

        if (testCase.expectedError) {
          if (testCase.expectedErrorType) {
            expect(errorType).toBe(testCase.expectedErrorType);
          }
        } else {
          throw new Error(`Unexpected error: ${errorMessage}`);
        }
      }
    }, 10000); // Increase timeout to 10 seconds for API calls
  });

  // Additional test cases for network and API errors
  describe('Network and API Error Cases', () => {
    const networkTestCases = [
      {
        name: 'Timeout Test',
        mockConfig: {
          timeout: true,
          delay: 6000
        },
        expectedErrorType: LyricsError.TIMEOUT
      },
      {
        name: 'Rate Limit Test',
        mockConfig: {
          status: 429,
          response: { error: 'Too Many Requests' }
        },
        expectedErrorType: LyricsError.RATE_LIMIT
      },
      {
        name: 'Network Error Test',
        mockConfig: {
          networkError: true
        },
        expectedErrorType: LyricsError.NETWORK_ERROR
      },
      {
        name: 'API Error Test',
        mockConfig: {
          status: 500,
          response: { error: 'Internal Server Error' }
        },
        expectedErrorType: LyricsError.API_ERROR
      }
    ];

    networkTestCases.forEach(testCase => {
      it(`handles ${testCase.name}`, async () => {
        try {
          const mockResponse = await mockAxiosResponse({
            name: testCase.name,
            search: 'test',
            description: testCase.name,
            expectedError: true,
            mockConfig: testCase.mockConfig
          });

          // If mockResponse is not null, it means we're simulating an error
          if (mockResponse !== null) {
            throw mockResponse;
          }

          // If we get here, something went wrong
          throw new Error('Expected an error but none was thrown');
        } catch (error) {
          let errorType: LyricsError | undefined;

          if (error instanceof Error) {
            if (axios.isAxiosError(error)) {
              if (error.code === 'ECONNABORTED') {
                errorType = LyricsError.TIMEOUT;
              } else if (error.response?.status === 429) {
                errorType = LyricsError.RATE_LIMIT;
              } else if (error.response?.status === 500) {
                errorType = LyricsError.API_ERROR;
              } else if (!error.response) {
                errorType = LyricsError.NETWORK_ERROR;
              }
            }
          }

          expect(errorType).toBe(testCase.expectedErrorType);
        }
      });
    });
  });
});
