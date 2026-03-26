// Backend/Routers/problemRoutes.js
import express from "express";
import {
  getPublicProblems,
  getAllProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  togglePublish,
} from "../Controller/problemController.js";
import { getPublicProblemBySlug } from "../Controller/problemController.js";
import {
  protectAdmin,
  authorizeRoles,
} from "../Middleware/adminAuthMiddleware.js";


const router = express.Router();

// ✅ Public — sabse upar
router.get("/public", getPublicProblems);

// Admin routes
router.get("/", protectAdmin, getAllProblems);
router.post(
  "/",
  protectAdmin,
  authorizeRoles("admin", "problem-setter"),
  createProblem,
);
router.put(
  "/:id",
  protectAdmin,
  authorizeRoles("admin", "problem-setter"),
  updateProblem,
);
router.delete("/:id", protectAdmin, authorizeRoles("admin"), deleteProblem);
router.patch(
  "/:id/publish",
  protectAdmin,
  authorizeRoles("admin"),
  togglePublish,
);
router.get("/public/:slug", getPublicProblemBySlug);
export default router;
