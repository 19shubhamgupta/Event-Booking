import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useTheatreStore = create((set, get) => ({
  // states
  theatre: null, // Will store single theatre object (one org = one theatre)
  fetchingTheatre: false,
  creatingTheatre: false,
  showDetails: null,
  screenData: null,
  fetchingShow: false,

  //actions
  getTheatreByOwnerId: async (ownerId) => {
    try {
      set({ fetchingTheatre: true });
      // Backend extracts organizationId from JWT token
      const res = await axiosInstance.get(
        `/organize/theater/get-theaters-by-organization/${ownerId}`
      );
      console.log("theatre data from store", res.data);

      if (res.data && res.data.length > 0) {
        set({ theatre: res.data[0] }); // Take first theatre
      } else {
        set({ theatre: null });
      }

      set({ fetchingTheatre: false });
    } catch (error) {
      console.error("Error fetching theatre by owner ID:", error);
      set({ fetchingTheatre: false, theatre: null });
    }
  },

  createTheatre: async (theatreData) => {
    try {
      set({ creatingTheatre: true });
      const res = await axiosInstance.post(
        "/organize/theater/add-theater",
        theatreData
      );

      if (res.data) {
        set({ theatre: res.data }); // Set single theatre object
        toast.success("Theatre created successfully!");
      }

      set({ creatingTheatre: false });
      console.log("theatre created:", res.data);
      return res.data; // Return created theatre
    } catch (error) {
      console.error("Error creating theatre:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to create theatre. Please try again.";
      toast.error(errorMsg);
      set({ creatingTheatre: false });
      return null;
    }
  },

  createScreen: async (screenData) => {
    try {
      const res = await axiosInstance.post(
        "/organize/screen/add-screen",
        screenData
      );
      console.log("screen created:", res.data);
      toast.success("Screen created successfully!");
    } catch (error) {
      console.error("Error creating screen:", error);
      toast.error("Failed to create screen. Please try again.");
    }
  },

  createShow: async (showData) => {
    try {
      const res = await axiosInstance.post("/organize/show/add-show", showData);
      toast.success("Show created successfully!");
      console.log("show created:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error creating show:", error);
      toast.error("Failed to create show. Please try again.");
    }
  },

  getScreenById: async (screenId) => {
    try {
      const res = await axiosInstance.get(
        `/organize/screen/get-screen/${screenId}`
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching screen:", error);
      toast.error("Failed to fetch screen details");
      return null;
    }
  },

  getShowsOfMovieByTheatre: async (movieId, date) => {
    try {
      const res = await axiosInstance.get(
        `/organize/show/get-shows-by-movie-and-date-and-theatre?movieId=${movieId}&date=${date}`
      );
      if (res.data.message === "No shows found for the given criteria") {
        toast.error("No shows found for the selected movie on this date");
        return;
      }
      if (res.data.message === "Shows fetched successfully") {
        return res.data.data;
      }
    } catch (err) {
      console.log("Error fetching shows of movie by theatre: ", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to fetch shows for the selected movie"
      );
    }
  },

  getMoviesIdTitle: async () => {
    try {
      const res = await axiosInstance.get(
        `/organize/movie/get-all-movies-id-title`
      );
      console.log("API Response in store:", res.data);
      return res.data || []; // res.data is already the array
    } catch (err) {
      console.log("Error fetching movies id and title: ", err);
      toast.error("Failed to fetch movies");
      return []; // Return empty array on error
    }
  },

  getShowById: async (showId) => {
    try {
      set({ fetchingShow: true, showDetails: null, screenData: null });
      const res = await axiosInstance.get(`/organize/show/get-show/${showId}`);

      set({ showDetails: res.data });

      if (res.data.screenId) {
        set({ screenData: res.data.screenId });
      }

      set({ fetchingShow: false });
      return res.data;
    } catch (error) {
      console.error("Error fetching show:", error);
      toast.error("Failed to load show details");
      set({ fetchingShow: false, showDetails: null, screenData: null });
      return null;
    }
  },
}));
