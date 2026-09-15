const express = require('express');
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent, aiGenerateDescription,
} = require('../controllers/eventController');
const { joinEvent, leaveEvent } = require('../controllers/rsvpController');
const { protect, optionalAuth }  = require('../middleware/auth');
const { upload }                 = require('../middleware/upload');

const router = express.Router();

// ── Public (personalized when logged in) ─────────────────────────────────────
router.get('/',    optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEvent);

// ── Protected ─────────────────────────────────────────────────────────────────
router.post('/',    protect, upload.single('image'), createEvent);
router.put('/:id',  protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);

// ── AI description (protected – rate limited by global auth limiter) ──────────
// IMPORTANT: this route must be defined BEFORE /:id to avoid collision
router.post('/ai/describe', protect, aiGenerateDescription);

// ── RSVP ──────────────────────────────────────────────────────────────────────
router.post('/:id/rsvp',   protect, joinEvent);
router.delete('/:id/rsvp', protect, leaveEvent);

module.exports = router;
