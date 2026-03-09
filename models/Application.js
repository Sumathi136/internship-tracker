const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  event: { type: String, required: true },
  note:  { type: String, default: '' },
  date:  { type: Date, default: Date.now }
}, { _id: true });

const applicationSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:           { type: String, required: true, trim: true },
  role:              { type: String, required: true, trim: true },
  location:          { type: String, default: '' },
  workType:          { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'On-site' },
  domain:            { type: String, enum: ['Software', 'Data Science', 'Design', 'Product', 'Marketing', 'Finance', 'Research', 'Other'], default: 'Software' },
  status:            { type: String, enum: ['Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Ghosted'], default: 'Applied' },
  priority:          { type: String, enum: ['Low', 'Medium', 'High', 'Dream'], default: 'Medium' },
  rating:            { type: Number, min: 1, max: 5, default: null },
  dateApplied:       { type: Date },
  deadline:          { type: Date },
  startDate:         { type: Date },
  endDate:           { type: Date },
  stipend:           { type: String, default: '' },
  currency:          { type: String, default: 'INR' },
  isPaid:            { type: Boolean, default: true },
  perks:             [{ type: String }],
  recruiterName:     { type: String, default: '' },
  recruiterEmail:    { type: String, default: '' },
  recruiterLinkedIn: { type: String, default: '' },
  referredBy:        { type: String, default: '' },
  jobLink:           { type: String, default: '' },
  companyWebsite:    { type: String, default: '' },
  applicationPortal: { type: String, default: '' },
  notes:             { type: String, default: '' },
  tags:              [{ type: String }],
  resumeUsed:        { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
  interviewRounds: [{
    round:    { type: Number },
    type:     { type: String, enum: ['Phone', 'Technical', 'HR', 'System Design', 'Assignment', 'Group Discussion', 'Final'] },
    date:     { type: Date },
    duration: { type: Number },
    feedback: { type: String },
    result:   { type: String, enum: ['Passed', 'Failed', 'Pending', 'Scheduled'] }
  }],
  timeline:      [timelineSchema],
  followUpDate:  { type: Date },
  followUpDone:  { type: Boolean, default: false },
  oaDate:        { type: Date },
  oaPlatform:    { type: String, default: '' },
  isFavorite:    { type: Boolean, default: false },
  isArchived:    { type: Boolean, default: false },
}, { timestamps: true });

applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, deadline: 1 });

applicationSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({ event: `Application created (${this.status})`, date: new Date() });
  } else if (this.isModified('status')) {
    this.timeline.push({ event: `Status changed to ${this.status}`, date: new Date() });
  }
  next();
});

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);