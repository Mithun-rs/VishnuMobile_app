import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefreshOnFocus(fetchFn) {
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFn();
    }, [fetchFn])
  );

  // Manual pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFn();
    setRefreshing(false);
  }, [fetchFn]);

  return { refreshing, onRefresh };
}