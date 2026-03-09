const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const Application = require('../models/Application');

router.use(protect);

router.post('/test-email', async (req, res) => {
  try {
    if (!process.env.SMTP_USER)
      return res.status(400).json({ error: 'SMTP not configured in .env' });

    const nodemailer  = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + (req.user.reminderDaysBefore || 3));

    const upcoming = await Application.find({
      user: req.user._id,
      deadline: { $gte: new Date(), $lte: cutoff },
      status: { $nin: ['Rejected','Withdrawn','Offer'] }
    }).sort({ deadline: 1 });

    const list = upcoming.map(a =>
      `<li><strong>${a.company}</strong> — ${a.role} | Deadline: ${new Date(a.deadline).toDateString()}</li>`
    ).join('') || '<li>No upcoming deadlines</li>';

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to:   req.user.email,
      subject: `InternTrack: ${upcoming.length} deadline(s) soon`,
      html: `<h2>Upcoming Deadlines</h2><ul>${list}</ul>`
    });

    res.json({ message: `Reminder sent to ${req.user.email}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;