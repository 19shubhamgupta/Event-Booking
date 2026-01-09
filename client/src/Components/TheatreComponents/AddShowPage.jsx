import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTheatreStore } from "../../store/useTheatreStore";
import { Film, Clock, Calendar, Grid3x3, Save } from "lucide-react";

const AddShowPage = () => {
  const { theatre, createShow, getMoviesIdTitle } = useTheatreStore();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // real movies array - replace with actual API call later
  const [realMovies, setrealMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await getMoviesIdTitle();
        console.log("Raw response from getMoviesIdTitle:", res);
        console.log("Type of res:", typeof res, Array.isArray(res));
        if (res && Array.isArray(res)) {
          setrealMovies(res);
          console.log("Movies set successfully:", res);
        } else {
          console.error("Invalid response format:", res);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    };

    fetchMovies();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      movieId: "",
      screenId: "",
      showDate: "",
      showTime: "",
      endTime: "",
    },
  });

  const watchedValues = watch();
  const selectedScreenId = watch("screenId");

  // Get selected screen details
  const selectedScreen = theatre?.screens?.find(
    (screen) => screen._id === selectedScreenId
  );

  // Calculate total capacity for selected screen
  const getTotalCapacity = () => {
    if (!selectedScreen) return 0;
    return (
      selectedScreen.seats?.filter((seat) => seat.type !== "spacer").length || 0
    );
  };

  const onSubmit = async (data) => {
    setSubmitting(true);

    // Prepare show data
    const showData = {
      movieId: data.movieId,
      movieName: realMovies.find((movie) => movie._id === data.movieId)?.title,
      theatreId: theatre._id,
      screenId: data.screenId,
      showDate: data.showDate,
      showTime: data.showTime,
      endTime: data.endTime,
    };

    console.log("Show Data:", showData);

    const createdShow = await createShow(showData);
    setSubmitting(false);

    // Navigate to create bookings page if show was created successfully
    if (createdShow) {
      navigate(`/dashboard/create-bookings/${createdShow._id}?show=true`);
    }
  };

  if (!theatre) {
    return (
      <div className="min-h-screen bg-[#e7dbf8] pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">Please create a theatre first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e7dbf8] pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6d27da] rounded-full mb-4">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Show
          </h1>
          <p className="text-gray-600 text-lg">
            Configure show timing and ticket pricing
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Show Details Card */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Grid3x3 className="w-6 h-6 mr-2 text-[#6d27da]" />
              Show Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Movie Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Movie
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="movieId"
                  control={control}
                  rules={{ required: "Please select a movie" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.movieId
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    >
                      <option value="">Select a movie</option>
                      {console.log(
                        "Rendering movies dropdown, count:",
                        realMovies.length
                      )}
                      {realMovies && realMovies.length > 0 ? (
                        realMovies.map((movie) => (
                          <option key={movie._id} value={movie._id}>
                            {movie.title}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading movies...</option>
                      )}
                    </select>
                  )}
                />
                {errors.movieId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.movieId.message}
                  </p>
                )}
              </div>

              {/* Screen Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Screen
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="screenId"
                  control={control}
                  rules={{ required: "Please select a screen" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.screenId
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    >
                      <option value="">Select a screen</option>
                      {theatre?.screens?.map((screen) => (
                        <option key={screen._id} value={screen._id}>
                          {screen.screenName} (Capacity: {screen.capacity})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.screenId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.screenId.message}
                  </p>
                )}
              </div>

              {/* Show Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Show Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="showDate"
                  control={control}
                  rules={{ required: "Show date is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.showDate
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.showDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.showDate.message}
                  </p>
                )}
              </div>

              {/* Show Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Show Time
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="showTime"
                  control={control}
                  rules={{ required: "Show time is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="time"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.showTime
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.showTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.showTime.message}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  End Time
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="endTime"
                  control={control}
                  rules={{ required: "End time is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="time"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.endTime
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.endTime.message}
                  </p>
                )}
              </div>

              {/* Screen Capacity Display */}
              {selectedScreen && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mt-3  ">
                    Total Capacity
                  </label>
                  <div className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-xl font-bold text-[#6d27da]">
                      {getTotalCapacity()}
                    </span>
                    <span className="text-gray-600 ml-2">seats</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !watchedValues.movieId || !watchedValues.screenId || submitting
              }
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                watchedValues.movieId && watchedValues.screenId && !submitting
                  ? "bg-[#6d27da] hover:bg-[#5a1fb8]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <Save className="w-5 h-5" />
              {submitting ? "Creating..." : "Create Show"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShowPage;
