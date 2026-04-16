// Backend/src/routes/contactRoutes.js
// (Bonus file — routes setup ke liye)

import express from "express";
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from "../Controller/contactController.js";

// import { verifyAdmin } from "../middleware/authMiddleware.js"; // apna auth middleware laga dena

const router = express.Router();

// Public
router.post("/", submitContact); // POST   /api/contact

// Admin Protected (apna auth middleware uncomment kar dena)
router.get("/", /* verifyAdmin, */ getAllContacts); // GET    /api/contact
router.get("/:id", /* verifyAdmin, */ getContactById); // GET    /api/contact/:id
router.patch("/:id/status", /* verifyAdmin, */ updateContactStatus); // PATCH  /api/contact/:id/status
router.delete("/:id", /* verifyAdmin, */ deleteContact); // DELETE /api/contact/:id

export default router;

/*
  app.js / server.js mein add karo:
  import contactRoutes from "./routes/contactRoutes.js";
  app.use("/api/contact", contactRoutes);
*/
