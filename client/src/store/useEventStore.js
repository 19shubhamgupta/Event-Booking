import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useEventStore = create((set) => ({
  // states
  isloadingUpcoming: false,
  isLoadingCatPage: false,
  isLoading: false,

  upComingEvents: null,
  eventOne: null,
  eventTwo: null,
  eventThree: null,

  eventData: null,
  eventPage: null,

  //actions

  getUpcoming: async (page = 1) => {
    set({ isLoadingUpcoming: true });
    try {
      const res = await axiosInstance.get(
        `/events/view/get-upcoming-events?page=${page}`
      );
      set((state) => ({
        upComingEvents:
          page === 1
            ? res.data.events
            : [...(state.upComingEvents || []), ...res.data.events],
        isLoadingUpcoming: false,
      }));
      console.log("up com in getUpcoming : ", res.data.events)
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Loading Failed");
      } else {
        toast.error("Network error — please try again");
      }
      set({ isLoadingUpcoming: false });
    }
  },

  getEventByCat: async (page = 1, category = "all") => {
    set({ isLoadingCatPage: true });
    try {
      const res = await axiosInstance.get(
        `/events/view/get-category-events?category=${category}&page=${page}`
      );

      if (category === "all" && page === 1) {
        // Store top 3 categories with their name, count, and events
        const updates = { isLoadingCatPage: false };
        res.data.categories.forEach((cat, index) => {
          if (index === 0) updates.eventOne = cat;
          if (index === 1) updates.eventTwo = cat;
          if (index === 2) updates.eventThree = cat;
        });
        set(updates);
      } else if (category !== "all") {
        // Specific category with pagination
        set((state) => {
          const updates = { isLoadingCatPage: false };

          // Check which event category matches and update accordingly
          if (state.eventOne?.category === category) {
            updates.eventOne = {
              ...state.eventOne,
              events:
                page === 1
                  ? res.data.events
                  : [...(state.eventOne.events || []), ...res.data.events],
            };
          } else if (state.eventTwo?.category === category) {
            updates.eventTwo = {
              ...state.eventTwo,
              events:
                page === 1
                  ? res.data.events
                  : [...(state.eventTwo.events || []), ...res.data.events],
            };
          } else if (state.eventThree?.category === category) {
            updates.eventThree = {
              ...state.eventThree,
              events:
                page === 1
                  ? res.data.events
                  : [...(state.eventThree.events || []), ...res.data.events],
            };
          }

          return updates;
        });
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Loading Failed");
      } else {
        toast.error("Network error — please try again");
      }
      set({ isLoadingCatPage: false });
    }
  },

  getEventPage: async (pageId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(`/organize/page/get-page/${pageId}`);
      set({
        eventPage: res.data,
      });
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Loading Page Failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isLoading: false });
    }
  },

  selectEvent: (eventD) => {
    set({ eventData: eventD });
  },
}));
