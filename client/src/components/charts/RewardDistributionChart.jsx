import React from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const palette = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#A78BFA'];

const tooltipStyle = {
  background: '#111118',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 16,
  color: '#F8F8FF',
};

const RewardDistributionChart = ({ data = [], type = 'bar', title = 'Reward Distribution' }) => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
    style={{ transformOrigin: 'left', willChange: 'transform, opacity' }}
    className="glass-card p-5"
  >
    <div className="mb-5">
      <h3 className="text-xl font-black text-textPrimary">{title}</h3>
      <p className="text-sm text-textMuted">Breakdown by category</p>
    </div>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={58} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[12, 12, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export default RewardDistributionChart;
