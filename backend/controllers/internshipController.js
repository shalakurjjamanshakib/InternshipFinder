import Internship from "../models/Internship.js";
import mongoose from 'mongoose';

export const createInternship = async (req, res) => {
  try {
    const data = { ...req.body, postedBy: req.user.id };
    const internship = await Internship.create(data);
    res.status(201).json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInternships = async (req, res) => {
  try {
    const list = await Internship.find().populate('postedBy', 'name email');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInternship = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid internship id' });
    const item = await Internship.findById(req.params.id).populate('postedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error('getInternship error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: 'Invalid internship id' });
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    if (item.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    await item.deleteOne();

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteInternship error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateInternship = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid internship id' });
    const item = await Internship.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const fields = ['title','company','location','category','mode','duration','minSalary','maxSalary','description','requirements','status'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error('updateInternship error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
