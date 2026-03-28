import express from "express"
import {
  getProfile,
  updateProfile,
  getUserByUsername,
} from "../Controller/userController.js"

import { protect } from "../Middleware/authMiddleware.js"
import { upload } from "../Middleware/upload.js"   // 👈 IMPORTANT

const router = express.Router()

router.get("/profile", protect, getProfile)

// 🔥 FIX: multer add kiya
router.put("/profile", protect, upload.single("avatar"), updateProfile)

router.get("/:username", getUserByUsername)

export default router