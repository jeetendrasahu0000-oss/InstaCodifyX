import express from "express";
import Plan from "../Models/Plan.js";
 
const router = express.Router();
 
// GET all active plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch plans." });
  }
});
 
// POST add plan (admin)
router.post("/add", async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: "Could not create plan." });
  }
});
 
// DELETE plan (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete plan." });
  }
});
 
export default router;