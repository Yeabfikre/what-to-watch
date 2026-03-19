import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { TmdbMovie, PaginatedResult } from "@/lib/tmdb";

const MAX_PAGES = 5;

interface UseInfiniteRowOptions {
  queryKey: unknown[];
  fetchFn: (page: number) => Promise<PaginatedResult>;
  enabled?: boolean;
}

export function useInfiniteRow({ queryKey, fetchFn, enabled = true }: UseInfiniteRowOptions) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= MAX_PAGES) return undefined;
      if (lastPage.page >= lastPage.total_pages) return undefined;
      return lastPage.page + 1;
    },
    enabled,
  });

  const movies = useMemo(() => {
    if (!data) return [];
    const seen = new Set<number>();
    const flat: TmdbMovie[] = [];
    for (const page of data.pages) {
      for (const movie of page.results) {
        if (!seen.has(movie.id)) {
          seen.add(movie.id);
          flat.push(movie);
        }
      }
    }
    return flat;
  }, [data]);

  return { movies, fetchNextPage, hasNextPage: !!hasNextPage, isFetchingNextPage };
}
