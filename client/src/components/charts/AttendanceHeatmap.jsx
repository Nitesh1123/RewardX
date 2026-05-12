import React from 'react';
import { motion } from 'framer-motion';

const statusClass = {
  present: 'bg-success/80 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
  late: 'bg-primary/80 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
  absent: 'bg-danger/80 shadow-[0_0_18px_rgba(239,68,68,0.25)]',
  'half-day': 'bg-info/80 shadow-[0_0_18px_rgba(59,130,246,0.25)]',
};

const AttendanceHeatmap = ({ records = [] }) => {
  const grid = records.slice(0, 35);

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
      style={{ transformOrigin: 'left', willChange: 'transform, opacity' }}
      className="glass-card h-full p-5"
    >
      <div className="mb-5">
        <h3 className="text-xl font-black text-textPrimary">Attendance Heatmap</h3>
        <p className="text-sm text-textMuted">Daily presence signal</p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.map((record, index) => (
          <div
            key={`${record.date}-${index}`}
            title={`${record.date}: ${record.status}`}
            className={`aspect-square rounded-xl border border-white/10 ${statusClass[record.status] || 'bg-white/10'}`}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-textMuted">
        {Object.entries(statusClass).map(([status, className]) => (
          <span key={status} className="flex items-center gap-2 capitalize">
            <span className={`h-3 w-3 rounded-full ${className}`} />
            {status}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default AttendanceHeatmap;
