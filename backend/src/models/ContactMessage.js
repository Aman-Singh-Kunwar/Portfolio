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

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
