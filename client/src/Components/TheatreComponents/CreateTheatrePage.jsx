import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { MapPin, Building2, Navigation, Info } from "lucide-react";
import { useTheatreStore } from "../../store/useTheatreStore";
import { useOrganizationStore } from "../../store/useOrganization";

const CreateTheatrePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {createTheatre } = useTheatreStore()
  const {organization} = useOrganizationStore()
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      theaterName: "",
      latitude: "",
      longitude: "",
    },
  });

  const watchedValues = watch();

  // Function to handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const theatreData = {
      theaterName: data.theaterName,
      locationCoordinates: {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      },
      organizationId : organization?._id,
    };

    console.log("Theatre Data to Submit:", theatreData);
    await createTheatre(theatreData)
    

    setIsSubmitting(false);
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          control._formValues.latitude = position.coords.latitude.toFixed(6);
          control._formValues.longitude = position.coords.longitude.toFixed(6);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const isFormValid = () => {
    return (
      watchedValues.theaterName?.trim() &&
      watchedValues.latitude &&
      watchedValues.longitude &&
      !isNaN(watchedValues.latitude) &&
      !isNaN(watchedValues.longitude) &&
      Math.abs(watchedValues.latitude) <= 90 &&
      Math.abs(watchedValues.longitude) <= 180
    );
  };

  return (
    <div className="min-h-screen  pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6d27da] rounded-full ">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 ">
            Create Your Theatre
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Theatre Name */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 mr-2 text-[#6d27da]" />
                Theatre Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Controller
                name="theaterName"
                control={control}
                rules={{
                  required: "Theatre name is required",
                  minLength: {
                    value: 3,
                    message: "Theatre name must be at least 3 characters",
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter theatre name (e.g., PVR Cinemas)"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                      errors.theaterName
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#6d27da]"
                    }`}
                  />
                )}
              />
              {errors.theaterName && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  {errors.theaterName.message}
                </p>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#6d27da]" />
                  Location Coordinates
                </h3>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#6d27da] border-2 border-[#6d27da] rounded-lg hover:bg-[#6d27da] hover:text-white transition-all duration-200 font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  Use Current Location
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latitude */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Controller
                    name="latitude"
                    control={control}
                    rules={{
                      required: "Latitude is required",
                      validate: {
                        isNumber: (value) =>
                          !isNaN(value) || "Must be a valid number",
                        validRange: (value) =>
                          Math.abs(value) <= 90 ||
                          "Latitude must be between -90 and 90",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="19.0760"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                          errors.latitude
                            ? "border-red-500"
                            : "border-gray-300 focus:border-[#6d27da]"
                        }`}
                      />
                    )}
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Controller
                    name="longitude"
                    control={control}
                    rules={{
                      required: "Longitude is required",
                      validate: {
                        isNumber: (value) =>
                          !isNaN(value) || "Must be a valid number",
                        validRange: (value) =>
                          Math.abs(value) <= 180 ||
                          "Longitude must be between -180 and 180",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="72.8777"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                          errors.longitude
                            ? "border-red-500"
                            : "border-gray-300 focus:border-[#6d27da]"
                        }`}
                      />
                    )}
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Enter the geographical coordinates of your theatre location.
                  You can use the button above to automatically detect your
                  current location.
                </p>
              </div>
            </div>

            {/* Preview Card */}
            {isFormValid() && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Preview
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Building2 className="w-4 h-4 mr-2 text-[#6d27da]" />
                    <span className="font-medium">Theatre:</span>
                    <span className="ml-2">{watchedValues.theaterName}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-[#6d27da]" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">
                      {watchedValues.latitude}, {watchedValues.longitude}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                  isFormValid() && !isSubmitting
                    ? "bg-[#6d27da] hover:bg-[#5a1fb8] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-zinc-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Theatre...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Create Theatre
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            What's Next?
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 ml-7">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              After creating your theatre, you can add screens/halls
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Configure seating arrangements for each screen
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              Start scheduling shows and events
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTheatrePage;
