const router = require('express').Router();
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

// POST /api/feedback — Submit feedback
router.post('/', async (req, res) => {
  try {
    const { givenBy, givenTo, rating, comment } = req.body;

    // Validate required fields
    if (!givenBy || !givenTo || !rating)
      return res.status(400).json({ error: 'givenBy, givenTo, rating are required' });

    // Rule 1: Cannot give feedback to yourself
    if (givenBy === givenTo)
      return res.status(400).json({ error: 'Cannot give feedback to yourself' });

    // Rule 2: Prevent duplicate feedback within 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24hrs ago
    const duplicate = await Feedback.findOne({
      givenBy,
      givenTo,
      createdAt: { $gte: since },
    });
    if (duplicate)
      return res.status(400).json({ error: 'You already gave feedback to this employee within 24 hours' });

    const feedback = new Feedback({ givenBy, givenTo, rating, comment });
    await feedback.save();

    // Populate givenBy name for response
    await feedback.populate('givenBy', 'name');
    await feedback.populate('givenTo', 'name');
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/received/:employeeId — Get all feedback received by an employee
router.get('/received/:employeeId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ givenTo: req.params.employeeId })
      .populate('givenBy', 'name department') // show giver's name
      .sort({ createdAt: -1 });               // newest first
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/average/:employeeId — Get average rating of an employee
router.get('/average/:employeeId', async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $match: {
          givenTo: new mongoose.Types.ObjectId(req.params.employeeId), // filter by employee
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }, // compute average
          totalFeedbacks: { $sum: 1 },    // count total feedbacks
        },
      },
    ]);

    if (result.length === 0)
      return res.json({ average: 0, totalFeedbacks: 0 });

    res.json({
      average: parseFloat(result[0].avgRating.toFixed(2)),
      totalFeedbacks: result[0].totalFeedbacks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/feedback/:feedbackId — Delete feedback (only giver can delete)
router.delete('/:feedbackId', async (req, res) => {
  try {
    const { userId } = req.body; // ID of person requesting delete

    if (!userId)
      return res.status(400).json({ error: 'userId is required' });

    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback)
      return res.status(404).json({ error: 'Feedback not found' });

    // Only the person who gave the feedback can delete it
    if (feedback.givenBy.toString() !== userId)
      return res.status(403).json({ error: 'Only the feedback giver can delete it' });

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
