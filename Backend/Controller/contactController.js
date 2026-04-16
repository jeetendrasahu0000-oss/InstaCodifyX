// Backend/src/controllers/Contact/contactController.js

import Contact from "../Models/Contact.js";

/* ══════════════════════════════════════════════════
   submitContact
   POST /api/contact
   Public — form se data receive karke DB mein save karo
══════════════════════════════════════════════════ */
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // ── Basic server-side validation ──
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    if (message.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 20 characters long.",
      });
    }

    // ── Rate limit check (simple: max 3 submissions per email per day) ──
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingCount = await Contact.countDocuments({
      email: email.toLowerCase().trim(),
      createdAt: { $gte: oneDayAgo },
    });

    if (existingCount >= 3) {
      return res.status(429).json({
        success: false,
        message:
          "Too many submissions from this email. Please try again after 24 hours.",
      });
    }

    // ── Get IP address ──
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      null;

    // ── Create & save document ──
    const contactEntry = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject,
      message: message.trim(),
      ipAddress,
    });

    return res.status(201).json({
      success: true,
      message:
        "Your message has been received. We'll get back to you within 24 hours.",
      data: {
        id: contactEntry._id,
        name: contactEntry.name,
        email: contactEntry.email,
        subject: contactEntry.subject,
        createdAt: contactEntry.createdAt,
      },
    });
  } catch (error) {
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || "Validation failed.",
      });
    }

    console.error("[Contact Submit Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

/* ══════════════════════════════════════════════════
   getAllContacts
   GET /api/contact
   Protected (Admin only) — saari contact entries fetch karo
   Query params: status, page, limit, search
══════════════════════════════════════════════════ */
export const getAllContacts = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // ── Build filter ──
    const filter = {};
    if (status && ["pending", "read", "resolved"].includes(status)) {
      filter.status = status;
    }
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    // ── Query ──
    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contact.countDocuments(filter),
    ]);

    // ── Stats (counts per status) ──
    const [pendingCount, readCount, resolvedCount] = await Promise.all([
      Contact.countDocuments({ status: "pending" }),
      Contact.countDocuments({ status: "read" }),
      Contact.countDocuments({ status: "resolved" }),
    ]);

    return res.status(200).json({
      success: true,
      data: contacts,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      stats: {
        pending: pendingCount,
        read: readCount,
        resolved: resolvedCount,
        total: pendingCount + readCount + resolvedCount,
      },
    });
  } catch (error) {
    console.error("[Get All Contacts Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/* ══════════════════════════════════════════════════
   getContactById
   GET /api/contact/:id
   Protected (Admin) — ek specific contact entry
══════════════════════════════════════════════════ */
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact entry not found." });
    }

    // Auto mark as "read" when admin opens it
    if (contact.status === "pending") {
      contact.status = "read";
      await contact.save();
    }

    return res.status(200).json({ success: true, data: contact });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid contact ID." });
    }
    console.error("[Get Contact By ID Error]:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ══════════════════════════════════════════════════
   updateContactStatus
   PATCH /api/contact/:id/status
   Protected (Admin) — status update karo
   Body: { status: "pending" | "read" | "resolved" }
══════════════════════════════════════════════════ */
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "read", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use: pending, read, or resolved.",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact entry not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}" successfully.`,
      data: contact,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid contact ID." });
    }
    console.error("[Update Contact Status Error]:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/* ══════════════════════════════════════════════════
   deleteContact
   DELETE /api/contact/:id
   Protected (Admin) — contact entry delete karo
══════════════════════════════════════════════════ */
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact entry not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Contact entry deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid contact ID." });
    }
    console.error("[Delete Contact Error]:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
