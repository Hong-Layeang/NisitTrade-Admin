import models from '../../models/index.js';

const { User, Report } = models;

export default async function createUserReportController(req, res) {
  try {
    const reportedUserId = parseInt(req.params.id, 10);
    const reporterUserId = req.user?.id;
    const reason = req.body?.reason?.trim();
    const details = req.body?.details?.trim() || null;

    if (!reporterUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Number.isInteger(reportedUserId) || reportedUserId <= 0) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    if (Number(reportedUserId) === Number(reporterUserId)) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const report = await Report.create({
      user_id: reporterUserId,
      reportable_type: 'User',
      reportable_id: reportedUserId,
      reason,
      details,
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error('Error creating user report:', error);
    return res.status(500).json({
      message: 'Failed to submit user report',
      error: error.message,
    });
  }
}
