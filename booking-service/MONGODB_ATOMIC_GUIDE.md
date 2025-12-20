# Complete Guide to MongoDB Atomic Operations & Transactions

## Part 1: Understanding the Basics

### What is "Atomic"?
**Atomic = All or Nothing**
- Either the entire operation succeeds
- Or nothing changes at all
- No partial updates

### Two Approaches in MongoDB:

#### 1. **Atomic Operations** (Single Document)
```javascript
// One document updated atomically
await Model.findOneAndUpdate(query, update);
```
- ✅ Fast (no session overhead)
- ✅ Built-in atomicity
- ❌ Only works for ONE document

#### 2. **Transactions** (Multiple Documents/Collections)
```javascript
// Multiple operations across documents/collections
const session = await mongoose.startSession();
session.startTransaction();
await Model1.update({}, {}, { session });
await Model2.create([{}], { session });
await session.commitTransaction();
```
- ✅ Works across multiple documents/collections
- ✅ All succeed or all rollback
- ❌ Slower (session overhead)

---

## Part 2: MongoDB Update Operators (The Building Blocks)

### **$set** - Replace field value
```javascript
// Set specific fields
{ $set: { status: 'active', updatedAt: new Date() } }

// Before: { name: 'John', age: 25 }
// After:  { name: 'John', age: 30 }
```

### **$inc** - Increment/Decrement numbers
```javascript
// Increment (positive number)
{ $inc: { views: 1, likes: 5 } }

// Decrement (negative number)
{ $inc: { stock: -10, price: -5.99 } }

// Before: { stock: 100, price: 20 }
// After:  { stock: 90, price: 14.01 }
```

### **$push** - Add to array
```javascript
// Add single item
{ $push: { comments: 'Great post!' } }

// Add multiple items
{ $push: { tags: { $each: ['mongodb', 'nodejs'] } } }

// Add at specific position
{ $push: { items: { $each: ['new'], $position: 0 } } }
```

### **$pull** - Remove from array
```javascript
// Remove by value
{ $pull: { tags: 'deprecated' } }

// Remove by condition
{ $pull: { scores: { $lt: 50 } } }
```

### **$addToSet** - Add to array (no duplicates)
```javascript
// Only adds if not already present
{ $addToSet: { uniqueTags: 'nodejs' } }
```

### **$unset** - Remove field
```javascript
// Delete fields
{ $unset: { tempField: '', oldData: '' } }
```

### **$min/$max** - Update only if smaller/larger
```javascript
// Update only if new value is smaller
{ $min: { lowestPrice: 99.99 } }

// Update only if new value is larger
{ $max: { highestScore: 850 } }
```

---

## Part 3: Array Operators (Your Ticket Use Case)

### **Positional $ Operator** - Update matched array element
```javascript
// Find ticket type "VIP" and update it
await EventInventory.findOneAndUpdate(
  { 
    eventId: 'evt-123',
    'ticketTypes.type': 'VIP'  // Match this element
  },
  { 
    $inc: { 'ticketTypes.$.price': 50 }  // $ = matched element
  }
);

// Before: ticketTypes: [
//   { type: 'VIP', price: 100 },
//   { type: 'General', price: 50 }
// ]
// After: ticketTypes: [
//   { type: 'VIP', price: 150 },  ← Only this changed
//   { type: 'General', price: 50 }
// ]
```

### **$[]** - Update ALL array elements
```javascript
// Increase all ticket prices by 10%
{ $mul: { 'ticketTypes.$[].price': 1.1 } }
```

### **$[identifier]** - Update filtered elements
```javascript
// Increase only expensive tickets
await Model.updateOne(
  { eventId: 'evt-123' },
  { $inc: { 'ticketTypes.$[elem].price': 20 } },
  { arrayFilters: [{ 'elem.price': { $gt: 100 } }] }
);
```

---

## Part 4: Query Conditions (Prevent Race Conditions)

### **The Critical Pattern for Booking Systems:**

```javascript
await EventInventory.findOneAndUpdate(
  {
    eventId: 'evt-123',
    'ticketTypes.type': 'VIP',
    'ticketTypes.availableTickets': { $gte: 5 }  // ← CONDITION
  },
  {
    $inc: { 'ticketTypes.$.availableTickets': -5 }
  }
);
```

**Why the condition matters:**

❌ **Without condition (Race Condition):**
```javascript
// User A and B both want last 5 tickets
// Time 0ms: User A reads availableTickets: 5 ✅
// Time 1ms: User B reads availableTickets: 5 ✅
// Time 2ms: User A updates: 5 - 5 = 0 ✅
// Time 3ms: User B updates: 0 - 5 = -5 ❌ OVERSOLD!
```

✅ **With condition (Safe):**
```javascript
// User A and B both want last 5 tickets
// Time 0ms: User A's update: Check 5 >= 5? YES → Update to 0 ✅
// Time 1ms: User B's update: Check 0 >= 5? NO → Returns null ❌
```

### Common Query Operators:

```javascript
// Comparison
{ availableTickets: { $gte: 10 } }  // Greater than or equal
{ price: { $lt: 100 } }             // Less than
{ status: { $ne: 'cancelled' } }    // Not equal
{ age: { $in: [18, 21, 25] } }     // In array

// Logical
{ $and: [{ status: 'active' }, { tickets: { $gt: 0 } }] }
{ $or: [{ role: 'admin' }, { verified: true }] }

// Exists
{ email: { $exists: true } }        // Field exists
```

---

## Part 5: Transactions (Multi-Document Operations)

### **When to Use Transactions:**

✅ **Use when:**
- Updating MULTIPLE documents
- Updating MULTIPLE collections
- Complex operations that must all succeed together

❌ **Don't use when:**
- Single document update (use atomic operations instead)
- Read-only operations

### **Transaction Pattern:**

```javascript
async function complexOperation() {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Step 1: Operation on Collection A
    await CollectionA.findOneAndUpdate(
      { _id: 'doc1' },
      { $set: { processed: true } },
      { session }  // ← Pass session to every operation
    );
    
    // Step 2: Operation on Collection B
    await CollectionB.create([
      { relatedTo: 'doc1', data: 'something' }
    ], { session });  // ← Pass session here too
    
    // Step 3: Operation on Collection C
    await CollectionC.updateMany(
      { status: 'pending' },
      { $set: { status: 'completed' } },
      { session }
    );
    
    // If we reach here, all succeeded
    await session.commitTransaction();
    
  } catch (error) {
    // If anything fails, undo everything
    await session.abortTransaction();
    throw error;
    
  } finally {
    // Always cleanup
    session.endSession();
  }
}
```

### **Session Rules:**

1. **Pass session to EVERY operation** inside transaction
2. **Use array syntax for create()**:
   ```javascript
   // ❌ Wrong
   await Model.create({ data }, { session });
   
   // ✅ Correct
   await Model.create([{ data }], { session });
   ```
3. **Always end session** in finally block
4. **Commit or abort** - never leave hanging

---

## Part 6: Your Booking System Examples

### Example 1: Reserve Tickets (Atomic - Single Document)
```javascript
async reserveTickets(eventId, ticketType, quantity) {
  // No transaction needed - single document
  const result = await EventInventory.findOneAndUpdate(
    {
      // QUERY: Find the document AND check condition
      eventId: eventId,
      'ticketTypes.type': ticketType,
      'ticketTypes.availableTickets': { $gte: quantity }  // Safety check
    },
    {
      // UPDATE: What to change
      $inc: {
        'ticketTypes.$.availableTickets': -quantity,  // Decrease available
        'ticketTypes.$.reservedTickets': quantity,    // Increase reserved
        totalAvailable: -quantity,
        totalReserved: quantity
      }
    },
    {
      // OPTIONS
      new: true,  // Return updated document
    }
  );
  
  if (!result) {
    throw new Error('Not enough tickets');
  }
  
  return result;
}
```

### Example 2: Create Reservation + Update Inventory (Transaction)
```javascript
async createReservation(userId, eventId, tickets) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Step 1: Update inventory for each ticket type
    for (const ticket of tickets) {
      const updated = await EventInventory.findOneAndUpdate(
        {
          eventId: eventId,
          'ticketTypes.type': ticket.ticketType,
          'ticketTypes.availableTickets': { $gte: ticket.quantity }
        },
        {
          $inc: {
            'ticketTypes.$.availableTickets': -ticket.quantity,
            'ticketTypes.$.reservedTickets': ticket.quantity,
            totalAvailable: -ticket.quantity,
            totalReserved: ticket.quantity
          }
        },
        { new: true, session }  // ← session here
      );
      
      if (!updated) {
        throw new Error(`Not enough ${ticket.ticketType} tickets`);
      }
    }
    
    // Step 2: Create reservation document
    const reservation = await Reservation.create([{
      userId,
      eventId,
      tickets,
      status: 'active',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    }], { session });  // ← session here
    
    // Both operations succeeded
    await session.commitTransaction();
    return reservation[0];
    
  } catch (error) {
    // If either fails, both rollback
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Example 3: Confirm Booking (Transaction - Multiple Documents)
```javascript
async confirmBooking(reservationId, paymentId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Step 1: Get reservation
    const reservation = await Reservation.findById(reservationId).session(session);
    if (!reservation || reservation.status !== 'active') {
      throw new Error('Invalid reservation');
    }
    
    // Step 2: Move tickets from Reserved → Sold
    for (const ticket of reservation.tickets) {
      await EventInventory.findOneAndUpdate(
        {
          eventId: reservation.eventId,
          'ticketTypes.type': ticket.ticketType,
          'ticketTypes.reservedTickets': { $gte: ticket.quantity }
        },
        {
          $inc: {
            'ticketTypes.$.reservedTickets': -ticket.quantity,
            'ticketTypes.$.soldTickets': ticket.quantity,
            totalReserved: -ticket.quantity,
            totalSold: ticket.quantity
          }
        },
        { session }
      );
    }
    
    // Step 3: Update reservation
    reservation.status = 'converted';
    await reservation.save({ session });
    
    // Step 4: Create booking
    const booking = await Booking.create([{
      userId: reservation.userId,
      eventId: reservation.eventId,
      reservationId: reservationId,
      tickets: reservation.tickets,
      totalAmount: calculateTotal(reservation.tickets),
      paymentId: paymentId,
      status: 'confirmed'
    }], { session });
    
    // Step 5: Create individual tickets
    const ticketDocs = [];
    for (const ticket of reservation.tickets) {
      for (let i = 0; i < ticket.quantity; i++) {
        ticketDocs.push({
          bookingId: booking[0]._id,
          userId: reservation.userId,
          eventId: reservation.eventId,
          ticketType: ticket.ticketType,
          price: ticket.price,
          qrCode: generateQRCode(),
          status: 'active'
        });
      }
    }
    await Ticket.insertMany(ticketDocs, { session });
    
    // All 5 steps succeed together
    await session.commitTransaction();
    return booking[0];
    
  } catch (error) {
    // If any step fails, all rollback
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Part 7: Common Patterns & Best Practices

### Pattern 1: Check-Then-Update (Atomic)
```javascript
// ✅ CORRECT - Condition in query
const result = await Model.findOneAndUpdate(
  { _id: id, status: 'pending' },  // Check status atomically
  { $set: { status: 'processing' } }
);
if (!result) throw new Error('Already processed');

// ❌ WRONG - Race condition
const doc = await Model.findById(id);
if (doc.status === 'pending') {  // Another request could change this
  doc.status = 'processing';
  await doc.save();
}
```

### Pattern 2: Increment/Decrement with Limits
```javascript
// Decrease only if enough available
await Model.findOneAndUpdate(
  { productId: 'p1', stock: { $gte: 5 } },
  { $inc: { stock: -5 } }
);

// Increase with maximum limit
await Model.findOneAndUpdate(
  { userId: 'u1', credits: { $lt: 100 } },
  { $inc: { credits: 10 } }
);
```

### Pattern 3: Conditional Array Updates
```javascript
// Add item only if array size < 10
await Model.findOneAndUpdate(
  { userId: 'u1', favoriteItems: { $size: { $lt: 10 } } },
  { $push: { favoriteItems: 'item-123' } }
);

// Remove specific array element atomically
await Model.findOneAndUpdate(
  { orderId: 'o1' },
  { $pull: { items: { productId: 'p1' } } }
);
```

### Pattern 4: Optimistic Locking (Version Field)
```javascript
// Use __v field to prevent conflicts
const doc = await Model.findById(id);
const currentVersion = doc.__v;

await Model.findOneAndUpdate(
  { _id: id, __v: currentVersion },  // Only update if version matches
  { 
    $set: { data: 'new' },
    $inc: { __v: 1 }  // Increment version
  }
);
```

---

## Part 8: Practice Exercises

### Exercise 1: Transfer Credits Between Users
```javascript
// Task: Transfer 50 credits from User A to User B
// Requirements: 
// - User A must have at least 50 credits
// - Both updates must succeed or both fail
// - Prevent negative balances

async function transferCredits(fromUserId, toUserId, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Your code here
    // Hint: Use findOneAndUpdate with $gte condition
    // Hint: One operation decreases, one increases
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Exercise 2: Like a Post (Prevent Double-Like)
```javascript
// Task: User likes a post
// Requirements:
// - Increment like count
// - Add userId to likedBy array (no duplicates)
// - Both must be atomic

async function likePost(postId, userId) {
  // Your code here
  // Hint: Use $inc and $addToSet together
}
```

### Exercise 3: Batch Process Orders
```javascript
// Task: Process multiple orders at once
// Requirements:
// - Update inventory for multiple products
// - Create order document
// - All succeed or all fail

async function processOrders(orders) {
  // Your code here
  // Hint: Use transaction
  // Hint: Loop through orders inside transaction
}
```

---

## Part 9: Debugging Tips

### Check What Changed
```javascript
const result = await Model.findOneAndUpdate(
  { _id: id },
  { $inc: { count: 1 } },
  { new: true }  // Get updated document
);

console.log('Updated:', result);
```

### Handle Update Failures
```javascript
const result = await Model.findOneAndUpdate(query, update);
if (!result) {
  // Update failed - condition not met or document not found
  console.log('Update failed - check your conditions');
}
```

### Log Transaction Steps
```javascript
try {
  console.log('Starting transaction');
  await step1({ session });
  console.log('Step 1 complete');
  await step2({ session });
  console.log('Step 2 complete');
  await session.commitTransaction();
  console.log('Transaction committed');
} catch (error) {
  console.log('Transaction failed:', error);
  await session.abortTransaction();
}
```

---

## Part 10: Quick Reference

### When to Use What?

| Scenario | Use |
|----------|-----|
| Update 1 document | `findOneAndUpdate` (atomic) |
| Update multiple docs in 1 collection | `updateMany` (atomic) |
| Update 2+ collections | Transaction |
| Create + Update | Transaction |
| Read-only | No transaction needed |
| Prevent overselling | Condition in query (`$gte`) |
| Array modifications | Positional `$` operator |
| Count/Sum operations | `$inc` operator |

### Atomic Operation Template
```javascript
async atomicUpdate() {
  const result = await Model.findOneAndUpdate(
    { 
      // QUERY: Find document
      _id: id,
      // CONDITION: Safety check
      fieldToCheck: { $gte: value }
    },
    { 
      // UPDATE: Changes to make
      $inc: { field1: amount },
      $set: { field2: value }
    },
    {
      // OPTIONS
      new: true  // Return updated doc
    }
  );
  
  if (!result) {
    throw new Error('Operation failed');
  }
  
  return result;
}
```

### Transaction Template
```javascript
async transactionUpdate() {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Multiple operations with { session }
    await Model1.update({}, {}, { session });
    await Model2.create([{}], { session });
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Summary

**Key Takeaways:**
1. Use **atomic operations** for single document (faster)
2. Use **transactions** for multiple documents (safer)
3. Always add **conditions** to prevent race conditions (`$gte`, `$lte`)
4. Use **$inc** for numbers, **$push/$pull** for arrays
5. Use **positional $** to update specific array element
6. Always **pass session** to every operation in transaction
7. Always **cleanup session** in finally block

**Your Booking System:**
- Reserve: Atomic operation (single document)
- Create Reservation: Transaction (inventory + reservation)
- Confirm Booking: Transaction (inventory + reservation + booking + tickets)
- Cancel: Transaction (inventory + reservation/booking)

Now you can write any atomic operation or transaction! 🚀
