'use client';

import { useState, useCallback, useRef } from 'react';

export function useIconSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbort = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    if (searchAbort.current) searchAbort.current.abort();
    searchAbort.current = new AbortController();
    const gen = searchAbort.current;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(searchQuery)}&limit=20`,
        { signal: gen.signal }
      );
      const data = await res.json();
      if (gen === searchAbort.current) setSearchResults(data.icons || []);
    } catch (e) {
      if ((e as Error).name !== 'AbortError' && gen === searchAbort.current) setSearchResults([]);
    } finally {
      if (gen === searchAbort.current) setIsSearching(false);
    }
  }, [searchQuery]);

  const onSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchQuery(val);
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      if (val.trim()) {
        searchDebounce.current = setTimeout(() => handleSearch(), 500);
      } else {
        setSearchResults([]);
      }
    },
    [handleSearch]
  );

  return {
    searchQuery,
    searchResults,
    isSearching,
    onSearchInput
  };
}
