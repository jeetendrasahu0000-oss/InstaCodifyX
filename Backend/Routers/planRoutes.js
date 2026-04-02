import express from "express";
import Plan from "../Models/Plan.js";

const router = express.Router();

// ✅ GET all plans (pass ?all=true to get inactive ones too)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { active: true };
    const plans = await Plan.find(filter).sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    console.error("❌ GET PLANS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADD PLAN
router.post("/add", async (req, res) => {
  try {
    console.log("📥 CREATE PLAN BODY:", req.body); // debug log
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    console.error("❌ CREATE PLAN ERROR:", err.message);
    // Send validation details to frontend
    res.status(500).json({ message: err.message });
  }
});

// ✅ EDIT PLAN — fixed deprecation warning
router.put("/edit/:id", async (req, res) => {
  try {
    console.log("📝 EDIT PLAN BODY:", req.body); // debug log
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true } // ✅ fixed
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(updatedPlan);
  } catch (err) {
    console.error("❌ EDIT PLAN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUBLISH / UNPUBLISH PLAN
router.patch("/toggle/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    plan.active = !plan.active;
    await plan.save();

    res.json({
      message: `Plan ${plan.active ? "published" : "unpublished"}`,
      plan,
    });
  } catch (err) {
    console.error("❌ TOGGLE PLAN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;