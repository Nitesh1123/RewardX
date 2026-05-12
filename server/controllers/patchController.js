const permissions = require('../config/permissions');

const modelMap = {
  employee:    require('../models/User'),
  reward:      require('../models/Reward'),
  attendance:  require('../models/Attendance'),
  performance: require('../models/Performance'),
  feedback:    require('../models/Feedback'),
};

exports.patchDocument = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const { field, value }  = req.body;
    const userRole          = req.user.role;

    const allowed = permissions[userRole]?.[resource] || [];
    if (!allowed.includes(field)) {
      return res.status(403).json({
        error: `Role '${userRole}' cannot edit '${field}' on '${resource}'`
      });
    }

    const Model = modelMap[resource];
    if (!Model) return res.status(400).json({ error: 'Invalid resource' });

    const updated = await Model.findOneAndUpdate(
      { _id: id },
      { $set: { [field]: value, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Not found or unauthorized' });

    req.io.emit('field-updated', {
      resource, id, field, value,
      updatedBy: req.user.name,
      updatedByRole: req.user.role,
      timestamp: new Date(),
    });

    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
