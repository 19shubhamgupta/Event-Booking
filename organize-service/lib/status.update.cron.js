const cron = require("node-cron");
const Event = require("../models/event");
const kafkaProducer = require("./kafkaProducer");
const show = require("../models/show");

class EventStatusScheduler {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Initialize all cron jobs
   */
  init() {
    console.log("🕐 Initializing Event Status Scheduler...");

    // Run every minute to check for status changes
    this.scheduleBookingOpenJob();
    this.scheduleBookingCloseJob();
    this.scheduleBookingOpenForShowJob();
    this.scheduleBookingCloseForShowJob();

    console.log("✅ Event Status Scheduler initialized");
  }

  //schedule shows when booking is open
  scheduleBookingOpenForShowJob() {
    const job = cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        const currShows = await show
          .find({
            showStatus: "scheduled",
            bookingOpenDate: { $lte: now },
          })
          .limit(50)
          .select("_id");

        if (currShows.length > 0) {
          console.log(
            `📢 Found ${currShows.length} shows to open for booking`
          );
          for (const id of currShows) {
            const cShow = await show.findByIdAndUpdate(
              id,
              {
                $set: {
                  showStatus: "booking_open",
                },
              }
            );
            console.log(
              `📢 Show booking opened for show: ${cShow.movieName} at ${cShow.showTime}  `
            );
            await kafkaProducer.publish("event.updated", {
              eventId: cShow._id.toString(),
              eventStatus: "booking_open",
              updatedAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("❌ Error in show booking open scheduler:", error);
      }
    });

    this.jobs.set("show-booking-open", job);
    console.log("✅ Show booking open scheduler started");
  }

  //schedule shows when booking is closed
  scheduleBookingCloseForShowJob() {
    const job = cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        const currShows = await show
          .find({
            showStatus: { $in: ["booking_open", "sold_out"] },
            bookingCloseDate: { $lte: now },
          })
          .limit(50)
          .select("_id");

        if (currShows.length > 0) {
          console.log(
            `🔒 Found ${currShows.length} shows to close booking`
          );
          for (const id of currShows) {
            const cShow = await show.findByIdAndUpdate(
              id,
              {
                $set: {
                  showStatus: "booking_closed",
                },
              }
            );
            console.log(
              `🔒 Show booking closed for show: ${cShow.movieName} at ${cShow.showTime}  `
            );
            await kafkaProducer.publish("event.updated", {
              eventId: cShow._id.toString(),
              eventStatus: "booking_closed",
              updatedAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("❌ Error in show booking close scheduler:", error);
      }
    });

    this.jobs.set("show-booking-close", job);
    console.log("✅ Show booking close scheduler started");
  }

  /**
   * Check and update events from "scheduled" to "booking_open"
   * Runs every minute
   */
  scheduleBookingOpenJob() {
    const job = cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        // Find events that should transition to booking_open
        const eventsToOpen = await Event.find({
          eventStatus: "scheduled",
          bookingOpenDate: { $lte: now },
        });

        if (eventsToOpen.length > 0) {
          console.log(
            `📢 Found ${eventsToOpen.length} events to open for booking`
          );

          for (const event of eventsToOpen) {
            await this.transitionToBookingOpen(event);
          }
        }
      } catch (error) {
        console.error("❌ Error in booking open scheduler:", error);
      }
    });

    this.jobs.set("booking-open", job);
    console.log("✅ Booking open scheduler started");
  }

  /**
   * Check and update events from "booking_open" to "booking_closed"
   * Runs every minute
   */
  scheduleBookingCloseJob() {
    const job = cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        // Find events that should transition to booking_closed
        const eventsToClose = await Event.find({
          eventStatus: { $in: ["booking_open", "sold_out"] },
          bookingCloseDate: { $lte: now },
        });

        if (eventsToClose.length > 0) {
          console.log(
            `🔒 Found ${eventsToClose.length} events to close booking`
          );

          for (const event of eventsToClose) {
            await this.transitionToBookingClosed(event);
          }
        }
      } catch (error) {
        console.error("❌ Error in booking close scheduler:", error);
      }
    });

    this.jobs.set("booking-close", job);
    console.log("✅ Booking close scheduler started");
  }

  /**
   * Transition event to booking_open status
   */
  async transitionToBookingOpen(event) {
    try {
      console.log(
        `📢 Opening booking for event: ${event._id} - ${event.title}`
      );

      // Update event status
      event.eventStatus = "booking_open";
      await event.save();

      // Publish to Kafka
      await kafkaProducer.publish("event.updated", {
        eventId: event._id.toString(),
        organizationId: event.organizationId,
        eventStatus: "booking_open",
        title: event.title,
        bookingOpenDate: event.bookingOpenDate,
        updatedAt: new Date(),
      });

      console.log(`✅ Event ${event._id} booking opened successfully`);
    } catch (error) {
      console.error(`❌ Error opening booking for event ${event._id}:`, error);
    }
  }

  /**
   * Transition event to booking_closed status
   */
  async transitionToBookingClosed(event) {
    try {
      console.log(
        `🔒 Closing booking for event: ${event._id} - ${event.title}`
      );

      const previousStatus = event.eventStatus;

      // Update event status
      event.eventStatus = "booking_closed";
      await event.save();

      // Publish to Kafka
      await kafkaProducer.publish("event.updated", {
        eventId: event._id.toString(),
        organizationId: event.organizationId,
        eventStatus: "booking_closed",
        previousStatus: previousStatus,
        title: event.title,
        bookingCloseDate: event.bookingCloseDate,
        updatedAt: new Date(),
      });

      console.log(`✅ Event ${event._id} booking closed successfully`);
    } catch (error) {
      console.error(`❌ Error closing booking for event ${event._id}:`, error);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAll() {
    console.log("⏸️  Stopping all event status schedulers...");
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`✅ Stopped ${name} scheduler`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
      };
    });
    return status;
  }

  /**
   * Manually trigger booking open check
   */
  async triggerBookingOpenCheck() {
    console.log("🔄 Manually triggering booking open check...");
    const now = new Date();

    const eventsToOpen = await Event.find({
      eventStatus: "scheduled",
      bookingOpenDate: { $lte: now },
    });

    console.log(`Found ${eventsToOpen.length} events to open`);

    for (const event of eventsToOpen) {
      await this.transitionToBookingOpen(event);
    }

    return eventsToOpen.length;
  }

  /**
   * Manually trigger booking close check
   */
  async triggerBookingCloseCheck() {
    console.log("🔄 Manually triggering booking close check...");
    const now = new Date();

    const eventsToClose = await Event.find({
      eventStatus: { $in: ["booking_open", "sold_out"] },
      bookingCloseDate: { $lte: now },
    });

    console.log(`Found ${eventsToClose.length} events to close`);

    for (const event of eventsToClose) {
      await this.transitionToBookingClosed(event);
    }

    return eventsToClose.length;
  }
}

module.exports = new EventStatusScheduler();
