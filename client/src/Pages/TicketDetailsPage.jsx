import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookingStore } from "../store/useBookingStore";
import { useEventStore } from "../store/useEventStore";
import toast from "react-hot-toast";

const TicketDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    getInventoryByEventId,
    inventory,
    fetchingInventory,
    bookEvent,
    creatingBooking,
  } = useBookingStore();
  const { eventData } = useEventStore();

  const [selectedTickets, setSelectedTickets] = useState({});

  useEffect(() => {
    if (eventId) {
      getInventoryByEventId(eventId);
    }
  }, [eventId]);

  const handleQuantityChange = (ticketType, quantity) => {
    const maxTickets = inventory?.bookingSettings?.maxTicketsPerBooking || 10;
    const available =
      inventory?.ticketTypes?.find((t) => t.type === ticketType)?.available ||
      0;

    const newQuantity = Math.max(0, Math.min(quantity, available, maxTickets));

    setSelectedTickets((prev) => {
      if (newQuantity === 0) {
        const { [ticketType]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketType]: newQuantity };
    });
  };

  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((sum, [type, qty]) => {
      const ticket = inventory?.ticketTypes?.find((t) => t.type === type);
      return sum + (ticket?.price || 0) * qty;
    }, 0);
  };

  const handleBooking = async () => {
    if (getTotalQuantity() === 0) {
      toast.error("Please select at least one ticket");
      return;
    }

    const bookingData = {
      eventId: eventId,
      tickets: Object.entries(selectedTickets).map(([type, quantity]) => {
        const ticketInfo = inventory.ticketTypes.find((t) => t.type === type);
        return {
          ticketType: type,
          quantity: quantity,
          price: ticketInfo?.price || 0,
        };
      }),
    };

    const reservationId = await bookEvent(bookingData);
    if (reservationId) {
      navigate(`/payment/${reservationId}`);
    }
  };

  if (fetchingInventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading tickets...</div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-600">No tickets available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {eventData?.title || "Event Tickets"}
          </h1>
          <p className="text-gray-600">Select your tickets</p>
        </div>

        {/* Tickets List - Movie Ticket Style */}
        <div className="space-y-6 mb-8">
          {inventory.ticketTypes?.map((ticket) => (
            <div
              key={ticket.type}
              className="relative bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Main Ticket Body */}
              <div className="flex">
                {/* Left Section - Ticket Info */}
                <div className="flex-1 p-6 border-r-2 border-dashed border-gray-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {ticket.type}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Event Admission
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">
                        ${ticket.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">per ticket</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm">
                      <span className="text-gray-500">Available: </span>
                      <span
                        className={`font-bold ${
                          ticket.available > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {ticket.available > 0
                          ? `${ticket.available} tickets`
                          : "SOLD OUT"}
                      </span>
                    </p>

                    {/* Quantity Controls */}
                    {ticket.available > 0 && (
                      <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              ticket.type,
                              (selectedTickets[ticket.type] || 0) - 1
                            )
                          }
                          disabled={
                            !selectedTickets[ticket.type] ||
                            selectedTickets[ticket.type] === 0
                          }
                          className="w-9 h-9 rounded-md bg-white text-gray-700 text-lg font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          −
                        </button>
                        <span className="text-xl font-bold text-gray-900 w-8 text-center">
                          {selectedTickets[ticket.type] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              ticket.type,
                              (selectedTickets[ticket.type] || 0) + 1
                            )
                          }
                          disabled={
                            (selectedTickets[ticket.type] || 0) >=
                            ticket.available
                          }
                          className="w-9 h-9 rounded-md bg-purple-600 text-white text-lg font-bold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Stub */}
                <div className="w-24 bg-purple-600 flex flex-col items-center justify-center p-3 relative">
                  {/* Circle cutouts */}
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-50 rounded-full"></div>
                  <div className="absolute -left-3 bottom-0 w-6 h-6 bg-gray-50 rounded-full"></div>

                  <span className="text-white text-xs font-bold tracking-wider transform -rotate-90 whitespace-nowrap">
                    {ticket.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Sold Out Overlay */}
              {ticket.available === 0 && (
                <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold tracking-wider transform -rotate-12 border-4 border-white px-6 py-2">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Booking Summary - Fixed at Bottom */}
        {getTotalQuantity() > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-8 pb-6 px-4 z-50">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 border-4 border-orange-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Summary Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-4 uppercase">
                      🎬 Your Order
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(selectedTickets).map(([type, qty]) => (
                        <div
                          key={type}
                          className="flex justify-between items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"
                        >
                          <span className="text-white font-bold">
                            {qty}x {type}
                          </span>
                          <span className="text-white font-black text-lg">
                            $
                            {(
                              inventory.ticketTypes.find((t) => t.type === type)
                                ?.price * qty
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-white/30 flex justify-between items-center">
                      <span className="text-white font-black text-xl uppercase">
                        Total
                      </span>
                      <span className="text-white font-black text-4xl">
                        ${getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="lg:w-64">
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={creatingBooking}
                      className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creatingBooking
                        ? "Processing..."
                        : "Continue to Payment"}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {getTotalQuantity()} ticket
                      {getTotalQuantity() > 1 ? "s" : ""} • Secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                Important Information
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                {inventory.bookingSettings?.maxTicketsPerBooking && (
                  <li>
                    • Maximum {inventory.bookingSettings.maxTicketsPerBooking}{" "}
                    tickets per booking
                  </li>
                )}
                <li>• Tickets reserved for 15 minutes to complete payment</li>
                <li>• All sales are final - no refunds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
