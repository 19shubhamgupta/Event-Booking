const cron = require("node-cron");
const mongoose = require("mongoose");
const ReservationService = require("./ReservationService");
const EventInventoryService = require("./EventInventoryService");

let isRunning = false;

// Run every minute to clean up expired reservations
cron.schedule("*/1 * * * *", async function () {
  if (isRunning) {
    console.log("Previous cleanup still running, skipping...");
    return;
  }

  isRunning = true;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find expired reservations that haven't been processed yet
    const expiredReservations = await ReservationService.getExpiredReservations(
      session
    );

    if (expiredReservations.length === 0) {
      console.log("No expired reservations to clean up.");
      await session.abortTransaction();
      return;
    }

    console.log(
      `Processing ${expiredReservations.length} expired reservations...`
    );

    let successCount = 0;

    for (const reservation of expiredReservations) {
      try {
        // Release tickets back to inventory
        for (const ticket of reservation.tickets) {
          await EventInventoryService.updateInventoryOnReservationCancel(
            reservation.eventId,
            ticket.ticketType,
            ticket.quantity,
            session
          );
        }

        // Update reservation status
        await ReservationService.updateReservationStatus(
          reservation._id,
          "active",
          "expired",
          session
        );

        successCount++;
      } catch (error) {
        console.error(
          `Failed to expire reservation ${reservation._id}:`,
          error.message
        );
        // Continue with next reservation instead of failing entire batch
      }
    }

    await session.commitTransaction();
    console.log(`✅ Successfully expired ${successCount} reservations`);
  } catch (error) {
    console.error(
      "Error during cleanup of expired reservations:",
      error.message
    );
    await session.abortTransaction();
  } finally {
    session.endSession();
    isRunning = false; // Reset flag
  }
});

