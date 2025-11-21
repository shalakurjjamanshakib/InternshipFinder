import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['applied','under_review','accepted','rejected'], default: 'applied' },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);
