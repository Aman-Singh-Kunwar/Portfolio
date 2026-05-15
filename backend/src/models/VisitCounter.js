import mongoose from "mongoose";

const visitCounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "portfolio"
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

const VisitCounter = mongoose.model("VisitCounter", visitCounterSchema);

export default VisitCounter;
