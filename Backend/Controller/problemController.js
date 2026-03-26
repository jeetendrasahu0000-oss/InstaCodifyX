// Backend/Controller/problemController.js
import Problem from "../Models/Problem.js";
import slugify from "slugify";

// ✅ Public — sirf published problems
export const getPublicProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ isPublished: true })
      .select("title slug difficulty tags createdAt")
      .populate("createdBy", "username");
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — sab problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().populate(
      "createdBy",
      "username role",
    );
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProblem = async (req, res) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const problem = await Problem.create({
      ...req.body,
      slug,
      createdBy: req.admin._id,
    });
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Not found" });

    if (
      req.admin.role === "problem-setter" &&
      problem.createdBy.toString() !== req.admin._id.toString()
    )
      return res.status(403).json({ message: "Not your problem" });

    const updated = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    problem.isPublished = !problem.isPublished;
    await problem.save();
    res.json({ isPublished: problem.isPublished });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPublicProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    }).populate("createdBy", "username");
    
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

