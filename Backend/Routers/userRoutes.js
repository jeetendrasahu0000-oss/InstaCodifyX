import express from "express";
import {
  getProfile,
  updateProfile,
  getUserByUsername,
} from "../Controller/userController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/:username", getUserByUsername);

export default router;
