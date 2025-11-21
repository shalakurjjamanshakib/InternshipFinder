import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  applyBy: { type: Date },
  category: { type: String },
  mode: { type: String },
  duration: { type: String },
  minSalary: { type: Number },
  maxSalary: { type: Number },
  status: { type: String, default: 'Open' },
  description: { type: String },
  requirements: { type: [String], default: [] },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Internship", internshipSchema);
