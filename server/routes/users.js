const express = require('express');
const Event   = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users/dashboard
 * Returns two lists:
 *   - createdEvents  : events the user created
 *   - attendingEvents: events the user RSVP'd to (excluding their own)
 * Plus summary stats.
 */
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now    = new Date();

    const [createdEvents, attendingEvents] = await Promise.all([
      Event.find({ createdBy: userId })
        .sort({ date: -1 })
        .populate('createdBy', 'name avatarUrl')
        .lean({ virtuals: true }),

      Event.find({
        attendees: userId,
        createdBy: { $ne: userId }, // exclude own events
      })
        .sort({ date: 1 })
        .populate('createdBy', 'name avatarUrl')
        .lean({ virtuals: true }),
    ]);

    res.json({
      createdEvents,
      attendingEvents: attendingEvents.map((e) => ({ ...e, hasRsvp: true })),
      stats: {
        totalCreated:     createdEvents.length,
        totalAttending:   attendingEvents.length,
        upcomingCreated:  createdEvents.filter((e) => new Date(e.date) > now).length,
        upcomingAttending: attendingEvents.filter((e) => new Date(e.date) > now).length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
