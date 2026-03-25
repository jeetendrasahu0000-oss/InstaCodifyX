// Backend/Models/Problem.js
import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags:        [{ type: String }],
  inputFormat:  { type: String },
  outputFormat: { type: String },
  constraints:  { type: String },
  sampleTestCases: [{
    input:       { type: String },
    output:      { type: String },
    explanation: { type: String }
  }],
  hiddenTestCases: [{
    input:  { type: String },
    output: { type: String }
  }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Problem', ProblemSchema);