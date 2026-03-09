const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  title:       { type: String, required: true, trim: true },
  content:     { type: String, default: '' },
  type:        { type: String, enum: ['Interview Prep', 'Company Research', 'Questions Asked', 'Personal Reflection', 'General', 'Coding Problem'], default: 'General' },
  tags:        [{ type: String }],
  isPinned:    { type: Boolean, default: false },
  color:       { type: String, enum: ['default', 'blue', 'green', 'yellow', 'red', 'purple'], default: 'default' },
}, { timestamps: true });

noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });

module.exports = mongoose.models.Note || mongoose.model('Note', noteSchema);