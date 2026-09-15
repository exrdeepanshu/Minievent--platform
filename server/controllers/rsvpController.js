const mongoose = require('mongoose');
const Event    = require('../models/Event');

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  CONCURRENCY-SAFE RSVP CONTROLLER
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  THE PROBLEM – Race Condition (overbooking):
 *  ─────────────────────────────────────────────
 *  If 100 users click RSVP simultaneously for the last spot,
 *  a naive "read then write" approach will fail:
 *
 *    ❌ WRONG:
 *      1. Thread A reads:  attendeeCount (9) < capacity (10) → TRUE
 *      2. Thread B reads:  attendeeCount (9) < capacity (10) → TRUE   (same stale data!)
 *      3. Thread A writes: attendeeCount = 10  ✓
 *      4. Thread B writes: attendeeCount = 11  ← overbooking! 💀
 *
 *  THE SOLUTION – MongoDB Atomic findOneAndUpdate:
 *  ────────────────────────────────────────────────
 *  MongoDB's findOneAndUpdate applies the filter condition AND the update
 *  as a SINGLE indivisible operation at the storage-engine level
 *  (WiredTiger document-level locking).
 *
 *    ✅ CORRECT:
 *      Only the first request whose filter matches will succeed.
 *      All concurrent requests that lose the race get null back → error.
 *
 *  Specifically:
 *    • $expr: { $lt: ['$attendeeCount', '$capacity'] }
 *        → Reads and checks the counter atomically within the same document.
 *    • $inc: { attendeeCount: 1 }  +  $addToSet: { attendees: userId }
 *        → Increments and appends in the same atomic write.
 *    • attendees: { $ne: userId }
 *        → Prevents duplicate RSVP in the same atomic check.
 *
 *  Additionally, the operations are wrapped in a MongoDB Session/Transaction
 *  for multi-document safety and instant rollback on any error.
 * ══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events/:id/rsvp   – join an event
// ─────────────────────────────────────────────────────────────────────────────
const joinEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: eventId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Pre-check: event exists and is in the future
    const eventInfo = await Event.findById(eventId)
      .select('date title capacity attendeeCount')
      .session(session);

    if (!eventInfo) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (new Date(eventInfo.date) < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Cannot RSVP to a past event.' });
    }

    // ─── THE CRITICAL ATOMIC OPERATION ───────────────────────────────────────
    //
    //  Filter (all must be TRUE simultaneously, checked atomically):
    //    1. _id matches the event
    //    2. attendeeCount < capacity  (spot available)
    //    3. userId NOT already in attendees  (no duplicate)
    //
    //  Update (executed only if filter passes):
    //    • attendeeCount += 1
    //    • attendees = attendees ∪ { userId }  ($addToSet is idempotent)
    //
    // ─────────────────────────────────────────────────────────────────────────
    const updated = await Event.findOneAndUpdate(
      {
        _id:          eventId,
        $expr:        { $lt: ['$attendeeCount', '$capacity'] }, // atomic capacity check
        attendees:    { $ne: userId },                          // atomic duplicate check
      },
      {
        $inc:    { attendeeCount: 1 },
        $addToSet: { attendees: userId },
      },
      { new: true, session }
    );

    if (!updated) {
      // Determine the specific reason for the failure
      const current = await Event.findById(eventId)
        .select('attendeeCount capacity attendees')
        .session(session);

      await session.abortTransaction();

      if (!current) {
        return res.status(404).json({ error: 'Event not found.' });
      }
      if (current.attendees.some((id) => id.equals(userId))) {
        return res.status(409).json({ error: 'You have already RSVP\'d to this event.' });
      }
      return res.status(400).json({
        error:     'Sorry, this event is at full capacity.',
        spotsLeft: 0,
      });
    }

    await session.commitTransaction();

    res.json({
      message:      'Successfully RSVP\'d! See you there 🎉',
      attendeeCount: updated.attendeeCount,
      spotsLeft:     Math.max(0, updated.capacity - updated.attendeeCount),
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/:id/rsvp   – cancel an RSVP
// ─────────────────────────────────────────────────────────────────────────────
const leaveEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: eventId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Atomic cancel: only succeeds if the user IS currently in attendees
    const updated = await Event.findOneAndUpdate(
      {
        _id:       eventId,
        attendees: userId,          // must be present
      },
      {
        $inc:  { attendeeCount: -1 },
        $pull: { attendees: userId },
      },
      { new: true, session }
    );

    if (!updated) {
      await session.abortTransaction();
      const exists = await Event.findById(eventId);
      if (!exists) return res.status(404).json({ error: 'Event not found.' });
      return res.status(400).json({ error: 'You are not registered for this event.' });
    }

    // Safety net: ensure attendeeCount never goes below 0
    if (updated.attendeeCount < 0) {
      await Event.findByIdAndUpdate(
        eventId,
        { $max: { attendeeCount: 0 } },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      message:       'RSVP cancelled successfully.',
      attendeeCount: Math.max(0, updated.attendeeCount),
      spotsLeft:     updated.capacity - Math.max(0, updated.attendeeCount),
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

module.exports = { joinEvent, leaveEvent };
