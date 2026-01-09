import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

const MovieCard = ({ movie }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}, ${dayNum} ${month} ${year}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const navigate = useNavigate();
  const { selectEvent } = useEventStore();

  const handleMovieClicked = () => {
    console.log("clicked ", movie);
    // Map movie fields to event structure for ViewEventPage
    selectEvent({
      _id: movie._id,
      eventId: movie._id,
      title: movie.title,
      coverImage: movie.posterUrl,
      city: `${movie.language.join(", ")} • ${movie.genre.join(", ")}`,
      eventCategory:
        movie.status === "now_showing" ? "Now Showing" : "Coming Soon",
      startDate: movie.releaseDate,
      endDate: movie.releaseDate,
      shortDescription: `${movie.rating} • ${formatDuration(movie.duration)}`,
      page: movie.pageId ? { pageId: movie.pageId } : null,
      // Additional movie-specific data
      movieData: {
        genre: movie.genre,
        duration: movie.duration,
        language: movie.language,
        rating: movie.rating,
        releaseDate: movie.releaseDate,
        cast: movie.cast,
        director: movie.director,
        trailerUrl: movie.trailerUrl,
        status: movie.status,
      },
    });
    navigate("/view-event");
  };

  const getStatusBadge = () => {
    const statusStyles = {
      now_showing: "bg-green-500",
      upcoming: "bg-blue-500",
      archived: "bg-gray-500",
    };

    const statusLabels = {
      now_showing: "Now Showing",
      upcoming: "Coming Soon",
      archived: "Archived",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold text-white rounded ${
          statusStyles[movie.status] || statusStyles.upcoming
        }`}
      >
        {statusLabels[movie.status] || movie.status}
      </span>
    );
  };

  return (
    <div
      className="min-w-[260px] w-[260px] cursor-pointer group"
      onClick={handleMovieClicked}
    >
      {/* Poster Container with Rating Overlay */}
      <div className="relative h-[380px] rounded-xl overflow-hidden shadow-lg">
        <img
          src={movie.posterUrl || "/placeholder-movie.jpg"}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Rating Badge - Top Right */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          <p className="text-white text-sm font-bold">{movie.rating}</p>
        </div>

        {/* Status Badge - Top Left */}
        <div className="absolute top-3 left-3">{getStatusBadge()}</div>

        {/* Gradient Overlay with Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(movie.duration)}</span>
            <span className="mx-1">•</span>
            <span>{movie.language.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-xl leading-tight group-hover:text-[#6d27da] transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-600">
            {formatDate(movie.releaseDate)}
          </p>
        </div>
        <p className="text-sm text-gray-700 mt-1 line-clamp-1">
          {movie.genre.join(" • ")}
        </p>
        {movie.director && (
          <p className="text-xs text-gray-500 mt-1">Dir: {movie.director}</p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
