import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useBookingStore = create((set) => ({
  // states
  creatingBooking: false,
  isProcessingPayment: false,
  fetchingInventory: false,
  inventory: null,

  //actions
  getInventoryByEventId: async (eventId) => {
    try {
      set({ fetchingInventory: true });
      const res = await axiosInstance.get(
        `/booking/inventory/get-inventory/${eventId}`
      );
      if (res.data.success) {
        set({ inventory: res.data.data });
        return res.data.data;
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to fetch tickets");
      } else {
        toast.error("Network error — please try again");
      }
      return null;
    } finally {
      set({ fetchingInventory: false });
    }
  },

  bookEvent: async (eventData) => {
    try {
      set({ creatingBooking: true });
      const res = await axiosInstance.post(
        "/booking/reserve/create-reservation",
        eventData
      );
      if (res.data.success) {
        toast.success(
          "Ticket Reservation Successful. Please Complete payment."
        );
        return res.data.reservation.reservationId;
      }
      return false;
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Reservation Failed");
      } else {
        toast.error("Network error — please try again");
      }
      return false;
    } finally {
      set({ creatingBooking: false });
    }
  },

  processingPayment: async (reservationId) => {
    try {
      set({ isProcessingPayment: true });
      const payData = {
        reservationId: reservationId,
        paymentId: `PAY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        paymentStatus: "completed",
        paidAt: new Date(),
      };
      const res = await axiosInstance.post("/payments/pay", payData);
      toast.success("Payment Successful. Created Tickets and Bookings.");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Payment Failed");
      } else {
        toast.error("Network error — please try again");
      }
      return false;
    } finally {
      set({ isProcessingPayment: false });
    }
  },

  cancellingPayment: async (reservationId) => {
    try {
      set({ isProcessingPayment: true });
      const payData = {
        reservationId: reservationId,
        paymentId: `PAY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        paymentStatus: "refunded",
        paidAt: new Date(),
      };
      const res = await axiosInstance.post("/payments/pay/cancel", payData);
      toast.success("Payment Cancel Successful.");
    } catch (err) {
      if (err.response) {
        toast.error(
          err.response.data?.message || "Payment Cancellation Failed"
        );
      } else {
        toast.error("Network error — please try again");
      }
      return false;
    } finally {
      set({ isProcessingPayment: false });
    }
  },

  cancelReservation: async (reservationId) => {
    try {
      const data = {
        reservationId: reservationId,
      };
      const res = await axiosInstance.post("/booking/reserve/cancel-reservation", data);
      toast.success("Reservation Cancelled.");
    } catch (err) {
      if (err.response) {
        toast.error(
          err.response.data?.message || "Reservation Cancellation Failed"
        );
      } else {
        toast.error("Network error — please try again");
      }
      return false;
    } 
  }
}));
