import React, { useState, useEffect } from "react";
import BlockRender from "../Components/PageEditor/BlockRender";
import { useEventStore } from "../store/useEventStore";
import { useBookingStore } from "../store/useBookingStore";
import { useNavigate } from "react-router-dom";



const ViewEventPage = () => {
  const { getEventPage, eventPage, eventData } = useEventStore();
const navigate = useNavigate()
  useEffect(() => {
    if (eventData?.page?.pageId) {
      getEventPage(eventData.page.pageId);
    }
  }, [eventData?.page?.pageId]); // Only re-run if pageId changes

  // Don't render if no event data
  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#e7dbf8] pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading event...</div>
      </div>
    );
  }

  const handleBookBtn = async (eve) => {
    if(eventData.movieData){
      navigate(`/view-show/${eventData.eventId}`)
    }
    else navigate(`/ticket-details/${eventData.eventId}`)
  }

  return (
    <div className="min-h-screen bg-[#e7dbf8] pt-20">
      {/* Banner Section */}
      <div className="container mx-auto px-4">
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
          <img
            src={eventData.coverImage || "/banner1.jpg"}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50"></div>

          {/* Top Left Corner - Event Title */}
          <div className="absolute top-0 left-0 p-6">
            <h1 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
              {eventData.title}
            </h1>
          </div>

          {/* Bottom Left Corner Content */}
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex items-center gap-2 text-white mb-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-lg font-medium">{eventData.city}</span>
            </div>
            <button className="bg-[#6d27da] hover:bg-[#d63752] text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg"
            onClick={() =>handleBookBtn(eventData)}
            >
              {eventData.movieData?"Get Show":"Book Now"}
            </button>
          </div>

          {/* Category Badge in Top Right */}
          <div className="absolute top-4 right-4">
            <span className="bg-[#6d27da] px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg">
              {eventData.eventCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full mx-auto">
          {/* Page Builder Content */}
          <div className="p-6">
            <div className="space-y-6">
              {eventPage?.blocks?.map((block) => (
                <BlockRender key={block.id} block={block} />
              ))}
            </div>
          </div>

          {/* Sticky Book Button for Mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
            <button className="w-full bg-[#f84464] hover:bg-[#d63752] text-white py-3 rounded-lg font-semibold text-lg transition-colors"
              onClick={() =>handleBookBtn(eventData)}>
              {eventData.movieData?"Get Show":"Book Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default ViewEventPage;
