const Event       = require('../models/Event');
const { cloudinary } = require('../middleware/upload');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events  – list upcoming events with search, filter, sort & pagination
// ─────────────────────────────────────────────────────────────────────────────
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      date,
      page     = 1,
      limit    = 12,
      sort     = 'date',
      upcoming = 'true',
    } = req.query;

    const query = {};

    // Default: only future events
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    // Full-text search across title, description, location
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Specific date filter (overrides the upcoming filter)
    if (date) {
      const d0 = new Date(date); d0.setHours(0,  0,  0,   0);
      const d1 = new Date(date); d1.setHours(23, 59, 59, 999);
      query.date = { $gte: d0, $lte: d1 };
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    // Sort
    const sortMap = {
      date:     { date: 1 },
      popular:  { attendeeCount: -1 },
      newest:   { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || { date: 1 };

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('createdBy', 'name avatarUrl')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Event.countDocuments(query),
    ]);

    // Annotate each event with whether the requesting user has RSVP'd
    const userId = req.user?.id?.toString();
    const annotated = events.map((e) => ({
      ...e,
      hasRsvp: userId
        ? e.attendees.some((id) => id.toString() === userId)
        : false,
    }));

    res.json({
      events: annotated,
      pagination: {
        total,
        page:    pageNum,
        limit:   limitNum,
        pages:   Math.ceil(total / limitNum),
        hasMore: pageNum < Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/:id
// ─────────────────────────────────────────────────────────────────────────────
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email avatarUrl bio')
      .populate('attendees', 'name avatarUrl')
      .lean({ virtuals: true });

    if (!event) return res.status(404).json({ error: 'Event not found' });

    const userId   = req.user?.id?.toString();
    event.hasRsvp  = userId ? event.attendees.some((a) => a._id.toString() === userId) : false;
    event.isOwner  = userId ? event.createdBy._id.toString() === userId : false;

    res.json(event);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events  (protected)
// ─────────────────────────────────────────────────────────────────────────────
const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, date, location, capacity,
      category, tags, isOnline, meetingLink,
    } = req.body;

    const data = {
      title,
      description,
      date:       new Date(date),
      location,
      capacity:   parseInt(capacity, 10),
      category:   category || 'Other',
      createdBy:  req.user.id,
      tags:       tags
        ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean))
        : [],
      isOnline:    isOnline === 'true' || isOnline === true,
      meetingLink: meetingLink || null,
    };

    if (req.file) {
      data.imageUrl      = req.file.path;
      data.imagePublicId = req.file.filename;
    }

    const event = await Event.create(data);
    await event.populate('createdBy', 'name avatarUrl');

    res.status(201).json(event);
  } catch (err) {
    // Clean up uploaded image if DB write fails
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename).catch(console.error);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id  (protected, owner only)
// ─────────────────────────────────────────────────────────────────────────────
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to edit this event.' });
    }

    const {
      title, description, date, location, capacity,
      category, tags, isOnline, meetingLink,
    } = req.body;

    const patch = {};
    if (title)       patch.title       = title;
    if (description) patch.description = description;
    if (date)        patch.date        = new Date(date);
    if (location)    patch.location    = location;
    if (capacity) {
      const cap = parseInt(capacity, 10);
      if (cap < event.attendeeCount) {
        return res.status(400).json({
          error: `Capacity cannot be reduced below current attendee count (${event.attendeeCount}).`,
        });
      }
      patch.capacity = cap;
    }
    if (category)          patch.category    = category;
    if (tags !== undefined) {
      patch.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (isOnline !== undefined) patch.isOnline    = isOnline === 'true' || isOnline === true;
    if (meetingLink !== undefined) patch.meetingLink = meetingLink || null;

    // Replace image
    if (req.file) {
      if (event.imagePublicId) {
        await cloudinary.uploader.destroy(event.imagePublicId).catch(console.error);
      }
      patch.imageUrl      = req.file.path;
      patch.imagePublicId = req.file.filename;
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, patch, {
      new: true, runValidators: true,
    }).populate('createdBy', 'name avatarUrl');

    res.json(updated);
  } catch (err) {
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename).catch(console.error);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/:id  (protected, owner only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this event.' });
    }

    if (event.imagePublicId) {
      await cloudinary.uploader.destroy(event.imagePublicId).catch(console.error);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events/ai/describe  (protected)
// Uses Google Gemini API to auto-generate an event description
// ─────────────────────────────────────────────────────────────────────────────
const aiGenerateDescription = async (req, res, next) => {
  try {
    const { title, category, location, date } = req.body;
    if (!title) return res.status(400).json({ error: 'Event title is required.' });

    const dateStr = date
      ? new Date(date).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
      : 'TBD';

    const prompt = `Write a compelling, enthusiastic event description (100–150 words) for the following event. Include what attendees can expect, the vibe, and a call-to-action. Output ONLY the description, no headings or labels.

Event Title: ${title}
Category: ${category || 'General'}
Location: ${location || 'TBD'}
Date: ${dateStr}`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const aiRes = await fetch(apiUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        contents:         [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.85 },
      }),
    });

    if (!aiRes.ok) {
      const errBody = await aiRes.text();
      console.error('Gemini API error:', errBody);
      return res.status(503).json({ error: 'AI service is currently unavailable. Please write your description manually.' });
    }

    const data = await aiRes.json();
    const description = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!description) {
      return res.status(503).json({ error: 'AI returned an empty response. Please try again.' });
    }

    res.json({ description });
  } catch (err) {
    // Never crash the whole server over an AI feature
    res.status(503).json({ error: 'AI description generation failed. Please write it manually.' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  aiGenerateDescription,
};
