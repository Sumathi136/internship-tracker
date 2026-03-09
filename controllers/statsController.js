const Application = require('../models/Application');

exports.overview = async (req, res) => {
  try {
    const userId = req.user._id;
    const [statusCounts, domainCounts, priorityCounts, monthlyData, recentActivity] = await Promise.all([
      Application.aggregate([{ $match: { user: userId, isArchived: false } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([{ $match: { user: userId, isArchived: false } }, { $group: { _id: '$domain', count: { $sum: 1 } } }]),
      Application.aggregate([{ $match: { user: userId, isArchived: false } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Application.aggregate([
        { $match: { user: userId, dateApplied: { $gte: new Date(Date.now() - 180 * 864e5) } } },
        { $group: { _id: { year: { $year: '$dateApplied' }, month: { $month: '$dateApplied' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Application.countDocuments({ user: userId, createdAt: { $gte: new Date(Date.now() - 7 * 864e5) } })
    ]);

    const total      = statusCounts.reduce((s, x) => s + x.count, 0);
    const offers     = statusCounts.find(s => s._id === 'Offer')?.count || 0;
    const interviews = statusCounts.find(s => s._id === 'Interview')?.count || 0;
    const rejected   = statusCounts.find(s => s._id === 'Rejected')?.count || 0;
    const applied    = statusCounts.find(s => s._id === 'Applied')?.count || 0;

    const upcomingDeadlines = await Application.find({
      user: userId,
      deadline: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 864e5) },
      status: { $nin: ['Rejected','Withdrawn','Offer'] }
    }).sort({ deadline: 1 }).limit(5).select('company role deadline status');

    res.json({
      overview: {
        total, offers, interviews, rejected, applied,
        offerRate:     total > 0 ? parseFloat(((offers / total) * 100).toFixed(1)) : 0,
        interviewRate: total > 0 ? parseFloat(((interviews / total) * 100).toFixed(1)) : 0,
        recentActivity
      },
      charts: {
        statusCounts:   statusCounts.map(s => ({ name: s._id, value: s.count })),
        domainCounts:   domainCounts.map(d => ({ name: d._id, value: d.count })),
        priorityCounts: priorityCounts.map(p => ({ name: p._id, value: p.count })),
        monthlyData:    monthlyData.map(m => ({
          name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
          applications: m.count
        }))
      },
      upcomingDeadlines
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};