import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import { ContactSubmissionSchema, StatusUpdateSchema } from "../validators/schemas.js";

const router = express.Router();
const contactLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

router.post(
  "/",
  contactLimiter,
  asyncHandler(async (req, res) => {
    const parseResult = ContactSubmissionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map((i) => i.message);
      throw new HttpError(400, "Validation failed", errorMessages);
    }

    const { name, email, subject, message } = parseResult.data;
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    const saved = await ContactMessage.create({
      name,
      email,
      subject,
      message,
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

    const parseResult = StatusUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || "Invalid status payload";
      throw new HttpError(400, errorMsg);
    }

    const { status } = parseResult.data;

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
