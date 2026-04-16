import mongoose from "mongoose";

const hrQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: { type: String, enum: ["text", "mcq"], default: "text" },
    options: [String],

    experienceLevel: {
      type: String,
      enum: ["fresher", "0-6", "6-12", "1-2", "2+"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

export default mongoose.model("HrQuestion", hrQuestionSchema);
