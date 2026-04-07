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
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

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
