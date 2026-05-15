import mongoose from "mongoose";

const visitSessionSchema = new mongoose.Schema(
  {
    sessionIdHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  { timestamps: true }
);

const VisitSession = mongoose.model("VisitSession", visitSessionSchema);

export default VisitSession;
