import React from 'react';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PerformanceChart = ({ data = [] }) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
    style={{ transformOrigin: 'left', willChange: 'transform, opacity' }}
    className="glass-card h-full p-5"
  >
    <div className="mb-5">
      <h3 className="text-xl font-black text-textPrimary">Performance Momentum</h3>
      <p className="text-sm text-textMuted">Last six months KPI score</p>
    </div>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <XAxis dataKey="month" stroke="#6B7280" tickLine={false} axisLine={false} />
          <YAxis stroke="#6B7280" tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: '#111118',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              color: '#F8F8FF',
            }}
          />
          <Line
            type="monotone"
            dataKey="kpiScore"
            name="KPI Score"
            stroke="#F59E0B"
            strokeWidth={4}
            dot={{ r: 5, fill: '#F59E0B', stroke: '#0A0A0F', strokeWidth: 2 }}
            activeDot={{ r: 8, fill: '#F59E0B' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default PerformanceChart;
