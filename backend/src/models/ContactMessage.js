import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    ip: {
      type: String,
      default: "unknown"
    },
    read: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["new", "in_discussion", "interview_scheduled", "archived"],
      default: "new"
    }
  },
  { timestamps: true }
);

// High-performance compound indexes for recruiter CRM sorting & filtering
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
