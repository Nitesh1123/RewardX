const Badge = require('../models/Badge');

exports.createBadge = async (req, res, next) => {
  try {
    const { name, description, icon, criteria, tier } = req.body;

    if (!name || !description || !icon || !criteria || !tier) {
      return res.status(400).json({ success: false, message: 'Missing required badge fields' });
    }

    const badge = await Badge.create({
      name,
      description,
      icon,
      criteria,
      tier,
    });

    return res.status(201).json({ success: true, badge });
  } catch (error) {
    return next(error);
  }
};

exports.getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ tier: 1, name: 1 });
    return res.status(200).json({ success: true, count: badges.length, badges });
  } catch (error) {
    return next(error);
  }
};

exports.getBadgeById = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    return res.status(200).json({ success: true, badge });
  } catch (error) {
    return next(error);
  }
};

exports.updateBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    return res.status(200).json({ success: true, badge });
  } catch (error) {
    return next(error);
  }
};

exports.deleteBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);

    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }

    return res.status(200).json({ success: true, message: 'Badge deleted' });
  } catch (error) {
    return next(error);
  }
};
