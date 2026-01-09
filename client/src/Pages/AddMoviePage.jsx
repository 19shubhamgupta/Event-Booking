import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Film, Calendar, Clock, Star, Users, Video, Image } from "lucide-react";
import {useOrganizationStore} from "../store/useOrganization"

const AddMoviePage = () => {
  const [submitting, setSubmitting] = useState(false);
  const { createMovie } = useOrganizationStore()

  // Default values constant to reuse in placeholders
  const defaultFormValues = {
    title: "Stree 2: Sarkate Ka Aatank",
    genre: "Comedy, Horror",
    duration: "147",
    language: "Hindi",
    rating: "UA",
    releaseDate: "2024-08-15",
    cast: "Rajkummar Rao, Shraddha Kapoor, Pankaj Tripathi, Abhishek Banerjee, Aparshakti Khurana",
    director: "Amar Kaushik",
    posterUrl: "https://example.com/stree2-poster.jpg",
    trailerUrl: "https://youtube.com/watch?v=example",
    status: "now_showing",
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const watchedValues = watch();

  // Handlers to be implemented by user
  const onSubmit = async (data) => {
    setSubmitting(true);
    console.log("Movie Data:", data);

    // Parse comma-separated values
    const movieData = {
      ...data,
      genre: data.genre
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      language: data.language
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      cast: data.cast
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      duration: parseInt(data.duration),
    };

    console.log("Processed Movie Data:", movieData);

    await createMovie(movieData);

    setSubmitting(false);
  };

  const genreOptions = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Thriller",
    "Romance",
    "Sci-Fi",
    "Fantasy",
    "Adventure",
    "Documentary",
  ];

  const languageOptions = [
    "Hindi",
    "English",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Marathi",
    "Punjabi",
  ];

  return (
    <div className="min-h-screen bg-[#e7dbf8] pt-2 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6d27da] rounded-full mb-4">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add New Movie
          </h1>
          <p className="text-gray-600 text-lg">
            Fill in the movie details to add it to the system
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Film className="w-6 h-6 mr-2 text-[#6d27da]" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Movie Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Movie title is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={defaultFormValues.title}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.title
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Genre (comma-separated) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Genre
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="genre"
                  control={control}
                  rules={{ required: "Genre is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={defaultFormValues.genre}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.genre
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple genres with commas
                </p>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.genre.message}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="duration"
                  control={control}
                  rules={{
                    required: "Duration is required",
                    min: {
                      value: 1,
                      message: "Duration must be at least 1 minute",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      placeholder={defaultFormValues.duration}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.duration
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              {/* Language (comma-separated) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Language
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="language"
                  control={control}
                  rules={{ required: "Language is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={defaultFormValues.language}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.language
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple languages with commas
                </p>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.language.message}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Rating
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="rating"
                  control={control}
                  rules={{ required: "Rating is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.rating
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    >
                      <option value="">Select rating</option>
                      <option value="U">U - Universal</option>
                      <option value="UA">UA - Parental Guidance</option>
                      <option value="A">A - Adults Only</option>
                      <option value="S">S - Restricted</option>
                    </select>
                  )}
                />
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Release Date
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="releaseDate"
                  control={control}
                  rules={{ required: "Release date is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.releaseDate
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.releaseDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.releaseDate.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.status
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="now_showing">Now Showing</option>
                      <option value="archived">Archived</option>
                    </select>
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cast & Crew Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-[#6d27da]" />
              Cast & Crew
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cast (comma-separated) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cast
                </label>
                <Controller
                  name="cast"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows="3"
                      placeholder={defaultFormValues.cast}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] focus:border-[#6d27da] transition-all"
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate actor names with commas
                </p>
              </div>

              {/* Director */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Director
                </label>
                <Controller
                  name="director"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={defaultFormValues.director}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] focus:border-[#6d27da] transition-all"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Image className="w-6 h-6 mr-2 text-[#6d27da]" />
              Media
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {/* Poster URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poster URL
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="posterUrl"
                  control={control}
                  rules={{
                    required: "Poster URL is required",
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      placeholder={defaultFormValues.posterUrl}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.posterUrl
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.posterUrl && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.posterUrl.message}
                  </p>
                )}
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Video className="w-4 h-4 inline mr-1" />
                  Trailer URL
                </label>
                <Controller
                  name="trailerUrl"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      placeholder={defaultFormValues.trailerUrl}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.trailerUrl
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.trailerUrl && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.trailerUrl.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                submitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#6d27da] hover:bg-[#5a1fb8]"
              }`}
            >
              <Film className="w-5 h-5" />
              {submitting ? "Adding Movie..." : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
