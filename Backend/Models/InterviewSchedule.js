import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    date: String,
    time: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    meetingLink: String,
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSchedule", scheduleSchema);