const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:           { type: String, required: true, minlength: 6, select: false },
  college:            { type: String, default: '' },
  degree:             { type: String, default: '' },
  graduationYear:     { type: Number },
  skills:             [{ type: String }],
  linkedIn:           { type: String, default: '' },
  github:             { type: String, default: '' },
  emailReminders:     { type: Boolean, default: true },
  reminderDaysBefore: { type: Number, default: 3 },
  applicationGoal:    { type: Number, default: 50 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return require('bcryptjs').compare(entered, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);