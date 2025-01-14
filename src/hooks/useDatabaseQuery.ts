import { useState, useEffect, useCallback, useRef } from 'react';
import type { DatabaseOptions } from '../lib/db/types';

interface UseDatabaseQueryProps<T> {
  queryFn: (options?: DatabaseOptions) => Promise<T[]>;
  options?: DatabaseOptions;
  enabled?: boolean;
  timeout?: number;
}

export function useDatabaseQuery<T>({
  queryFn,
  options,
  enabled = true,
  timeout = 15000
}: UseDatabaseQueryProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [retryCount, setRetryCount] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled || !mountedRef.current) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    if (!isRetry) {
      setIsLoading(true);
      setError(undefined);
    }
    
    try {
      console.log('Fetching data with options:', options);
      const result = await queryFn(options);
      
      if (mountedRef.current) {
        console.log('Query successful, data count:', result.length);
        setData(result);
        setError(undefined);
        setRetryCount(0);
      }
    } catch (err: any) {
      console.error('Query error:', err);
      if (!mountedRef.current) return;

      const errorMessage = err?.message || 'An error occurred';
      setError(errorMessage);
      
      // Retry logic for specific errors
      if (err?.code === 'failed-precondition' && retryCount < 3) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        console.log(`Retrying query (${nextRetry}/3)...`);
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, nextRetry), 5000);
        timeoutRef.current = setTimeout(() => {
          fetchData(true);
        }, delay);
        return;
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, options, queryFn, retryCount]);

  useEffect(() => {
    console.log('useDatabaseQuery effect running with options:', options);
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error, 
    retry,
    retryCount 
  };
}