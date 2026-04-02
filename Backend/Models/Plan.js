import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },

    features: [
      {
        type: String,
        trim: true,
      },
    ],

    popular: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    // 🔥 Extra fields (good for scaling)
    level: {
      type: Number,
      required: true,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
  }
);

// ✅ Default export (IMPORTANT)
const Plan = mongoose.model("Plan", planSchema);
export default Plan;