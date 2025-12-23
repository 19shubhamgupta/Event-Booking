import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useOrganizationStore = create((set) => ({
  // states
  verifyingOrganization: false,
  organization: null,
  creatingEventId: null,
  creatingOrganization: false,
  creatingInventory: false,

  creatingEvent: false,

  //actions
  verifyOrganization: async () => {
    try {
      set({ verifyingOrganization: true });
      const res = await axiosInstance.get("/organize/organization/verify");
      set({ organization: res.data });
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Verififaction Failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ verifyingOrganization: false });
    }
  },

  createOrganiz: async (data) => {
    try {
      set({ creatingOrganization: true });
      const res = await axiosInstance.post(
        "/organize/organization/create-organization",
        data
      );
      set({ organization: res.data });

      // 🔥 Refresh JWT token to include organizationId
      // Wait for Kafka to process event and update DB (small delay)
      setTimeout(async () => {
        try {
          await axiosInstance.post("/user/auth/refresh-token");
          console.log("✅ Token refreshed with organization data");
          toast.success("Organization created successfully!");
        } catch (refreshError) {
          console.warn("Token refresh failed (non-critical):", refreshError);
          toast.success("Organization created! Please refresh the page.");
        }
      }, 1000); // 1 second delay for Kafka processing
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Creation Failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ creatingOrganization: false });
    }
  },

  createEventOndb: async function (eventData) {
    try {
      set({ creatingEvent: true });
      const eData = {
        eventData,
      };
      const res = await axiosInstance.post(
        "/organize/organization/create-event",
        eData
      );

      set({ creatingEventId: res.data._id });

      // Set the necessary event deatils to to organization
      //set((state)=>{
      //   state.organization : {
      //     ...organization,

      //   }
      // })
      console.log("res from server after creating event : ", res.data);
      toast.success("Event created Successfully");
      return res.data.pageId;
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Creation Failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ creatingEvent: false });
    }
  },

  createInventory: async (data) => {
    try {
      set({ creatingInventory: true });
      const iData = {
        organizationId: data.organizationId,
        eventId: data.eventId,
        ticketConfiguration: data.ticketConfiguration,
        bookingSettings: data.bookingSettings,

      };
      const res = await axiosInstance.post(
        "/booking/inventory/create-inventory",
        iData
      );
console.log("res from server after creating inventory : ", res.data);
      toast.success("Event Inventory created Successfully");
    } catch (err) {
      console.log("error in creating inventory : ", err);
      if (err.response) {
        toast.error(err.response.data?.message || "Creation Failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ creatingInventory: false });
    }
  },
}));
