import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";

const router = express.Router();
const contactLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post(
  "/",
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body || {};

    const errors = [];
    if (typeof name !== "string" || !name.trim()) errors.push("name is required");
    if (typeof email !== "string" || !isValidEmail(email.trim())) errors.push("a valid email is required");
    if (typeof subject !== "string" || !subject.trim()) errors.push("subject is required");
    if (typeof message !== "string" || !message.trim()) errors.push("message is required");

    if (errors.length > 0) {
      throw new HttpError(400, "Validation failed", errors);
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";

    const saved = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ip
    });

    logger.info("recruiter contact message received", {
      id: saved._id,
      name: saved.name,
      email: saved.email,
      subject: saved.subject
    });

    res.set("Cache-Control", "no-store");
    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. Thank you!"
    });
  })
);

router.get(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.set("Cache-Control", "no-store");
    return res.json(messages);
  })
);

router.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    const validStatuses = ["new", "in_discussion", "interview_scheduled", "archived"];
    if (!validStatuses.includes(status)) {
      throw new HttpError(400, "Invalid lead status");
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      throw new HttpError(404, "Message not found");
    }

    logger.info("contact message status updated by admin", { id, status });
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, message: updated });
  })
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw new HttpError(404, "Message not found");
    }

    logger.info("contact message deleted by admin", { id });
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, message: "Message deleted" });
  })
);

export default router;
