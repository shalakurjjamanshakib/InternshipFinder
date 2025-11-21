import Application from '../models/Application.js';
import Internship from '../models/Internship.js';

export const applyToInternship = async (req, res) => {
  try {
    const internshipId = req.params.id;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.applyBy && new Date() > new Date(internship.applyBy)) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    if (internship.status && internship.status.toLowerCase() !== 'open') {
      return res.status(400).json({ message: 'Cannot apply to a closed internship' });
    }

    const existing = await Application.findOne({ internship: internshipId, applicant: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const app = await Application.create({ internship: internshipId, applicant: req.user.id });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const list = await Application.find({ applicant: req.user.id }).populate({ path: 'internship', select: 'title company location' }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getApplicationsForEmployer = async (req, res) => {
  try {
    const internships = await Internship.find({ postedBy: req.user.id }).select('_id');
    const ids = internships.map(i => i._id);
    const list = await Application.find({ internship: { $in: ids } })
      .populate({ path: 'internship', select: 'title company location postedBy' })
      .populate({ path: 'applicant', select: 'name email phone university degree resume' })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getApplicationsForInternship = async (req, res) => {
  try {
    const internshipId = req.params.id;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    if (internship.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const list = await Application.find({ internship: internshipId })
      .populate({ path: 'internship', select: 'title company location postedBy' })
      .populate({ path: 'applicant', select: 'name email phone university degree resume' })
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const appId = req.params.id;
    const { status, message } = req.body;
    const app = await Application.findById(appId).populate('internship');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.internship.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    app.status = status;
    if (typeof message !== 'undefined') app.message = message;
    await app.save();
    const updated = await Application.findById(appId).populate({ path: 'internship', select: 'title company location' }).populate({ path: 'applicant', select: 'name email phone university degree resume' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
