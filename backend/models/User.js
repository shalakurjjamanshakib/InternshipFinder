import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "employer"], default: "student" },
  phone: { type: String },
  location: { type: String },
  university: { type: String },
  degree: { type: String },
  skills: { type: [String], default: [] },
  about: { type: String },
  avatar: { type: String },
  resume: { type: String },
  company: { type: String },
  companyWebsite: { type: String },
  companyDescription: { type: String },
  companyLogo: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
