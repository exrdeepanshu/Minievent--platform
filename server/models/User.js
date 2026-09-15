const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // never included in query results by default
    },
    avatar: {
      type:    String,
      default: null,
    },
    bio: {
      type:      String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default:   '',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare passwords ────────────────────────────────────────
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Virtual: avatar URL (fallback to generated initials) ─────────────────────
userSchema.virtual('avatarUrl').get(function () {
  if (this.avatar) return this.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    this.name || 'User'
  )}&background=7C3AED&color=fff&bold=true&size=128`;
});

module.exports = mongoose.model('User', userSchema);
