import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    planId: String,
    planName: String,
    amount: Number,
    status: {
      type: String,
      default: "active",
    },
    startDate: Date,
    endDate: Date,
    paymentId: String,
    orderId: String,
    emailSent: Boolean,
    expirySent: Boolean,
  },
  { timestamps: true },
);

export default mongoose.model("Subscription", subscriptionSchema);
