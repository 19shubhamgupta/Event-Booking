import React, { useEffect, useState } from "react";
import { useEventStore } from "../../store/useEventStore";
import EventCard from "./EventCard";

const CategoryEventsSection = () => {
  const { eventOne, eventTwo, eventThree, getEventByCat, isLoadingCatPage } =
    useEventStore();

  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryPages, setCategoryPages] = useState({});
  const [startIndices, setStartIndices] = useState({});
  const eventsPerView = 5;

  useEffect(() => {
    getEventByCat(1, "all");
  }, []);

  useEffect(() => {
    // Set first category as active when data loads
    if (eventOne && !activeCategory) {
      setActiveCategory(eventOne.category);
    }
  }, [eventOne]);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    // Reset start index for this category if not set
    if (!startIndices[categoryName]) {
      setStartIndices((prev) => ({ ...prev, [categoryName]: 0 }));
    }
  };

  const getActiveCategoryData = () => {
    if (activeCategory === eventOne?.category) return eventOne;
    if (activeCategory === eventTwo?.category) return eventTwo;
    if (activeCategory === eventThree?.category) return eventThree;
    return null;
  };

  const getActiveEvents = () => {
    return getActiveCategoryData()?.events || [];
  };

  const getActiveCount = () => {
    return getActiveCategoryData()?.count || 0;
  };

  const handleNext = () => {
    const events = getActiveEvents();
    const totalCount = getActiveCount();
    const currentStartIndex = startIndices[activeCategory] || 0;
    const newStartIndex = currentStartIndex + eventsPerView;

    // Check if we need to fetch more events
    if (
      newStartIndex + eventsPerView >= events.length &&
      events.length < totalCount
    ) {
      const currentPage = categoryPages[activeCategory] || 1;
      const nextPage = currentPage + 1;
      setCategoryPages((prev) => ({ ...prev, [activeCategory]: nextPage }));
      getEventByCat(nextPage, activeCategory);
    }

    if (newStartIndex < events.length) {
      setStartIndices((prev) => ({ ...prev, [activeCategory]: newStartIndex }));
    }
  };

  const handlePrev = () => {
    const currentStartIndex = startIndices[activeCategory] || 0;
    const newStartIndex = currentStartIndex - eventsPerView;
    if (newStartIndex >= 0) {
      setStartIndices((prev) => ({ ...prev, [activeCategory]: newStartIndex }));
    }
  };

  const categories = [eventOne, eventTwo, eventThree].filter(Boolean);
  const currentStartIndex = startIndices[activeCategory] || 0;
  const visibleEvents = getActiveEvents().slice(
    currentStartIndex,
    currentStartIndex + eventsPerView
  );
  const canGoPrev = currentStartIndex > 0;
  const canGoNext =
    currentStartIndex + eventsPerView < getActiveEvents().length ||
    getActiveEvents().length < getActiveCount();

  return (
    <div className="flex justify-center items-center">
      <div className="mt-5 px-4">
        {/* Category Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => handleCategoryClick(cat.category)}
              className={`pb-3 font-semibold text-2xl transition-all relative ${
                activeCategory === cat.category
                  ? "text-[#6d27da]"
                  : "text-black"
              }`}
            >
              {cat.category}
              {activeCategory === cat.category && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6d27da]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Events Row */}
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
            {isLoadingCatPage && (
              <div className="min-w-[200px] h-[280px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6d27da]"></div>
              </div>
            )}
          </div>

          {/* Right Arrow */}
          {canGoNext && (
            <button
              onClick={handleNext}
              disabled={isLoadingCatPage}
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

        {getActiveEvents().length === 0 && !isLoadingCatPage && (
          <p className="text-gray-500 text-center mt-4">
            No events found in this category
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryEventsSection;
