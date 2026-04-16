// Backend/src/models/Contact/contactSchema.js

import mongoose from "mongoose";

/**
 * Contact Form — Mongoose Schema
 *
 * Har ek submitted contact form entry ek document hoga is collection mein.
 * Fields:
 *  - name        : required
 *  - email       : required, validated
 *  - phone       : optional
 *  - subject     : required, enum se
 *  - message     : required, min 20 chars
 *  - status      : "pending" | "read" | "resolved"  (admin ke liye)
 *  - ipAddress   : rate limiting ke liye (optional)
 *  - timestamps  : createdAt, updatedAt auto
 */

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          // optional — only validate if provided
          if (!v) return true;
          return /^[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
        },
        message: "Please provide a valid Indian mobile number",
      },
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: {
        values: [
          "General Inquiry",
          "Bug Report",
          "Feature Request",
          "Billing & Payments",
          "Contest Issue",
          "Partnership",
          "Other",
        ],
        message: "{VALUE} is not a valid subject",
      },
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    // Admin use — track karne ke liye ki query handle hua ya nahi
    status: {
      type: String,
      enum: ["pending", "read", "resolved"],
      default: "pending",
    },

    // Optional: store submitter's IP for rate limiting / spam detection
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt automatically
    collection: "contacts",
  },
);

// Index for faster admin queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
