import React, { useEffect, useState } from "react";
import { useEventStore } from "../../store/useEventStore";
import EventCard from "./EventCard";

const UpcomingEventsSection = () => {
  const { upComingEvents, getUpcoming, isLoadingUpcoming } = useEventStore();
  const [page, setPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const eventsPerView = 5;

  useEffect(() => {
    getUpcoming(1);
  }, []);

  const handleNext = () => {
    const newStartIndex = startIndex + eventsPerView;

    // Check if we need to fetch more events
    if (
      upComingEvents &&
      newStartIndex + eventsPerView >= upComingEvents.length
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      getUpcoming(nextPage);
    }

    if (upComingEvents && newStartIndex < upComingEvents.length) {
      setStartIndex(newStartIndex);
    }
  };

  const handlePrev = () => {
    const newStartIndex = startIndex - eventsPerView;
    if (newStartIndex >= 0) {
      setStartIndex(newStartIndex);
    }
  };

  const visibleEvents =
    upComingEvents?.slice(startIndex, startIndex + eventsPerView) || [];
  const canGoPrev = startIndex > 0;
  const canGoNext =
    upComingEvents && startIndex + eventsPerView < upComingEvents.length;

  return (
   <div className="flex justify-center item-center ">

    <div className="mb-8 ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
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

        {/* Events Container */}
        <div className="flex gap-4 overflow-hidden">
          {visibleEvents.map((event) => (
            <EventCard key={event._id || event.eventId} event={event} />
          ))}
          {isLoadingUpcoming && (
            <div className="min-w-[200px] h-[280px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6d27da]"></div>
            </div>
          )}
        </div>

        {/* Right Arrow */}
        {(canGoNext || isLoadingUpcoming) && (
          <button
            onClick={handleNext}
            disabled={isLoadingUpcoming}
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

      {!upComingEvents && !isLoadingUpcoming && (
        <p className="text-gray-500 text-center">No upcoming events found</p>
      )}
    </div>
    </div>
  );
};

export default UpcomingEventsSection;
