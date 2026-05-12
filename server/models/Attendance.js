const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      required: true,
      default: 'present',
    },
    checkIn: {
      type: String,
      default: '',
    },
    checkOut: {
      type: String,
      default: '',
    },
    workHours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
