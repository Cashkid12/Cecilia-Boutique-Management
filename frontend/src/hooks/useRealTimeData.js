import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for real-time data fetching with auto-refresh
 * Automatically refreshes data at specified intervals
 * Returns loading state, data, error, and manual refetch function
 */
export const useRealTimeData = (apiFunction, dependencies = [], refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      // Only show loading on initial fetch, not on refreshes
      if (!data) {
        setLoading(true);
      }
      setError(null);
      const response = await apiFunction();
      
      // Only update data if response is valid and not empty
      if (response && response.data) {
        setData(response.data);
      }
      // If response is empty/invalid, keep existing data
    } catch (err) {
      console.error('[useRealTimeData] Fetch error:', err);
      setError(err.message || 'Failed to fetch data');
      // Don't clear existing data on error - keep showing last known good data
    } finally {
      setLoading(false);
    }
  }, [apiFunction, data]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Custom hook for dashboard data with faster refresh rate
 * Refreshes every 15 seconds for real-time updates
 */
export const useDashboardData = (apiFunction) => {
  return useRealTimeData(apiFunction, [], 15000);
};

/**
 * Custom hook for sales data with medium refresh rate
 * Refreshes every 30 seconds
 */
export const useSalesData = (apiFunction, dependencies = []) => {
  return useRealTimeData(apiFunction, dependencies, 30000);
};

/**
 * Custom hook for inventory data with slower refresh rate
 * Refreshes every 60 seconds
 */
export const useInventoryData = (apiFunction) => {
  return useRealTimeData(apiFunction, [], 60000);
};

/**
 * Custom hook for one-time data fetch (no auto-refresh)
 */
export const useFetchOnce = (apiFunction, dependencies = []) => {
  return useRealTimeData(apiFunction, dependencies, 0);
};
