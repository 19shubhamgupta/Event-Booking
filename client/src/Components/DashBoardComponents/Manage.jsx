import React, { useEffect, useState } from "react";
import { useOrganizationStore } from "../../store/useOrganization";
import { Calendar, TrendingUp, Users, Ticket } from "lucide-react";
import Card from "./Card";
import SSEClient from "../../../lib/SSEclient";

const Manage = () => {
  const { getInventoryForDashByStatus } = useOrganizationStore();
  const [draftInventories, setDraftInventories] = useState([]);
  const [isconnected, setIsconnected] = useState(false);
  const [inv, setInv] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraftInventories();
    fetchBookingOpenEvents();
  }, []);

  useEffect(() => {
    if (inv.length > 0) {
      const eventsId = inv.map((e) => e.eventId);
      SSEClient.connect(eventsId);
      setIsconnected(true);

      SSEClient.on("reservation.success", (data) => {
        console.log("New Reservation:", data);
        // Update inventory in real-time with ticket-level changes
        setInv((prev) =>
          prev.map((inventory) => {
            if (inventory.eventId !== data.eventId) return inventory;

            // Update ticket types
            const updatedTicketTypes = inventory.ticketTypes.map((ticket) => {
              const reservedTicket = data.tickets.find(
                (t) => t.ticketType === ticket.type
              );
              if (reservedTicket) {
                return {
                  ...ticket,
                  availableTickets:
                    ticket.availableTickets - reservedTicket.quantity,
                  reservedTickets:
                    ticket.reservedTickets + reservedTicket.quantity,
                };
              }
              return ticket;
            });

            return {
              ...inventory,
              activeReservations: inventory.activeReservations + 1,
              totalAvailable: inventory.totalAvailable - data.ticketsReserved,
              totalReserved: inventory.totalReserved + data.ticketsReserved,
              ticketTypes: updatedTicketTypes,
              lastSyncedAt: new Date(),
            };
          })
        );
        showNotification(
          "Reservation Successful!",
          `${data.ticketsReserved} tickets`
        );
      });

      SSEClient.on("booking.success", (data) => {
        console.log("New Booking:", data);
        // Update inventory in real-time with ticket-level changes
        setInv((prev) =>
          prev.map((inventory) => {
            if (inventory.eventId !== data.eventId) return inventory;

            // Update ticket types
            const updatedTicketTypes = inventory.ticketTypes.map((ticket) => {
              const bookedTicket = data.tickets.find(
                (t) => t.ticketType === ticket.type
              );
              if (bookedTicket) {
                return {
                  ...ticket,
                  reservedTickets:
                    ticket.reservedTickets - bookedTicket.quantity,
                  soldTickets: ticket.soldTickets + bookedTicket.quantity,
                };
              }
              return ticket;
            });

            return {
              ...inventory,
              activeReservations: inventory.activeReservations - 1,
              totalReserved: inventory.totalReserved - data.ticketsBooked,
              totalSold: inventory.totalSold + data.ticketsBooked,
              ticketTypes: updatedTicketTypes,
              bookingStats: {
                ...inventory.bookingStats,
                totalBookings: (inventory.bookingStats?.totalBookings || 0) + 1,
              },
              lastSyncedAt: new Date(),
            };
          })
        );
        showNotification("Booking Confirmed!", `${data.ticketsBooked} tickets`);
      });

      SSEClient.on("reservation.cancelled", (data) => {
        console.log("Reservation Cancelled:", data);
        fetchBookingOpenEvents();
        showNotification(
          "Reservation Cancelled",
          `${data.ticketsReleased} tickets released`
        );
      });

      SSEClient.on("inventory.updated", (data) => {
        console.log("Inventory Updated:", data);
        // Refresh inventory data
        fetchBookingOpenEvents();
      });

      return () => {
        SSEClient.off("reservation.success");
        SSEClient.off("booking.success");
        SSEClient.off("reservation.cancelled");
        SSEClient.off("inventory.updated");
        SSEClient.disconnect();
      };
    }
  }, [inv.length]);

  useEffect(() => {
    if (isconnected && inv.length > 0) {
      const eventsId = inv.map((e) => e.eventId);
      SSEClient.updateSubscriptions(eventsId);
    }
  }, [inv.length, isconnected]);

  const fetchDraftInventories = async () => {
    setLoading(true);
    try {
      const inventories = await getInventoryForDashByStatus("draft");
      console.log("invent in manage with status ${draft} : ", inventories);

      setDraftInventories(inventories || []);
    } catch (error) {
      console.error("Error fetching draft inventories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingOpenEvents = async () => {
    try {
      const inv = await getInventoryForDashByStatus("booking_open");
      console.log("invent in manage with status ${booking_open} : ", inv);

      setInv(inv || []);
    } catch (error) {
      console.error("Error fetching  inv:", error);
    }
  };

  const showNotification = (title, message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/icon.png",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6d27da] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen pt-15">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6d27da] to-[#8b44f7] bg-clip-text text-transparent mb-2">
          Event Management Dashboard
        </h1>
      </div>

      {/* Live Events Inventory Table */}
      {inv.length > 0 && (
        <div className="mb-8">
          <div className=" rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="px-6 py-3 bg-gradient-to-r from-[#6d27da] via-[#7c35e3] to-[#8b44f7] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    Live Events - Booking Open
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">Live</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Event / Ticket Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Capacity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Available
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Reserved
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Booked
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {inv.map((inventory, idx) => (
                    <React.Fragment key={inventory._id || idx}>
                      {/* Event Summary Row */}
                      <tr className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-200 border-l-2 border-transparent hover:border-[#6d27da]">
                        <td className="px-5 py-3 border-r border-gray-100">
                          <div>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-[#6d27da] transition-colors">
                              {inventory.eventTitle}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span className="text-lg font-bold text-gray-900">
                            {inventory.totalCapacity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-lg font-bold bg-gradient-to-br from-green-100 to-green-50 text-green-800">
                            {inventory.totalAvailable}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-lg font-bold bg-gradient-to-br from-amber-100 to-amber-50 text-amber-800">
                            {inventory.totalReserved}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          <span className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-lg font-bold bg-gradient-to-br from-blue-100 to-blue-50 text-blue-800">
                            {inventory.totalSold}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 uppercase tracking-wide">
                            {inventory.eventStatus}
                          </span>
                        </td>
                      </tr>

                      {/* Ticket Type Rows */}
                      {inventory.ticketTypes &&
                      inventory.ticketTypes.length > 0 ? (
                        inventory.ticketTypes.map((ticket, ticketIdx) => (
                          <tr
                            key={`${inventory._id}-${ticketIdx}`}
                            className="group hover:bg-gray-50/70 transition-all duration-150"
                          >
                            <td className="px-5 py-2 pl-10 border-r border-gray-100">
                              <div className="flex items-center gap-2">
                                <Ticket className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-md font-semibold text-gray-800">
                                  {ticket.type}
                                </span>
                                <span className="text-md font-bold text-[#6d27da] bg-purple-50 px-2 py-0.5 rounded">
                                  ${ticket.price}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center border-r border-gray-100">
                              <span className="text-md font-semibold text-gray-700">
                                {ticket.totalCapacity}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center border-r border-gray-100">
                              <span className="text-md font-bold text-green-700">
                                {ticket.availableTickets}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center border-r border-gray-100">
                              <span className="text-md font-bold text-amber-700">
                                {ticket.reservedTickets}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center border-r border-gray-100">
                              <span className="text-md font-bold text-blue-700">
                                {ticket.soldTickets}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-full max-w-[90px] bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#6d27da] to-[#8b44f7] h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{
                                      width: `${
                                        (ticket.soldTickets /
                                          ticket.totalCapacity) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {Math.round(
                                    (ticket.soldTickets /
                                      ticket.totalCapacity) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-8 py-6 text-center text-sm text-gray-500 italic bg-gray-50/30"
                          >
                            No ticket types configured
                          </td>
                        </tr>
                      )}

                      {/* Stats Row */}
                      <tr className="bg-gradient-to-r from-gray-50/80 to-gray-100/50 border-t border-gray-100">
                        <td colSpan="6" className="px-5 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md shadow-sm">
                                <Users className="w-3.5 h-3.5 text-[#6d27da]" />
                                <span className="text-xs font-semibold text-gray-700">
                                  Active:
                                </span>
                                <span className="text-xs font-bold text-[#6d27da]">
                                  {inventory.activeReservations}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md shadow-sm">
                                <span className="text-xs font-semibold text-gray-700">
                                  Bookings:
                                </span>
                                <span className="text-xs font-bold text-blue-700">
                                  {inventory.bookingStats?.totalBookings || 0}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-full">
                              {new Date(
                                inventory.lastSyncedAt
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Legend */}
            <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg shadow-sm border border-green-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Total Revenue:
                    </span>
                    <span className="text-sm font-bold text-green-700">
                      $
                      {inv
                        .reduce(
                          (total, inventory) =>
                            total + (inventory.bookingStats?.totalRevenue || 0),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Total Events:
                  </span>
                  <span className="text-sm font-bold text-[#6d27da] bg-purple-50 px-3 py-1.5 rounded-lg">
                    {inv.length}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live tracking enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Events Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Draft Events</h2>

        {draftInventories.length === 0 ? (
          <div className="text-center ">
            <div className=" rounded-lg p-12 pt-0 max-w-md mx-auto">
              <div className="w-20 h-20  rounded-full flex items-center justify-center mx-auto ">
                <Calendar className="w-10 h-10 text-[#6d27da]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                No Draft Inventories
              </h3>
              <p className="text-gray-600 text-xl">
                Create an event inventory to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftInventories.map((inventory) => (
              <Card key={inventory._id} inventory={inventory} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Manage;
