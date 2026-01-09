# Event Booking Platform - Architecture & Technology

## 🏗️ Architectural Philosophy

A **Domain-Driven Design (DDD)** microservices platform leveraging event-driven architecture for high-concurrency ticket booking. Each bounded context is independently deployable, maintaining its own domain model and database while communicating asynchronously through Apache Kafka.

---

## 🎯 Domain-Driven Design

**Bounded Contexts:** User, Organization, Discovery (CQRS read), Booking (TTL reservations), Payment, Dashboard

**Architecture Layers:** Controllers → Service Classes → Models → Kafka Integration

**Strategic Patterns:**
- Published Language via Kafka topics with anti-corruption layers
- Event sourcing for audit trail and projection rebuilding
- Database per service for independent scaling

---

## 🎯 Tactical Patterns

**Key Aggregates:**
- `Reservation` (Root) with TTL and state machine (active→expired/booked/cancelled)
- `Event` (Root) with Shows and ticketConfiguration
- `EventInventory` (Root) managing ticketTypes and sold-out logic

**Domain Services:** ReservationService, EventInventoryService, TicketService, BookingService for cross-aggregate coordination

**Frontend:**
- React 19 + Vite (HMR, ESM-native builds)
- Zustand (flux-like state management)
- TailwindCSS (utility-first styling)
- React Router v7 (nested routing)

#### **React 19**
- **UI Library**: Latest version of React with modern hooks and features
- **Purpose**: Building dynamic, component-based user interfaces

#### **Vite**
- **Build Tool**: Next-generation frontend tooling
- **Benefits**:
  - Lightning-fast Hot Module Replacement (HMR)
  - Optimized production builds
  - Native ES modules support

#### **React Router v7**
- **Routing**: Client-side routing and navigation
- **Features**: Nested routes, dynamic routing, and route-based code splitting

#### **Tailwind CSS v4**
- **Styling**: Utility-first CSS framework
- **Plugin**: @tailwindcss/vite for seamless Vite integration

#### **State Management - Zustand**
- **Library**: Minimal, fast, and scalable state management
- **Benefits**: Simple API, no boilerplate, React hooks-based

#### **Form Management - React Hook Form**
- **Library**: Performant form validation and management
- **Features**: Minimal re-renders, easy validation, TypeScript support

#### **UI Libraries & Components**
- **Lucide React**: Icon library with customizable SVG icons
- **React Icons**: Popular icon sets as React components
- **React Hot Toast**: Beautiful toast notifications
- **TipTap**: Headless WYSIWYG editor framework
- **DnD Kit**: Drag-and-drop toolkit for sortable interfaces

---

## 🔐 Authentication & Security

### **JWT (JSON Web Tokens)**
- **Library**: jsonwebtoken
- **Purpose**: Stateless authentication across microservices
- **Flow**: Token-based authentication with secure HTTP-only cookies

### **bcryptjs**
- **Purpose**: Password hashing with salt rounds
- **Security**: One-way encryption for secure password storage

### **Cookie-Parser**
- **Purpose**: Parse and manage HTTP cookies
- **Use Case**: Storing authentication tokens securely

### **Arctic**
- **Purpose**: OAuth 2.0 authentication library
- **Use Case**: Third-party authentication integration (Google, GitHub, etc.)

---

## 📡 Real-Time Communication

### **Server-Sent Events (SSE)**
- **Implementation**: Custom SSE manager class
- **Purpose**: Unidirectional server-to-client real-time updates
- **Use Cases**:
  - Real-time inventory updates for dashboard
  - Live booking notifications
  - Event status changes
**Authentication:**
- JWT (stateless, microservice-friendly)
- bcryptjs (password hashing)
- Arctic (OAuth 2.0 for social auth)

**Media Storage:**
- Cloudinary (image CDN with on-the-fly transformations)
- Multer + Streamifier (buffer→stream upload pipeline)
- **Use Cases**:
  - Seat reservation with inventory decrement
  - Booking creation with payment processing
  - Event creation with inventory initialization

### **Event Sourcing (via Kafka)**
Services publish domain events to Kafka topics:
- **Eventual consistency** across microservices
- **Event replay** capability for data recovery
- **Audit trail** of all system changes
- **Event Types**:
  - `event-created`, `event-updated`, `event-deleted`
  - `show-created`, `show-updated`, `show-status-changed`
  - `booking-created`, `booking-confirmed`, `booking-cancelled`
  - `inventory-updated`, `seats-reserved`, `seats-released`

---

## 🌐 API Gateway Routing

The API Gateway uses **express-http-proxy** for intelligent request routing:

| Route Path | Target Service | Port |
|------------|---------------|------|
| `/user` | User Service | 5002 |
| `/organize` | Organize Service | 5003 |
| `/events` | Event Discovery Service | 5004 |
| `/book` | Booking Service | 5005 |
| `/payment` | Payment Service | 5006 |
| `/dashboard` | Dashboard Service | 5007 |

**Features**:
- Service health monitoring
- Graceful error handling with 503 responses
- CORS handling for web clients
- Request/response logging

---

## 📊 Key Service Responsibilities

### **Organize Service**
- Manages events, movies, theaters, screens, and shows
- Handles organizer profiles and pages
- Publishes events to Kafka for other services to consume
- Automated cron jobs for show status transitions

### **Booking Service**
- Manages seat reservations with TTL (Time To Live)
- Handles booking confirmations and cancellations
- Maintains event inventory synchronization
- Automated cleanup of expired reservations via cron
- Consumes events from Kafka to sync inventory

### **Event Discovery Service**
- Provides search and filtering capabilities
- Maintains read-optimized event catalog
- Consumes events from Kafka to stay synchronized
- Separate database for query optimization (CQRS pattern)

### **Dashboard Service**
- Real-time inventory monitoring via SSE
- Analytics and reporting for organizers
- C📡 Real-Time Architecture

**Server-Sent Events (SSE):**
- Custom SSE manager with organization-based subscriptions
- Push model for dashboard inventory updates (avoids polling)
- Event filtering by `eventId` subscriptions

**Socket.IO:**
- Bidirectional WebSocket layer (ready for chat/collaboration features)
- Refund handling

---

## 🔧 Development Workflow Tools
## 🔄 Consistency & Concurrency Patterns

### MongoDB Transaction Strategies

**Atomic Operations (Single Aggregate):**
```javascript
// Optimistic concurrency with atomic decrement
EventInventory.findOneAndUpdate(
  { eventId, 'ticketTypes.type': type, 'ticketTypes.availableTickets': { $gte: qty } },
  { $inc: { 'ticketTypes.$.availableTickets': -qty, 'ticketTypes.$.reservedTickets': qty } }
);
```

**Multi-Document Transactions (Cross-Aggregate):**
```javascript
// Saga pattern: Reserve → Book → Generate Tickets
session.startTransaction();
await Reservation.update({...}, { session });
await EventInventory.update({...}, { session });
await Ticket.insertMany([...], { session });
await session.commitTransaction();
```

### Event-Driven Consistency

**Integration Events (Kafka Topics):**
- `event.scheduled` → Booking service creates inventory shadow
- `payment.complete` → Booking service confirms reservation → emits `booking.confirmed`
- `booking.confirmed` → Dashboard consumes for real-time updates

**Idempotency:**
## ⏰ Background Job Scheduling

**node-cron** for domain-driven scheduled tasks:

1. **Reservation TTL Enforcement** (Booking Service):
   - Runs every minute
   - Finds `status: 'active'` with `expiresAt < now`
   - Atomic state transition: `active` → `expired`
   - Publishes `seats-released` event for inventory restoration

2. **Show Lifecycle Manager** (Organize Service):
   - Cron jobs per status transition:
     - `bookingOpenDate` reached → `scheduled` → `booking_open`
     - `bookingCloseDate` reached → `booking_open` → `booking_closed`
   - Publishes `show.status-changed` events for downstream sync

---

## 🌐 API Gateway Pattern

**express-http-proxy** for service routing:
## 📊 Bounded Context Responsibilities

| Context | Aggregates | Key Operations | Publishes | Subscribes |
|---------|-----------|----------------|-----------|------------|
| **Organization** | Event, Show, Theatre | Event creation, show scheduling | `event.scheduled`, `show.status-changed` | - |
| **Booking** | Reservation, Booking, Ticket, EventInventory | Reserve seats, confirm booking | `booking.confirmed`, `seats-released` | `payment.complete`, `event.scheduled` |
| **Discovery** | Event (read model) | Search, filter events | - | `event.*`, `show.*` |
| **Dashboard** | Inventory (projection) | Real-time analytics | - | `booking.*`, `inventory.*` |
| **Payment** | Transaction | Process payments | `payment.complete`, `payment.failed` | `booking.created` |
| **User** | User, Profile | Authentication | `user.registered` | - |ds booking request to **API Gateway**
2. **API Gateway** routes to **Booking Service**
3. **Booking Service**:
   - Creates temporary reservation (with TTL)
   - Decrements inventory atomically using MongoDB transaction
   - Publishes `seats-reserved` event to Kafka
4. **Dashboard Service** consumes event and sends SSE update to organizer
5. **Event Discovery** consumes event and updates availability cache
6. If payment confirmed → publish `booking-confirmed` event
7. If payment fails or reservation expires → cron job releases seats and publishes `seats-released` event

---

## 🎯 Technology Choice Rationale

### Why Microservices?
- **Independent deployment** of features
- **Technology flexibility** per service
- **Fault isolation** - one service failure doesn't crash entire system
- **Team scalability** - different teams can own different services

### Why Kafka?
- **High throughput** for event streaming
- **Durability** with message persistence
- **Scalability** through partitioning
- **Replayability** for debugging and recovery

### Why MongoDB?
- **Flexible schema** for evolving event/booking models
- **Horizontal scaling** with sharding
- **Rich query language** with aggregation pipelines
- **Transaction support** for ACID operations
## 🎨 Advanced Patterns

**CQRS (Command Query Responsibility Segregation):**
- **Write side**: Organization service owns event creation
- **Read side**: Discovery service maintains denormalized, search-optimized event catalog
- Sync via Kafka: `event.created` → Discovery rebuilds read model

**Saga Pattern (Orchestration):**
```
Reserve Seats → Payment Processing → Confirm Booking → Generate Tickets
                      ↓ (failure)
                Release Seats (compensating transaction)
```

**Repository Pattern:**
- Mongoose models act as repositories
- Service classes abstract query logic from controllers
- Session injection for transactional operations

**Domain Events as First-Class Citizens:**
```javascript
// Organize Service publishes after aggregate mutation
await Event.save();
kafkaProducer.publish('event.scheduled', event);
```

---

## 🚀 Scalability Characteristics

**Horizontal Scaling:**
- Stateless services (JWT, no server-side sessions)
- Kafka consumer groups for parallel event processing
- MongoDB replica sets + sharding (future)

**Fault Tolerance:**
- Kafka message persistence (30-day retention)
- Consumer offset commits (at-least-once delivery)
- Transaction rollbacks on partial failures

**Performance Optimizations:**
- Compound indexes on high-cardinality queries
- SSE for push-based updates (eliminates polling)
- Reservation TTL with automated cleanup (prevents ghost bookings)## 📚 Critical Flow: High-Concurrency Booking

```
1. Client → API Gateway → Booking Service
2. ReservationService.createReservation():
   - Check existing active reservation (idempotency)
   - Atomic inventory check + decrement:
     findOneAndUpdate({ availableTickets: {$gte: qty} }, { $inc: {availableTickets: -qty} })
   - Create reservation with 5-min TTL
3. Payment redirect (external gateway)
4. Kafka: payment.complete → Booking Service
5. BookingService.bookTickets():
   - Transaction: Reservation(active→booked) + Inventory(reserved→sold) + Ticket generation
   - Publish booking.confirmed
6. Dashboard consumes → SSE push to organizer
7. Discovery consumes → Update search index
```

**Race Condition Mitigation:**
- MongoDB atomic ops prevent double-booking
- Pessimistic locking via `availableTickets` constraint in update query

---

## 🔮 Architectural Evolution Path

- **TypeScript** for domain model type safety
- **Redis** for distributed locks (cross-service inventory reservation)
- **Elasticsearch** for full-text search (Discovery service)
- **gRPC** for synchronous inter-service calls (reduce latency vs HTTP proxy)
- **Event Store** (EventStoreDB) for pure event sourcing
- **Kubernetes + Istio** for service mesh (observability, circuit breaking)

---

*Built with Domain-Driven Design principles, optimized for high-concurrency scenarios in event ticketing