
import React from "react";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "../../store/useEventStore";

const EventCard = ({ event }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day}, ${dayNum} ${month}`;
  };

  const navigate = useNavigate();
  const {selectEvent} = useEventStore()
  const handleEventClicked = () => {
    console.log("clicked ", event)
    selectEvent(event);
    navigate("/view-event");
  };

  return (
    <div
      className="min-w-[260px] w-[260px] cursor-pointer group"
      onClick={handleEventClicked}
    >
      {/* Image Container with Date Overlay */}
      <div className="relative h-[340px] rounded-xl overflow-hidden">
        <img
          src={event.coverImage || "/placeholder-event.jpg"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Date Badge */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-base font-medium">
            {formatDate(event.startDate)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900  line-clamp-2 text-xl leading-tight group-hover:text-[#6d27da] transition-colors">
          {event.title}
        </h3>
        <p className="text-lg text-gray-700 mt-1 line-clamp-1">{event.city}</p>
      </div>
    </div>
  );
};

export default EventCard;
