const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
    },
    kpiScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    goalsCompleted: {
      type: Number,
      required: true,
      min: 0,
    },
    totalGoals: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    managerNote: {
      type: String,
      default: '',
      trim: true,
    },
    productivity: {
      type: Number,
      required: true,
      min: 0,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

performanceSchema.index({ employeeId: 1, year: -1, month: -1 });

module.exports = mongoose.model('Performance', performanceSchema);
