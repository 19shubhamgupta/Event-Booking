const ticket = require("../../models/ticket");

class TicketService {
  //get ticket by id
  async getTicketById(ticketId) {
    try {
      if (!ticketId) throw "Illegal ticket id provided";
      return await ticket.findById(ticketId);
    } catch (error) {
      console.log("error in finding ticket : ", error);
    }
  }

  // create ticket (single ticket)
  async createTicket(ticketData, session) {
    try {
      const newTicket = new ticket({
        userId: ticketData.userId,
        eventId: ticketData.eventId,
        ticketType: ticketData.ticketType,
        price: ticketData.price,
        seatNumber: ticketData.seatNumber || null,
        qrCodeUrl: ticketData.qrCodeUrl || "",
        status: ticketData.status || "active",
      });

      await newTicket.save({ session });
      console.log(
        `✅ Ticket created: ${newTicket._id} for event ${newTicket.eventId} for user ${newTicket.userId}`
      );
      return newTicket;
    } catch (error) {
      console.error("Error creating ticket:", error.message);
      throw error;
    }
  }
}

module.exports = new TicketService();
