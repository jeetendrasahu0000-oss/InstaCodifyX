import HrQuestion from "../Models/HrQuestion.js";
import InterviewSchedule from "../Models/InterviewSchedule.js";
import InterviewAnswer from "../Models/InterviewAnswer.js";
import { sendInterviewMail } from "../Utils/sendEmailInterviewSchedule.js";
import { createGoogleMeet } from "../Utils/googleMeet.js";

// ───────────────────────────────
// Add HR Question (ADMIN ONLY)
// ───────────────────────────────
export const addQuestion = async (req, res) => {
  try {
    const { question, experienceLevel, difficulty } = req.body;

    if (!question || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: "Question and experience level are required",
      });
    }

    const newQuestion = await HrQuestion.create({
      question,
      experienceLevel,
      difficulty: difficulty || "easy",
      createdBy: req.admin._id,
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (err) {
    console.error("Add Question Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────
// Get HR Questions (ADMIN + USER)
// ───────────────────────────────
export const getQuestions = async (req, res) => {
  try {
    const { experience } = req.query;
    const filter = experience ? { experienceLevel: experience } : {};
    const questions = await HrQuestion.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: questions.length, questions });
  } catch (err) {
    console.error("Get Questions Error:", err);
    res.status(500).json({ message: "Error fetching questions" });
  }
};

// ───────────────────────────────
// Edit HR Question (ADMIN ONLY)
// ───────────────────────────────
export const editQuestion = async (req, res) => {
  try {
    const { question, experienceLevel, difficulty } = req.body;

    const updated = await HrQuestion.findByIdAndUpdate(
      req.params.id,
      { question, experienceLevel, difficulty },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ success: true, question: updated });
  } catch (err) {
    console.error("Edit Question Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────
// Delete HR Question (ADMIN ONLY)
// ───────────────────────────────
export const deleteQuestion = async (req, res) => {
  try {
    const deleted = await HrQuestion.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (err) {
    console.error("Delete Question Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Backend/Controller/hrController.js  (scheduling section — add/replace these functions)

// ───────────────────────────────
// Schedule Interview (USER ONLY)
// POST /hr/schedule
// ───────────────────────────────
export const scheduleInterview = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const { name, date, time, email, accessToken } = req.body;

    if (!name || !date || !time || !email)
      return res.status(400).json({ message: "All fields are required" });

    if (!accessToken)
      return res.status(400).json({ message: "Google Calendar not connected" });

    const meetLink = await createGoogleMeet({
      summary: `Interview with ${name}`,
      date,
      time,
      attendees: [email],
      accessToken,
    });

    const schedule = await InterviewSchedule.create({
      userId,
      candidateName: name,
      email,
      date,
      time,
      meetingLink: meetLink,
      status: "pending",
    });

    await sendInterviewMail({
      to: email,
      candidateName: name,
      date,
      time,
      meetingLink: meetLink,
    });

    return res
      .status(200)
      .json({ success: true, meetingLink: meetLink, schedule });
  } catch (err) {
    console.error("scheduleInterview Error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to schedule interview" });
  }
};

// ───────────────────────────────
// Get All Schedules (ADMIN ONLY)
// GET /hr/all-schedules
// ───────────────────────────────
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await InterviewSchedule.find()
      .populate("userId", "name email",)
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, count: schedules.length, schedules });
  } catch (err) {
    console.error("getAllSchedules Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────
// Update Interview Status (ADMIN ONLY)
// PUT /hr/status/:id
// ───────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const update = {};
    if (status) update.status = status;
    if (meetingLink) update.meetingLink = meetingLink;

    const updated = await InterviewSchedule.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true },
    );

    if (!updated)
      return res.status(404).json({ message: "Interview not found" });

    return res.status(200).json({ success: true, schedule: updated });
  } catch (err) {
    console.error("updateStatus Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────
// Submit User Answers (USER ONLY)
// ───────────────────────────────
export const submitAnswers = async (req, res) => {
  try {
    const { answers, experienceLevel } = req.body;
    // answers = [{ questionId, answer }, ...]

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers array required" });
    }

    const saved = await InterviewAnswer.insertMany(
      answers.map((a) => ({
        question: a.questionId,
        answer: a.answer,
        user: req.user._id,
        experienceLevel: experienceLevel || "fresher",
      })),
    );

    res.status(201).json({
      success: true,
      message: "Answers submitted successfully",
      count: saved.length,
    });
  } catch (err) {
    console.error("Submit Answers Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ───────────────────────────────────────────────────
// Get All Students Who Submitted Answers (ADMIN ONLY)
// ───────────────────────────────────────────────────
export const getStudentSubmissions = async (req, res) => {
  try {
    // Group by user — distinct users who submitted
    const submissions = await InterviewAnswer.aggregate([
      {
        $group: {
          _id: "$user",
          totalAnswers: { $sum: 1 },
          experienceLevel: { $first: "$experienceLevel" },
          submittedAt: { $max: "$createdAt" },
        },
      },
      { $sort: { submittedAt: -1 } },
    ]);

    // Populate user info
    const populated = await InterviewAnswer.populate(submissions, {
      path: "_id",
      model: "User",
      select: "name email",
    });

    const result = populated.map((s) => ({
      user: s._id,
      totalAnswers: s.totalAnswers,
      experienceLevel: s.experienceLevel,
      submittedAt: s.submittedAt,
    }));

    res.status(200).json({ success: true, students: result });
  } catch (err) {
    console.error("Get Student Submissions Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// Get One Student's All Q&A (ADMIN ONLY)
// GET /hr/student-answers/:userId
// ─────────────────────────────────────────────────────────
export const getStudentAnswers = async (req, res) => {
  try {
    const answers = await InterviewAnswer.find({ user: req.params.userId })
      .populate("question", "question experienceLevel difficulty")
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    if (!answers.length) {
      return res
        .status(404)
        .json({ message: "No answers found for this user" });
    }

    res.status(200).json({ success: true, answers });
  } catch (err) {
    console.error("Get Student Answers Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────
// Give Feedback on Student Answer (ADMIN ONLY)
// PUT /hr/feedback/:answerId
// ─────────────────────────────────────────────────────────
export const giveFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback?.trim()) {
      return res.status(400).json({ message: "Feedback text required" });
    }

    const updated = await InterviewAnswer.findByIdAndUpdate(
      req.params.answerId,
      {
        feedback,
        feedbackGivenAt: new Date(),
        feedbackGivenBy: req.admin._id,
      },
      { new: true },
    ).populate("question", "question");

    if (!updated) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.status(200).json({ success: true, answer: updated });
  } catch (err) {
    console.error("Give Feedback Error:", err);
    res.status(500).json({ message: err.message });
  }
};
