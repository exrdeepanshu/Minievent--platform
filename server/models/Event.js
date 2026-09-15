const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Event title is required'],
      trim:      true,
      minlength: [3,   'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type:      String,
      required:  [true, 'Event description is required'],
      minlength: [10,   'Description must be at least 10 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    date: {
      type:     Date,
      required: [true, 'Event date & time is required'],
    },
    location: {
      type:      String,
      required:  [true, 'Location is required'],
      trim:      true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    capacity: {
      type:     Number,
      required: [true, 'Capacity is required'],
      min:      [1,      'Capacity must be at least 1'],
      max:      [100000, 'Capacity cannot exceed 100,000'],
    },

    /**
     * ⚡ attendeeCount is the ATOMIC COUNTER used for concurrency control.
     *
     * We NEVER rely on attendees.length for capacity checks.
     * Instead we use findOneAndUpdate with:
     *   $expr: { $lt: ['$attendeeCount', '$capacity'] }
     * making the check + increment a single indivisible DB operation.
     */
    attendeeCount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    /** Attendee list – also updated atomically with $addToSet / $pull */
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'User',
      },
    ],

    imageUrl: {
      type:    String,
      default: null,
    },
    /** Cloudinary public_id stored so we can delete the image on event removal */
    imagePublicId: {
      type:    String,
      default: null,
    },

    category: {
      type:    String,
      enum:    [
        'Technology', 'Music', 'Sports', 'Art', 'Food',
        'Business',   'Health', 'Education', 'Entertainment', 'Other',
      ],
      default: 'Other',
    },

    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    isOnline: {
      type:    Boolean,
      default: false,
    },
    meetingLink: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
eventSchema.virtual('spotsLeft').get(function () {
  return Math.max(0, this.capacity - this.attendeeCount);
});

eventSchema.virtual('isFull').get(function () {
  return this.attendeeCount >= this.capacity;
});

eventSchema.virtual('isPast').get(function () {
  return new Date(this.date) < new Date();
});

// ── Indexes for query performance ─────────────────────────────────────────────
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ attendees: 1 });
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', eventSchema);
