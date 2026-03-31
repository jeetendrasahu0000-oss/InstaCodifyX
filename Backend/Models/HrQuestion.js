import mongoose from "mongoose";

const hrQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["text", "mcq"], default: "text" },
  options: [String],

  experienceLevel: {
    type: String,
    enum: ["fresher", "0-6", "6-12", "1-2", "2+"],
    required: true
  },

  category: {
    type: String,
    enum: ["HR", "Technical", "Behavioral"],
    default: "HR"
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("HrQuestion", hrQuestionSchema);