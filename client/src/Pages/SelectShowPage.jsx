import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
} from "lucide-react";
import { useTheatreStore } from "../store/useTheatreStore";

const SelectShowPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { getShowsOfMovieByTheatre } = useTheatreStore();

  const [loading, setLoading] = useState(true);
  const [showsData, setShowsData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [movieDetails, setMovieDetails] = useState(null);

  // Generate date range (7 days from today)
  const generateDateRange = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateRange = generateDateRange();

  useEffect(() => {
    fetchShows();
  }, [movieId, selectedDate]);

  const fetchShows = async () => {
    try {
      setLoading(true);

      // Format date to YYYY-MM-DD using local date (no timezone conversion)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      console.log("Fetching shows for:", {
        movieId,
        formattedDate,
        selectedDate,
      });

      // Fetch shows from API
      const data = await getShowsOfMovieByTheatre(movieId, formattedDate);

      console.log("API Response:", data);

      if (data) {
        setShowsData(data);
        // Set movie details from first show if available
        const firstTheatre = Object.values(data)[0];
        if (firstTheatre?.shows?.[0]) {
          setMovieDetails({ title: firstTheatre.shows[0].movieName });
        }
      } else {
        setShowsData(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching shows:", error);
      setShowsData(null);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShowClick = (showId) => {
    navigate(`/seat-selection/${showId}`);
  };

  return (
    <div className="min-h-screen bg-[#e7dbf8] pt-20">
      {/* Header Section */}
      <div className="bg-[#e7dbf8] border-b-4 border-purple-950 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Movie Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {movieDetails?.title || "Movie Title"}
            </h1>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-gray-200 rounded text-xs font-semibold">
                UA
              </span>
              <span className="px-2 py-1 bg-gray-200 rounded text-xs font-semibold">
                COMEDY
              </span>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {dateRange.map((date, index) => {
              const { day, date: dateNum, month } = formatDate(date);
              const isSelected =
                date.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg min-w-[70px] transition-all ${
                    isSelected
                      ? "bg-[#6d27da] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xs font-semibold">{day}</span>
                  <span className="text-xl font-bold">{dateNum}</span>
                  <span className="text-xs">{month}</span>
                </button>
              );
            })}
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Show Listings */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6d27da]"></div>
          </div>
        ) : !showsData || Object.keys(showsData).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              No shows available for selected date
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(showsData).map(([theatreId, theatreData]) => (
              <div
                key={theatreId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Theatre Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button className="hover:text-[#6d27da]">
                        <Heart className="w-5 h-5" />
                      </button>
                      <h3 className="text-lg font-bold text-gray-900">
                        {theatreData.theatreName}
                      </h3>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-[#6d27da] text-sm font-semibold hover:underline">
                    <Info className="w-4 h-4" />
                    INFO
                  </button>
                </div>

                {/* Show Times */}
                <div className="flex flex-wrap gap-3">
                  {theatreData.shows.map((show) => (
                    <button
                      key={show._id}
                      onClick={() => handleShowClick(show._id)}
                      className="group relative"
                    >
                      <div className="border-2 border-gray-200 rounded-lg px-4 py-3 hover:border-[#6d27da] transition-all min-w-[120px]">
                        <div className="text-center">
                          <div className="text-green-600 font-bold text-base">
                            {formatTime(show.showTime)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                            {show.screenName}
                          </div>
                        </div>
                      </div>
                      {/* Availability indicator */}
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>AVAILABLE</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Cancellation info removed as per request */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectShowPage;
