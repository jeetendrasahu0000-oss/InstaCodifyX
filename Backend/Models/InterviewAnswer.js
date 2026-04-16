import mongoose from "mongoose";

const interviewAnswerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HrQuestion",
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["fresher", "0-6", "6-12", "1-2", "2+"],
    },
    feedback: {
      type: String,
      default: "",
    },
    feedbackGivenAt: {
      type: Date,
    },
    feedbackGivenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

export default mongoose.model("InterviewAnswer", interviewAnswerSchema);
