const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true, trim: true },
  fileName:  { type: String, required: true },
  filePath:  { type: String, required: true },
  fileSize:  { type: Number },
  mimeType:  { type: String },
  version:   { type: String, default: 'v1' },
  tags:      [{ type: String }],
  isDefault: { type: Boolean, default: false },
  notes:     { type: String, default: '' },
  timesUsed: { type: Number, default: 0 },
  atsScore:  { type: Number, default: null },
}, { timestamps: true });

resumeSchema.index({ user: 1 });

module.exports = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);