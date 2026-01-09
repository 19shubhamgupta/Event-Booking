import React, { useEffect, useState } from "react";
import { useEventStore } from "../../store/useEventStore";
import MovieCard from "./MovieCard";

const MoviesSection = () => {
  const { movies, getMoviesByPage, isLoadingMovies } = useEventStore();
  const [page, setPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const moviesPerView = 5;

  useEffect(() => {
    getMoviesByPage(1);
  }, []);

  const handleNext = () => {
    const newStartIndex = startIndex + moviesPerView;

    // Check if we need to fetch more movies
    if (movies && newStartIndex + moviesPerView >= movies.length) {
      const nextPage = page + 1;
      setPage(nextPage);
      getMoviesByPage(nextPage);
    }

    if (movies && newStartIndex < movies.length) {
      setStartIndex(newStartIndex);
    }
  };

  const handlePrev = () => {
    const newStartIndex = startIndex - moviesPerView;
    if (newStartIndex >= 0) {
      setStartIndex(newStartIndex);
    }
  };

  const visibleMovies =
    movies?.slice(startIndex, startIndex + moviesPerView) || [];
  const canGoPrev = startIndex > 0;
  const canGoNext = movies && startIndex + moviesPerView < movies.length;

  return (
    <div className="flex justify-center item-center ">
      <div className="mb-8 ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Movies</h2>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          {canGoPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Movies Container */}
          <div className="flex gap-4 overflow-hidden">
            {visibleMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
            {isLoadingMovies && (
              <div className="min-w-[200px] h-[380px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6d27da]"></div>
              </div>
            )}
          </div>

          {/* Right Arrow */}
          {(canGoNext || isLoadingMovies) && (
            <button
              onClick={handleNext}
              disabled={isLoadingMovies}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {!movies && !isLoadingMovies && (
          <p className="text-gray-500 text-center">No movies found</p>
        )}
      </div>
    </div>
  );
};

export default MoviesSection;
