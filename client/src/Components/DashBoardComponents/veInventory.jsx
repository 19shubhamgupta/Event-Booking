import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useOrganizationStore } from "../../store/useOrganization";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

const ViewEditInventory = () => {
  const { id: eventId } = useParams();

  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const {
    getEventDetailsById,
    getInventoryByEventId,
    updateEvent,
    updateInventory,
  } = useOrganizationStore();
  const [event, setEvent] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusBtn, setstatusBtn] = useState(false);

  // Initialize react-hook-form with default values
  const { control, reset, getValues, watch } = useForm({
    defaultValues: {
      // Event Details
      eventTitle: "",
      shortDescription: "",
      eventCategory: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      city: "",
      state: "",
      country: "",
      latitude: "",
      longitude: "",

      // Inventory Details
      ticketTypes: [],
      maxTicketsPerBooking: 10,
      bookingOpenDate: "",
      bookingCloseDate: "",
    },
  });

  // Use field array for dynamic ticket types
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTypes",
  });

  const watchedValues = watch();

  // Fetch event and inventory data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (eventId) {
        setLoading(true);

        // Fetch event details from organize-service
        const eventData = await getEventDetailsById(eventId);
        // Fetch inventory from booking-service
        const inventoryData = await getInventoryByEventId(eventId);

        if (eventData && inventoryData) {
          setEvent(eventData);
          setInventory(inventoryData);

          // Format dates for input fields
          const formatDate = (dateString) => {
            if (!dateString) return "";
            return dateString.split("T")[0];
          };

          // Reset form with fetched data
          reset({
            // Event Details from organize-service
            eventTitle: eventData.title || "",
            shortDescription: eventData.shortDescription || "",
            eventCategory: eventData.eventCategory || "",
            startDate: formatDate(eventData.startDate),
            endDate: formatDate(eventData.endDate),
            startTime: eventData.startTime || "",
            endTime: eventData.endTime || "",
            city: eventData.city || "",
            state: eventData.state || "",
            country: eventData.country || "",
            latitude: eventData.locationCoordinates?.latitude || "",
            longitude: eventData.locationCoordinates?.longitude || "",

            // Inventory Details from booking-service
            ticketTypes:
              inventoryData.ticketTypes?.map((ticket) => ({
                type: ticket.type,
                price: ticket.price,
                totalCapacity: ticket.totalCapacity,
                description: ticket.description || "",
              })) || [],
            maxTicketsPerBooking:
              inventoryData.bookingSettings?.maxTicketsPerBooking || 10,
            bookingOpenDate: formatDate(
              inventoryData.bookingSettings?.bookingOpenDate
            ),
            bookingCloseDate: formatDate(
              inventoryData.bookingSettings?.bookingCloseDate
            ),
          });
        }
        setLoading(false);
      }
    };
    if (status !== undefined && status === "update") {
      setstatusBtn(true);
    }
    fetchData();
  }, [eventId, getEventDetailsById, getInventoryByEventId, status, reset]);

  // Add new ticket type
  const addTicketType = () => {
    append({
      type: "",
      price: 0,
      totalCapacity: 0,
      description: "",
    });
  };

  // Remove ticket type
  const removeTicketType = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Handle update - prepare data in backend format
  const handleUpdateInvt = async () => {
    const values = getValues();

    // Format data for inventory update (booking-service format)
    const inventoryUpdateData = {
      ticketConfiguration: values.ticketTypes.map((ticket) => ({
        type: ticket.type,
        price: parseFloat(ticket.price),
        totalCapacity: parseInt(ticket.totalCapacity),
        description: ticket.description || "",
      })),
      bookingSettings: {
        maxTicketsPerBooking: parseInt(values.maxTicketsPerBooking),
        bookingOpenDate: values.bookingOpenDate
          ? new Date(values.bookingOpenDate)
          : new Date(),
        bookingCloseDate: values.bookingCloseDate
          ? new Date(values.bookingCloseDate)
          : null,
      },
    };

    setUpdating(true);
    const result = await updateInventory(eventId, inventoryUpdateData);
    setUpdating(false);

    if (result) {
      // Refresh data
      const inventoryData = await getInventoryByEventId(eventId);
      if (inventoryData) {
        setInventory(inventoryData);
      }
    }
  };

  const handleUpdate = async () => {
    const values = getValues();

    // Format data for event update (organize-service format)
    const eventUpdateData = {
      title: values.eventTitle,
      shortDescription: values.shortDescription,
      eventCategory: values.eventCategory,
      startDate: values.startDate,
      endDate: values.endDate,
      startTime: values.startTime,
      endTime: values.endTime,
      city: values.city,
      state: values.state,
      country: values.country,
      locationCoordinates: {
        latitude: parseFloat(values.latitude) || 0,
        longitude: parseFloat(values.longitude) || 0,
      },
    };

    setUpdating(true);
    const result = await updateEvent(eventId, eventUpdateData);
    setUpdating(false);

    if (result) {
      // Refresh event data
      const eventData = await getEventDetailsById(eventId);
      if (eventData) {
        setEvent(eventData);
      }
    }
  };

  const handleStausUpdate = async () => {
    try {
      setUpdating(true)
      await handleUpdate();
      await handleUpdateInvt();
      await updateEvent(event._id , {eventStatus : "scheduled"})
    } catch (error) {
      console.log("error while updating " , error)
    }finally{
      setUpdating(false)
    }
  };

  // Calculate total capacity
  const totalCapacity = watchedValues.ticketTypes?.reduce(
    (sum, ticket) => sum + (parseInt(ticket.totalCapacity) || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00ABE4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!event || !inventory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event or inventory not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* SECTION 1: Event Details */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-950">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#00ABE4]">
            Event Details
          </h2>

          <div className="space-y-4">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Title
              </label>
              <Controller
                name="eventTitle"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter event title"
                  />
                )}
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Short Description
              </label>
              <Controller
                name="shortDescription"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="w-full p-2 border rounded-md h-20"
                    placeholder="Brief description of the event"
                  />
                )}
              />
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Category
              </label>
              <Controller
                name="eventCategory"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full p-2 border rounded-md">
                    <option value="">Select category</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Concert">Concert</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts">Arts</option>
                    <option value="Food">Food</option>
                    <option value="Other">Other</option>
                  </select>
                )}
              />
            </div>

            {/* Date Fields - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                />
              </div>
            </div>

            {/* Time Fields - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="time"
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Time
                </label>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="time"
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                />
              </div>
            </div>

            {/* Location Fields */}
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter city"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter state"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter country"
                  />
                )}
              />
            </div>

            {/* Coordinates - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Latitude
                </label>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="any"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 19.0760"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Longitude
                </label>
                <Controller
                  name="longitude"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="any"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 72.8777"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Update Button for Event Details */}
          <div className="mt-6">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full px-6 py-3 text-white rounded-md hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#00ABE4" }}
            >
              {updating ? "Updating..." : "Update Event"}
            </button>
          </div>
        </div>

        {/* SECTION 2: Inventory Details */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-950">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#00ABE4]">
            Inventory Details
          </h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Ticket Types
            </h3>

            {/* Ticket Types */}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border-2 border-blue-100 rounded-lg space-y-3 relative"
              >
                {/* Remove button */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <h4 className="font-semibold text-gray-700">
                  Ticket Type {index + 1}
                </h4>

                {/* Ticket Type Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ticket Name *
                  </label>
                  <Controller
                    name={`ticketTypes.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g., VIP, General, Early Bird"
                      />
                    )}
                  />
                </div>

                {/* Price and Capacity - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price (₹) *
                    </label>
                    <Controller
                      name={`ticketTypes.${index}.price`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full p-2 border rounded-md"
                          placeholder="0.00"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Total Capacity *
                    </label>
                    <Controller
                      name={`ticketTypes.${index}.totalCapacity`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          className="w-full p-2 border rounded-md"
                          placeholder="100"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description (Optional)
                  </label>
                  <Controller
                    name={`ticketTypes.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        className="w-full p-2 border rounded-md h-20"
                        placeholder="Brief description of this ticket type"
                      />
                    )}
                  />
                </div>
              </div>
            ))}

            {/* Add Ticket Type Button */}
            <button
              type="button"
              onClick={addTicketType}
              className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg 
                       text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Another Ticket Type
            </button>

            {/* Total Capacity Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                Total Event Capacity:{" "}
                <span className="text-blue-600 text-lg font-bold">
                  {totalCapacity || 0}
                </span>{" "}
                tickets
              </p>
            </div>

            {/* Booking Settings */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Booking Settings
              </h3>

              {/* Max Tickets Per Booking */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Tickets Per Booking *
                </label>
                <Controller
                  name="maxTicketsPerBooking"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="number"
                        min="1"
                        max="20"
                        className="w-full p-2 border rounded-md"
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum number of tickets a user can book in one
                        transaction (1-20)
                      </p>
                    </>
                  )}
                />
              </div>

              {/* Booking Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Booking Open Date *
                  </label>
                  <Controller
                    name="bookingOpenDate"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          {...field}
                          type="date"
                          className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          When bookings start
                        </p>
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Booking Close Date (Optional)
                  </label>
                  <Controller
                    name="bookingCloseDate"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          {...field}
                          type="date"
                          className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          When bookings end
                        </p>
                      </>
                    )}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800">Summary</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Total Ticket Types:</span>{" "}
                    {watchedValues.ticketTypes?.length || 0}
                  </p>
                  <p>
                    <span className="font-medium">Total Capacity:</span>{" "}
                    {totalCapacity || 0} tickets
                  </p>
                  <p>
                    <span className="font-medium">Max Per Booking:</span>{" "}
                    {watchedValues.maxTicketsPerBooking || 0} tickets
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Update Button for Inventory Details */}
          <div className="mt-6">
            <button
              onClick={handleUpdateInvt}
              disabled={updating}
              className="w-full px-6 py-3 text-white rounded-md hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#00ABE4" }}
            >
              {updating ? "Updating..." : "Update Inventory"}
            </button>
          </div>
        </div>
        {statusBtn && (
          <button
            onClick={handleStausUpdate}
            disabled={updating}
            className="w-full px-6 py-3 text-white bg-red-600 rounded-md hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Updating..." : "Update Inventory"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewEditInventory;
