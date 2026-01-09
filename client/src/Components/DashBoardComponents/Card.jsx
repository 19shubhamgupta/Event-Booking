import { Calendar, MapPin, Users, Clock, Edit, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Card = ({ inventory }) => {
  const [hasBooking, setHasBooking] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    // Show booking button only when totalCapacity is 0 or undefined (not configured yet)
    setHasBooking(!inventory.totalCapacity || inventory.totalCapacity === 0);
  }, [inventory.totalCapacity]);

  const handleBooking = (eventId) => {
    if (inventory.eventCategory === "show") {
      navigate(`/dashboard/create-bookings/${inventory.eventId}?show=true`);
    } else navigate(`/dashboard/create-bookings/${eventId}`);
  };

  const handleEditBtn = (inventory) => {
    if (inventory.eventCategory === "show") {
      navigate(`/dashboard/edit-inventory/${inventory.eventId}?show=true`);
    } else navigate(`/dashboard/edit-inventory/${inventory.eventId}`);
  };

  const handleScheduleBtn = (inventory) => {
    if (inventory.eventCategory === "show") {
      navigate(`/dashboard/edit-inventory/${inventory.eventId}?show=true&status=update`);
    } else
      navigate(`/dashboard/edit-inventory/${inventory.eventId}?status=update`);
  };
  return (
    <div
      key={inventory._id}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#6d27da]"
    >
      {/* Card Header with Status Badge */}
      <div className="relative h-22 bg-gradient-to-br from-[#6d27da] to-[#9b59d8] p-4">
        <div className="absolute top-3 right-3">
          <span className="bg-white text-[#6d27da] text-xs font-semibold px-3 py-1 rounded-full">
            Draft
          </span>
        </div>
        <div className="text-white">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">
            {inventory.eventTitle || "Untitled Event"}
          </h3>
          {inventory.location?.city && inventory.location?.state && (
            <div className="flex items-center gap-2 text-[#e7dbf8] text-sm">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {inventory.location.city}, {inventory.location.state}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Two Column Layout: Date/Time on Left, Buttons on Right */}
        <div className="flex gap-4 mb-4">
          {/* Left Side - Date and Time */}
          <div className="flex-1 space-y-2.5">
            {inventory.startDate && (
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#6d27da] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Event Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(inventory.startDate)}
                  </p>
                </div>
              </div>
            )}

            {inventory.startTime && (
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#6d27da] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Start Time</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {inventory.startTime}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex flex-col gap-2">
            {!hasBooking && (
              <button
                onClick={() => handleEditBtn(inventory)}
                className="flex items-center justify-center gap-1.5 bg-[#6d27da] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-[#5a1fb8] hover:shadow-md whitespace-nowrap"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            {!hasBooking && (
              <button
                onClick={() => handleScheduleBtn(inventory)}
                className="flex items-center justify-center gap-1.5 border-2 border-[#6d27da] text-[#6d27da] px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-[#e7dbf8] whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule
              </button>
            )}
            {hasBooking && (
              <button
                onClick={() => handleBooking(inventory.eventId)}
                className="flex items-center justify-center gap-1.5 border-2 border-[#6d27da] text-[#6d27da] px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-[#e7dbf8] whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                Create booking
              </button>
            )}
          </div>
        </div>

        {/* Capacity */}
        {!hasBooking && (
          <div className="flex items-start gap-2.5 ">
            <Users className="w-4 h-4 text-[#6d27da] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Total Capacity</p>
              <p className="text-sm font-semibold text-gray-800">
                {inventory.totalCapacity || 0} tickets
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
