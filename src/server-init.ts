import dotenv from 'dotenv';
import path from 'path';

// Initialize environment before any other imports
const envPath = path.resolve(process.cwd(), '.env');
console.log('[Server Init] Current working directory:', process.cwd());
console.log('[Server Init] Loading environment variables from:', envPath);

const result = dotenv.config({
  path: envPath
});

if (result.error) {
  console.error('[Server Init] Error loading .env file:', result.error);
  process.exit(1);
}

// Log all VITE_ environment variables (masked)
const viteEnvVars = Object.keys(process.env)
  .filter(key => key.startsWith('VITE_'))
  .reduce((acc, key) => {
    const value = process.env[key];
    acc[key] = value ? (key.includes('KEY') ? '****' + value.slice(-4) : 'present') : 'missing';
    return acc;
  }, {} as Record<string, string>);

console.log('[Server Init] Loaded environment variables:', viteEnvVars);

// Export for type checking
export {};
