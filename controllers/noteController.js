const Note = require('../models/Note');

exports.getAll = async (req, res) => {
  try {
    const { type, search, applicationId } = req.query;
    const q = { user: req.user._id };
    if (type) q.type = type;
    if (applicationId) q.application = applicationId;
    if (search) q.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
    const notes = await Note.find(q).populate('application', 'company role').sort({ isPinned: -1, updatedAt: -1 });
    res.json({ notes });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json({ note });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json({ note });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};