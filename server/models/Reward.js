const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['points', 'bonus', 'badge'],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['performance', 'attendance', 'teamwork', 'innovation'],
      required: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reward', rewardSchema);
