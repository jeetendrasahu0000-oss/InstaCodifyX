import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    default: null
  },
  username: {
    type: String,
    unique: true,
    sparse: true,          // ← allows multiple null values (partial docs)
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    default: null
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpire: {
    type: Date,
    default: null
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpire: {
    type: Date,
    default: null
  },
  // Stats (for profile/header)
  solved: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  }
}, {
  timestamps: true
})

// TTL index — auto-delete unverified partial docs after 1 hour
userSchema.index(
  { otpExpire: 1 },
  { expireAfterSeconds: 3600, partialFilterExpression: { isVerified: false } }
)

export default mongoose.model('User', userSchema)