import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookingStore } from "../store/useBookingStore";
import { useTheatreStore } from "../store/useTheatreStore";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const {
    getInventoryByEventId,
    inventory,
    fetchingInventory,
    bookEvent,
    creatingBooking,
  } = useBookingStore();

  const { getShowById, showDetails, screenData, fetchingShow } =
    useTheatreStore();

  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchShowAndInventory = async () => {
      if (showId) {
        await getShowById(showId);
        await getInventoryByEventId(showId);
      }
    };

    fetchShowAndInventory();
  }, [showId, getShowById, getInventoryByEventId]);

  const handleSeatClick = (seat) => {
    // Don't allow selecting spacers
    if (seat.type === "spacer") return;

    // Check if this ticket type is available in inventory (case-insensitive)
    const ticketType = inventory?.ticketTypes?.find(
      (t) => t.type.toLowerCase() === seat.type.toLowerCase()
    );
    if (!ticketType || ticketType.available <= 0) {
      toast.error(`No ${seat.type} seats available`);
      return;
    }

    const seatId = `${seat.row}-${seat.position}`;

    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => `${s.row}-${s.position}` === seatId);

      if (isSelected) {
        // Unselect the seat
        return prev.filter((s) => `${s.row}-${s.position}` !== seatId);
      } else {
        // Select the seat
        const maxTickets =
          inventory?.bookingSettings?.maxTicketsPerBooking || 10;
        if (prev.length >= maxTickets) {
          toast.error(`Maximum ${maxTickets} seats allowed`);
          return prev;
        }

        // Check if too many of this type are already selected
        const selectedOfType = prev.filter((s) => s.type === seat.type).length;
        if (selectedOfType >= ticketType.available) {
          toast.error(
            `Only ${ticketType.available} ${seat.type} seats available`
          );
          return prev;
        }

        return [...prev, seat];
      }
    });
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((sum, seat) => {
      const ticketType = inventory?.ticketTypes?.find(
        (t) => t.type.toLowerCase() === seat.type.toLowerCase()
      );
      return sum + (ticketType?.price || 0);
    }, 0);
  };

  const groupSeatsByType = () => {
    const grouped = {};
    selectedSeats.forEach((seat) => {
      const ticketType = inventory?.ticketTypes?.find(
        (t) => t.type.toLowerCase() === seat.type.toLowerCase()
      );
      if (!grouped[seat.type]) {
        grouped[seat.type] = {
          count: 0,
          price: ticketType?.price || 0,
        };
      }
      grouped[seat.type].count++;
    });
    return grouped;
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    const groupedSeats = groupSeatsByType();
    const bookingData = {
      eventId: showId,
      tickets: Object.entries(groupedSeats).map(([type, data]) => ({
        ticketType: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
        quantity: data.count,
        price: data.price,
      })),
    };

    console.log("Booking data:", bookingData);

    const reservationId = await bookEvent(bookingData);
    if (reservationId) {
      navigate(`/payment/${reservationId}`);
    }
  };

  // Get seat base color by type (matches AddScreenPage colors)
  const getSeatTypeColor = (type) => {
    switch (type) {
      case "premium":
        return "bg-yellow-400";
      case "vip":
        return "bg-[#6d27da]"; // Purple theme color
      case "spacer":
        return "bg-transparent";
      default: // regular
        return "bg-blue-500";
    }
  };

  // Get seat class based on type and selection state
  const getSeatClass = (seat) => {
    if (seat.type === "spacer") return "";

    const seatId = `${seat.row}-${seat.position}`;
    const isSelected = selectedSeats.some(
      (s) => `${s.row}-${s.position}` === seatId
    );

    // Check if this seat type has available tickets in inventory
    const ticketType = inventory?.ticketTypes?.find(
      (t) => t.type.toLowerCase() === seat.type.toLowerCase()
    );
    const isAvailable = ticketType && ticketType.available > 0;

    // Selected seat - green
    if (isSelected) {
      return "bg-green-500 hover:bg-green-600 cursor-pointer text-white";
    }

    // Unavailable seat - gray
    if (!isAvailable) {
      return "bg-gray-500 cursor-not-allowed text-gray-300 opacity-50";
    }

    // Available seat - color based on type
    switch (seat.type) {
      case "premium":
        return "bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-gray-900";
      case "vip":
        return "bg-[#6d27da] hover:bg-[#5a1fb8] cursor-pointer text-white";
      default: // regular
        return "bg-blue-500 hover:bg-blue-600 cursor-pointer text-white";
    }
  };

  if (fetchingShow || fetchingInventory) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] pt-20 flex items-center justify-center">
        <div className="text-xl text-white">Loading seats...</div>
      </div>
    );
  }

  if (!screenData || !screenData.seats) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] pt-20 flex items-center justify-center">
        <div className="text-xl text-white">No seats available</div>
      </div>
    );
  }

  // Group seats by row from screen data
  const seatsByRow = {};
  screenData.seats?.forEach((seat) => {
    if (!seatsByRow[seat.row]) {
      seatsByRow[seat.row] = [];
    }
    seatsByRow[seat.row].push(seat);
  });

  // Sort each row's seats by position
  Object.keys(seatsByRow).forEach((row) => {
    seatsByRow[row].sort((a, b) => a.position - b.position);
  });

  // Sort rows numerically and convert to row letters (0 = A, 1 = B, etc.)
  const sortedRows = Object.keys(seatsByRow).sort(
    (a, b) => Number(a) - Number(b)
  );
  const getRowLabel = (rowIndex) => String.fromCharCode(65 + Number(rowIndex));

  console.log("seatsByRow:", seatsByRow);
  console.log("sortedRows:", sortedRows);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {showDetails?.movieName || "Select Seats"}
          </h1>
          <p className="text-gray-400 text-sm">
            {screenData?.screenName || "Screen"} | {showDetails?.showTime}
          </p>
        </div>

        {/* Screen */}
        <div className="mb-16">
          <div className="relative">
            <div className="w-full h-2 bg-gradient-to-b from-white/80 to-transparent rounded-t-[100%] mb-2"></div>
            <p className="text-center text-gray-400 text-xs uppercase tracking-widest">
              Screen This Way
            </p>
          </div>
        </div>

        {/* Seats Layout */}
        <div className="mb-8 overflow-x-auto">
          <div className="inline-block min-w-full">
            {sortedRows.map((row) => (
              <div
                key={row}
                className="flex items-center justify-center gap-2 mb-2"
              >
                {/* Row Label */}
                <span className="w-8 text-center text-[#e7dbf8] font-bold text-sm">
                  {getRowLabel(row)}
                </span>

                {/* Seats */}
                <div className="flex gap-1">
                  {seatsByRow[row].map((seat, idx) =>
                    seat.type === "spacer" ? (
                      <div key={idx} className="w-10 h-10"></div>
                    ) : (
                      <button
                        key={seat._id || `${seat.row}-${seat.position}`}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-10 h-10 rounded text-xs font-bold transition-all shadow-md ${getSeatClass(
                          seat
                        )}`}
                        title={`${getRowLabel(row)}${seat.position + 1} - ${
                          seat.type
                        } - ₹${
                          inventory?.ticketTypes?.find(
                            (t) =>
                              t.type.toLowerCase() === seat.type.toLowerCase()
                          )?.price || 0
                        }`}
                      >
                        {seat.position + 1}
                      </button>
                    )
                  )}
                </div>

                {/* Row Label (Right) */}
                <span className="w-8 text-center text-[#e7dbf8] font-bold text-sm">
                  {getRowLabel(row)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm bg-[#2a2a2a] rounded-lg p-4">
          {inventory?.ticketTypes?.map((ticketType) => {
            let colorClass = "bg-blue-500";
            if (ticketType.type === "premium") colorClass = "bg-yellow-400";
            if (ticketType.type === "vip") colorClass = "bg-[#6d27da]";

            return (
              <div key={ticketType.type} className="flex items-center gap-2">
                <div className={`w-6 h-6 ${colorClass} rounded`}></div>
                <span className="text-gray-300">
                  {ticketType.type.charAt(0).toUpperCase() +
                    ticketType.type.slice(1)}{" "}
                  (₹{ticketType.price}) - {ticketType.available} left
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span className="text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-500 rounded opacity-50"></div>
            <span className="text-gray-300">Sold Out</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white text-black border-t-4 border-[#e7dbf8] z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Selected Seats Info */}
            <div className="flex-1">
              {selectedSeats.length > 0 ? (
                <div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {selectedSeats.map((seat, idx) => (
                      <span
                        key={idx}
                        className="bg-[#e7dbf8] px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 text-[#6d27da]"
                      >
                        {getRowLabel(seat.row)}
                        {seat.position + 1}
                        <button
                          onClick={() => handleSeatClick(seat)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedSeats.length} Seat
                    {selectedSeats.length > 1 ? "s" : ""} |{" "}
                    {screenData?.screenName}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Select seats to continue</p>
              )}
            </div>

            {/* Price and Pay Button */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-[#6d27da]">
                  ₹{getTotalPrice()}
                </p>
              </div>
              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || creatingBooking}
                className="bg-[#6d27da] hover:bg-[#5a1fb8] text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingBooking ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
