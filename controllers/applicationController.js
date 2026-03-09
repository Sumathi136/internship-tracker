const Application = require('../models/Application');

exports.getAll = async (req, res) => {
  try {
    const { status, domain, priority, workType, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc', isFavorite, isArchived = 'false', tags } = req.query;
    const q = { user: req.user._id, isArchived: isArchived === 'true' };
    if (status && status !== 'All') q.status = status;
    if (domain) q.domain = domain;
    if (priority) q.priority = priority;
    if (workType) q.workType = workType;
    if (isFavorite === 'true') q.isFavorite = true;
    if (tags) q.tags = { $in: tags.split(',') };
    if (search) q.$or = [{ company: { $regex: search, $options: 'i' } }, { role: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }];
    const total = await Application.countDocuments(q);
    const apps = await Application.find(q).populate('resumeUsed', 'name fileName').sort({ [sortBy]: order === 'desc' ? -1 : 1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ applications: apps, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id }).populate('resumeUsed', 'name fileName');
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json({ application: app });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, user: req.user._id });
    res.status(201).json({ application: app });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json({ application: app });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    const r = await Application.deleteMany({ _id: { $in: ids }, user: req.user._id });
    res.json({ message: `${r.deletedCount} deleted` });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.bulkStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    await Application.updateMany({ _id: { $in: ids }, user: req.user._id }, { status });
    res.json({ message: `${ids.length} updated` });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addTimeline = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ error: 'Not found' });
    app.timeline.push({ event: req.body.event, note: req.body.note });
    await app.save();
    res.json({ application: app });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.addRound = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ error: 'Not found' });
    app.interviewRounds.push(req.body);
    await app.save();
    res.json({ application: app });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.exportCSV = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user._id }).lean();
    const headers = ['Company','Role','Status','Location','Domain','Priority','Date Applied','Deadline','Stipend','Job Link','Notes'];
    const rows = apps.map(a => [a.company, a.role, a.status, a.location, a.domain, a.priority,
      a.dateApplied ? new Date(a.dateApplied).toLocaleDateString() : '',
      a.deadline ? new Date(a.deadline).toLocaleDateString() : '',
      a.stipend, a.jobLink, (a.notes || '').replace(/,/g, ';')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=interntrack.csv');
    res.send(csv);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.upcoming = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() + days);
    const apps = await Application.find({ user: req.user._id, deadline: { $gte: new Date(), $lte: cutoff }, status: { $nin: ['Rejected','Withdrawn','Offer'] } }).sort({ deadline: 1 });
    res.json({ applications: apps });
  } catch (err) { res.status(500).json({ error: err.message }); }
};