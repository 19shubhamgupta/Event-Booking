import React, { useState, useCallback } from "react";
import { ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useOrganizationStore } from "../store/useOrganization";

const CreateInventoryPage = () => {
  const { id: eventId } = useParams();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Initialize react-hook-form with ticketTypes array
  const { control, getValues, watch, handleSubmit } = useForm({
    defaultValues: {
      ticketTypes: [
        {
          type: "General Admission",
          price: 500,
          totalCapacity: 100,
          description: "Standard entry ticket",
        },
      ],
      maxTicketsPerBooking: 10,
      bookingOpenDate: new Date().toISOString().split("T")[0],
      bookingCloseDate: "",
    },
  });

  const { organization, createInventory, creatingInventory } =
    useOrganizationStore();
  // Use field array for dynamic ticket types
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTypes",
  });

  // Watch form values for validation
  const watchedValues = watch();

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

  // Check if current step is valid
  const isStepValid = useCallback(() => {
    switch (step) {
      case 1: {
        // Validate ticket types
        const ticketTypes = watchedValues.ticketTypes || [];
        if (ticketTypes.length === 0) return false;

        return ticketTypes.every(
          (ticket) =>
            ticket.type?.trim() && ticket.price > 0 && ticket.totalCapacity > 0
        );
      }

      case 2: {
        // Validate booking settings
        return (
          watchedValues.maxTicketsPerBooking > 0 &&
          watchedValues.maxTicketsPerBooking <= 20 &&
          watchedValues.bookingOpenDate
        );
      }

      default:
        return true;
    }
  }, [step, watchedValues]);

  // Handle form submission
  const onSubmit = async () => {
    const values = getValues();
console.log("org while summiting : ",organization)
    const inventoryData = {
      organizationId: organization._id,
      eventId: eventId,
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

    console.log("Creating inventory:", inventoryData);

    setStep(3);

    try {
      await createInventory(inventoryData);
      if (!creatingInventory) {
        navigate(`/`);
      }
    } catch (error) {
      console.error("Error creating inventory:", error);
      setStep(1);
    }
  };

  // Go to next step
  const nextStep = () => {
    if (step === 2) {
      onSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Calculate total capacity
  const totalCapacity = watchedValues.ticketTypes?.reduce(
    (sum, ticket) => sum + (parseInt(ticket.totalCapacity) || 0),
    0
  );

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div key="step-1" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Configure Ticket Types
            </h2>

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

                <h3 className="font-semibold text-gray-700">
                  Ticket Type {index + 1}
                </h3>

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
          </div>
        );

      case 2:
        return (
          <div key="step-2" className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Booking Settings
            </h2>

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
              <h3 className="font-semibold text-gray-800">Summary</h3>
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
        );

      case 3:
        return (
          <div
            key="step-3"
            className="w-full flex items-center justify-center md:mt-10"
          >
            <div className="max-w-200 md:-mt-60 border-4 border-blue-950 rounded-lg p-8 bg-white shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-950">
                  {creatingInventory
                    ? "Creating Inventory..."
                    : "Inventory Created!"}
                </div>
                <p className="text-gray-600 mt-2">
                  {creatingInventory
                    ? "Please wait while we configure your ticket inventory"
                    : "Your event inventory is ready for bookings"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`${
        step === 3
          ? "min-h-[80vh] flex items-center justify-center w-full"
          : "bg-white rounded-lg shadow-md p-6 mt-20 max-w-3xl mx-auto border-2 border-blue-950"
      }`}
    >
      {/* Progress indicator */}
      {step < 3 && (
        <div className="mb-5">
          <div className="flex items-center justify-between relative mb-2">
            {[1, 2].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center 
                  transition-all duration-300 border-4 ${
                    step >= stepNumber
                      ? "text-white border-blue-950"
                      : "text-gray-400 border-blue-950 bg-white"
                  }`}
                  style={{
                    backgroundColor: step >= stepNumber ? "#00ABE4" : "white",
                    boxShadow: "0 0 0 3px white",
                  }}
                >
                  {stepNumber}
                </div>
                <span
                  className="mt-3 text-sm font-medium"
                  style={{ color: step >= stepNumber ? "#00ABE4" : "#CDDEEF" }}
                >
                  {stepNumber === 1 && "Ticket Types"}
                  {stepNumber === 2 && "Booking Settings"}
                </span>
              </div>
            ))}

            {/* Progress bar */}
            <div
              className="absolute top-4 left-0 h-3 bg-gray-200 w-full -z-0 rounded-full"
              style={{ backgroundColor: "#CDDEEF" }}
            ></div>
            <div
              className="absolute top-4 left-0 h-3 transition-all duration-500 ease-in-out rounded-full"
              style={{
                backgroundColor: "#00ABE4",
                width: step === 1 ? "0%" : step >= 2 ? "100%" : "0%",
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Form steps */}
      <div className={step === 3 ? "w-full" : "min-h-[300px]"}>
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
              style={{ borderColor: "#CDDEEF", color: "#333333" }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 ${
              isStepValid() ? "" : "opacity-50 cursor-not-allowed"
            }`}
            style={{ backgroundColor: "#00ABE4" }}
          >
            {step === 2 ? "Create Inventory" : "Next"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateInventoryPage;
