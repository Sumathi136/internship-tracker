const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const Resume = require('../models/Resume');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes', req.user._id.toString());
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['.pdf','.doc','.docx'].includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX allowed'));
  }
}).single('resume');

exports.upload = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      const resume = await Resume.create({
        user:     req.user._id,
        name:     req.body.name || req.file.originalname,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        version:  req.body.version || 'v1',
        tags:     req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
        notes:    req.body.notes || ''
      });
      res.status(201).json({ resume });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });
};

exports.getAll = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!resume) return res.status(404).json({ error: 'Not found' });
    if (req.body.isDefault)
      await Resume.updateMany({ user: req.user._id, _id: { $ne: resume._id } }, { isDefault: false });
    res.json({ resume });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Not found' });
    if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};