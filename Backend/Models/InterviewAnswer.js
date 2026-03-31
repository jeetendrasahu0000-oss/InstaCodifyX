import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "HrQuestion" },
      answer: String
    }
  ]
}, { timestamps: true });

export default mongoose.model("InterviewAnswer", answerSchema);