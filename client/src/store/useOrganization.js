import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { persist } from "zustand/middleware";

export const useOrganizationStore = create(
  persist(
    (set) => ({
      // states
      verifyingOrganization: false,
      organization: null,
      creatingEventId: null,
      creatingOrganization: false,
      creatingInventory: false,
      fetchingAllDrafts: false,
      allDrafts: null,

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
              console.warn(
                "Token refresh failed (non-critical):",
                refreshError
              );
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

          // The response contains event object with _id
          const eventId =
            res.data.event?._id || res.data.eventId || res.data._id;
          console.log("Event created with ID:", eventId);
          set({ creatingEventId: eventId });

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

      // dashboard related
      getAllDrafts: async (organizationId) => {
        try {
          set({ fetchingAllDrafts: true });
          const res = await axiosInstance.get(
            `/organize/organization/get-drafts/${organizationId}`
          );
          set({ allDrafts: res.data.drafts });
          console.log("fetched all drafts : ", res.data.drafts);
        } catch (err) {
          console.log("error in fetching all drafts : ", err);
          if (err.response) {
            toast.error(err.response.data?.message || "Failed to Fetch Drafts");
          }
        } finally {
          set({ fetchingAllDrafts: false });
        }
      },

      getInventoryForDashByStatus: async (status) => {
        try {
          const res = await axiosInstance.get(
            `/dashboard/manage/get-event-inventory?status=${status}`
          );
          return res.data.inventories;
        } catch (err) {
          console.log("error in fetching inventories for dashboard : ", err);
          if (err.response) {
            toast.error(err.response.data?.message || "Failed to Fetch Drafts");
          }
        }
      },

      getInventoryById: async (inventoryId) => {
        try {
          const res = await axiosInstance.get(
            `/dashboard/manage/get-inventory-by-id/${inventoryId}`
          );
          return res.data.inventory;
        } catch (err) {
          console.log(
            "error in fetching inventory by id for dashboard : ",
            err
          );
          if (err.response) {
            toast.error(
              err.response.data?.message || "Failed to Fetch Inventory"
            );
          }
        }
      },

      // Clear creating event ID
      clearCreatingEventId: () => {
        set({ creatingEventId: null });
      },
    }),
    {
      name: "organization-storage",
      partialize: (state) => ({
        creatingEventId: state.creatingEventId,
        organization: state.organization,
      }),
    }
  )
);
