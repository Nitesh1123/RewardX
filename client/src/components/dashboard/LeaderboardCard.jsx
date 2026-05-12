import React from 'react';
import { BsTrophy, BsAward } from 'react-icons/bs';

const medalColor = {
  1: 'text-primary',
  2: 'text-slate-300',
  3: 'text-orange-400',
};

const LeaderboardCard = ({ rank, name, department, points, avatar, isCurrentUser = false }) => (
  <div
    className={[
      'glass-card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-primary/40',
      isCurrentUser ? 'border-primary/70 bg-primary/10 shadow-gold' : '',
    ].join(' ')}
  >
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.05] text-lg font-black">
      {rank <= 3 ? <BsTrophy className={medalColor[rank]} /> : <span className="text-textMuted">{rank}</span>}
    </div>

    <img
      src={avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${name || 'RewardX'}`}
      alt={name}
      className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
    />

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <h3 className="truncate font-bold text-textPrimary">{name}</h3>
        {isCurrentUser && <BsAward className="text-primary" />}
      </div>
      <p className="truncate text-sm text-textMuted">{department || 'People Operations'}</p>
    </div>

    <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 font-black text-primary">
      <BsTrophy />
      {Number(points || 0).toLocaleString()}
    </div>
  </div>
);

export default LeaderboardCard;
