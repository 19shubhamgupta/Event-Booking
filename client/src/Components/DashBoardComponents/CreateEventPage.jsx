import React, { useState, useCallback } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "../../store/useOrganization";

const CreateEventPage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { organization, createEventOndb, isCreating, allDrafts } =
    useOrganizationStore();
  const [customCategory, setCustomCategory] = useState("");
  const [newpageName, setNewpageName] = useState(
    "tech-innovation-conference-2025"
  );

  // Access the course store

  // Initialize react-hook-form
  const { control, getValues, watch } = useForm({
    defaultValues: {
      title: "Tech Innovation Conference 2025",
      shortDescription:
        "A one-day conference focused on AI, blockchain, and emerging technologies.",
      eventCategory: "Conference",
      startDate: "2025-02-20",
      endDate: "2025-02-20",
      startTime: "10:00",
      endTime: "17:30",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      latitude: "19.0760",
      longitude: "72.8777",
      page: "",
    },
  });

  // Watch form values for validation
  const watchedValues = watch();

  // Log all form data function
  const logFormData = () => {
    const values = getValues();
    const formattedData = {
      title: values.title,
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
        latitude: parseFloat(values.latitude),
        longitude: parseFloat(values.longitude),
      },
      page: values.page === "New" ? null : values.page, // Store page _id or null for new
      newPageName: values.page === "New" ? newpageName : null, // Include new page name if creating new
    };

    console.log("Event Form Data:", formattedData);
    return formattedData;
  };

  // Go to next step
  const nextStep = () => {
    if (step === 2) {
      startGenerating();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const startGenerating = async () => {
    // Get form data using our helper function
    const eventData = logFormData();

    // Update step to show loading UI
    setStep(3);

    console.log("Creating event with data:", eventData);
    const res = await createEventOndb(eventData);

    if (res && !isCreating) {
      navigate(`/dashboard/drafts/${res}`);
    }
    if (!res) setStep(1);
  };

  // Check if current step is valid and can proceed
  const isStepValid = useCallback(() => {
    console.log("Step:", step, "Watched values:", watchedValues);

    switch (step) {
      case 1: {
        const step1Valid =
          watchedValues.title?.trim() &&
          watchedValues.shortDescription?.trim() &&
          watchedValues.eventCategory?.trim() &&
          watchedValues.startDate &&
          watchedValues.endDate &&
          watchedValues.startTime &&
          watchedValues.endTime;
        console.log("Step 1 valid:", step1Valid);
        return step1Valid;
      }

      case 2: {
        const step2Valid =
          watchedValues.city?.trim() &&
          watchedValues.state?.trim() &&
          watchedValues.country?.trim() &&
          watchedValues.latitude &&
          watchedValues.longitude &&
          !isNaN(parseFloat(watchedValues.latitude)) &&
          !isNaN(parseFloat(watchedValues.longitude));
        console.log("Step 2 valid:", step2Valid);
        return step2Valid;
      }

      default:
        return true;
    }
  }, [step, watchedValues]);

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div key="step-1" className="space-y-2">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Event Title
              </label>
              <Controller
                name="title"
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

            {/* Event Description */}
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
                    placeholder="Enter event description"
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
                  <>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={
                        [
                          "Conference",
                          "Workshop",
                          "Concert",
                          "Seminar",
                        ].includes(field.value)
                          ? field.value
                          : customCategory
                          ? "Other"
                          : field.value
                      }
                      onChange={(e) => {
                        if (e.target.value !== "Other") {
                          field.onChange(e.target.value);
                          setCustomCategory("");
                        } else {
                          setCustomCategory("Other");
                          field.onChange("");
                        }
                      }}
                    >
                      <option value="">Select category</option>
                      <option value="Conference">Conference</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Concert">Concert</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Other">Other</option>
                    </select>

                    {customCategory === "Other" && (
                      <input
                        type="text"
                        className="w-full mt-2 p-2 border rounded-md"
                        placeholder="Enter custom category"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  </>
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
          </div>
        );

      case 2:
        return (
          <div key="step-2" className="space-y-4">
            {/* City */}
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

            {/* State */}
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

            {/* Country */}
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
            {/* Select pages */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select page Page
              </label>
              <Controller
                name="page"
                control={control}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      className="w-full p-2 border rounded-md"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (e.target.value === "New") {
                          setNewpageName("");
                        }
                      }}
                    >
                      <option value="">Select page Page</option>
                      {allDrafts?.map(({ _id, title }) => (
                        <option key={_id} value={_id}>
                          {title}
                        </option>
                      ))}
                      <option value="New">Create a new page</option>
                    </select>

                    {field.value === "New" && (
                      <input
                        type="text"
                        className="w-full mt-2 p-2 border rounded-md"
                        placeholder="Enter new page name"
                        value={newpageName}
                        onChange={(e) => setNewpageName(e.target.value)}
                      />
                    )}
                  </>
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
                      placeholder="e.g., 40.7128"
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
                      placeholder="e.g., -74.0060"
                    />
                  )}
                />
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
            <div className="max-w-200 md:-mt-60 border-4 border-blue-950 rounded-lg p-8 bg-white shadow-lg ">
              {/* Custom Generating Loader */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-950">
                  Creating Event...
                </div>
                <p className="text-gray-600 mt-2">
                  Please wait while we set up your event
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
          ? " min-h-[80vh] flex items-center justify-center w-full"
          : "bg-white rounded-lg shadow-md p-6  max-w-2xl mx-auto border-2 border-blue-950"
      }`}
    >
      {/* Progress indicator */}
      {step < 3 && (
        <div className="mb-5">
          {/* Step circles with labels */}
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
                  {stepNumber === 1 && "Basic Details"}
                  {stepNumber === 2 && "Location"}
                </span>
              </div>
            ))}

            {/* Thick progress bar underneath */}
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
        <div className="mt-3 flex justify-between">
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
            {step === 2 ? "Create Event" : "Next"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateEventPage;
