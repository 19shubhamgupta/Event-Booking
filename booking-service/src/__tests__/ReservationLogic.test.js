const { cancelReservation } = require('../../controllers/reservationController'); // adjust path to your actual file
const ReservationService = require('../../lib/SeriveClass/ReservationService');
const EventInventoryService = require('../../lib/SeriveClass/EventInventoryService');
const kafkaProducer = require('../../lib/kafkaProducer');
const mongoose = require('mongoose');

// Mock all external dependencies
jest.mock('../../lib/SeriveClass/ReservationService');
jest.mock('../../lib/SeriveClass/EventInventoryService');
jest.mock('../../lib/kafkaProducer');
jest.mock('mongoose');

describe('cancelReservation', () => {
  let mockSession;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock session object
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    // Setup default mock behavior
    mongoose.startSession.mockResolvedValue(mockSession);
  });

  test('should throw error when reservationId is missing', async () => {
    await expect(cancelReservation({})).rejects.toThrow('Reservation ID is required');
  });

  test('should throw error when reservation not found', async () => {
    ReservationService.getReservationById.mockResolvedValue(null);

    await expect(cancelReservation({ reservationId: 'nonexistent' }))
      .rejects.toThrow('No reservation found');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  test('should throw error when reservation is not in active status', async () => {
    const mockReservation = {
      _id: 'res-123',
      status: 'completed', // Not active
      tickets: [],
    };

    ReservationService.getReservationById.mockResolvedValue(mockReservation);

    await expect(cancelReservation({ reservationId: 'res-123' }))
      .rejects.toThrow('Cannot cancel reservation with status: completed');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  test('should successfully cancel an active reservation and restore inventory', async () => {
    const mockReservation = {
      _id: 'res-123',
      status: 'active',
      eventId: 'event-456',
      tickets: [
        { ticketType: 'VIP', quantity: 2 },
        { ticketType: 'General', quantity: 3 },
      ],
    };

    const mockInventoryResult = {
      eventId: 'event-456',
      organizationId: 'org-789',
      bookingSettings: { bookingCloseDate: new Date(Date.now() + 1000000) },
      isSoldOut: false,
      eventStatus: 'booking_open',
    };

    ReservationService.getReservationById.mockResolvedValue(mockReservation);
    EventInventoryService.updateInventoryOnReservationCancel.mockResolvedValue(
      mockInventoryResult
    );

    const result = await cancelReservation({ reservationId: 'res-123' });

    // Assertions
    expect(result.success).toBe(true);
    expect(result.message).toBe('Reservation cancelled successfully');
    
    // Verify transaction flow
    expect(mockSession.startTransaction).toHaveBeenCalled();
    expect(mockSession.commitTransaction).toHaveBeenCalled();

    // Verify inventory was restored for each ticket type
    expect(EventInventoryService.updateInventoryOnReservationCancel).toHaveBeenCalledTimes(2);
    expect(EventInventoryService.updateInventoryOnReservationCancel).toHaveBeenNthCalledWith(
      1,
      'event-456',
      'VIP',
      2,
      mockSession
    );
    expect(EventInventoryService.updateInventoryOnReservationCancel).toHaveBeenNthCalledWith(
      2,
      'event-456',
      'General',
      3,
      mockSession
    );

    // Verify reservation status was updated
    expect(ReservationService.updateReservationStatus).toHaveBeenCalledWith(
      'res-123',
      'active',
      'cancelled',
      mockSession
    );

    // Verify Kafka events were published
    expect(kafkaProducer.publish).toHaveBeenCalledWith('reservation.cancelled', {
      reservation: mockReservation,
    });
  });

  test('should publish event.updated when event transitions from sold_out to booking_open', async () => {
    const mockReservation = {
      _id: 'res-123',
      status: 'active',
      eventId: 'event-456',
      tickets: [{ ticketType: 'VIP', quantity: 1 }],
    };

    const mockInventoryResult = {
      eventId: 'event-456',
      organizationId: 'org-789',
      bookingSettings: { bookingCloseDate: new Date(Date.now() + 1000000) },
      isSoldOut: false,
      eventStatus: 'sold_out', // Currently sold out, will reopen
    };

    ReservationService.getReservationById.mockResolvedValue(mockReservation);
    EventInventoryService.updateInventoryOnReservationCancel.mockResolvedValue(
      mockInventoryResult
    );

    await cancelReservation({ reservationId: 'res-123' });

    // Verify event re-opening Kafka event was published
    expect(kafkaProducer.publish).toHaveBeenCalledWith('event.updated', {
      eventId: 'event-456',
      organizationId: 'org-789',
      eventStatus: 'booking_open',
    });
  });

  test('should not publish event.updated when booking period has closed', async () => {
    const mockReservation = {
      _id: 'res-123',
      status: 'active',
      eventId: 'event-456',
      tickets: [{ ticketType: 'VIP', quantity: 1 }],
    };

    const mockInventoryResult = {
      eventId: 'event-456',
      organizationId: 'org-789',
      bookingSettings: { bookingCloseDate: new Date(Date.now() - 1000000) }, // Closed in the past
      isSoldOut: false,
      eventStatus: 'sold_out',
    };

    ReservationService.getReservationById.mockResolvedValue(mockReservation);
    EventInventoryService.updateInventoryOnReservationCancel.mockResolvedValue(
      mockInventoryResult
    );

    await cancelReservation({ reservationId: 'res-123' });

    // Verify event re-opening event was NOT published because booking period closed
    const kafkaCallsWithEventUpdated = kafkaProducer.publish.mock.calls.filter(
      call => call[0] === 'event.updated'
    );
    expect(kafkaCallsWithEventUpdated.length).toBe(0);
  });

  test('should abort transaction and re-throw error on unexpected failure', async () => {
    const testError = new Error('Database connection lost');
    ReservationService.getReservationById.mockRejectedValue(testError);

    await expect(cancelReservation({ reservationId: 'res-123' }))
      .rejects.toThrow('Database connection lost');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });
});