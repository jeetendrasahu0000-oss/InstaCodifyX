import express from "express";
import { runCode } from "../Controller/codeController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/run", protect, runCode);

export default router;