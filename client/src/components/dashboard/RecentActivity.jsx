import React from 'react';

const RecentActivity = ({ activities = [] }) => (
  <div className="glass-card p-5">
    <h3 className="mb-4 text-xl font-black text-textPrimary">Recent Activity</h3>
    <div className="space-y-3">
      {activities.length === 0 && <p className="rounded-2xl bg-white/[0.04] p-4 text-textMuted">No recent activity.</p>}
      {activities.map((activity, index) => (
        <div key={`${activity.title}-${index}`} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary shadow-gold" />
          <div>
            <p className="font-bold text-textPrimary">{activity.title}</p>
            <p className="text-sm text-textMuted">{activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RecentActivity;
