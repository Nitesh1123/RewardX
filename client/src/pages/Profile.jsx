import React, { useEffect, useState } from 'react';
import { FiAward, FiCalendar, FiEdit3, FiMessageSquare, FiUser } from 'react-icons/fi';
import { BsTrophy } from 'react-icons/bs';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import StatCard from '../components/dashboard/StatCard';

const tierClass = {
  bronze: 'tier-bronze',
  silver: 'tier-silver',
  gold: 'tier-gold',
  platinum: 'tier-platinum',
};

const formatDate = (date) =>
  date ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date)) : 'Not set';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [summary, setSummary] = useState({ points: 0, badgesCount: 0, attendancePercentage: 0, avgPerformanceScore: 0 });
  const [rewards, setRewards] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('badges');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', profileImage: '' });

  const loadProfile = async () => {
    if (!user?.id) return;
    const [meRes, summaryRes, rewardsRes, feedbackRes] = await Promise.allSettled([
      api.get('/auth/me'),
      api.get(`/employees/${user.id}/summary`),
      api.get(`/rewards/${user.id}`),
      api.get(`/feedback/${user.id}`),
    ]);

    if (meRes.status === 'fulfilled') {
      setProfile(meRes.value.data.user);
      setForm({
        name: meRes.value.data.user.name || '',
        department: meRes.value.data.user.department || '',
        profileImage: meRes.value.data.user.profileImage || '',
      });
    }
    if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data.summary);
    if (rewardsRes.status === 'fulfilled') setRewards(rewardsRes.value.data.rewards);
    if (feedbackRes.status === 'fulfilled') setFeedback(feedbackRes.value.data.feedback);
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const response = await api.put(`/employees/${user.id}`, form);
    setProfile(response.data.employee);
    localStorage.setItem('user', JSON.stringify(response.data.employee));
    setModalOpen(false);
  };

  const badges = profile?.badges || [];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Navbar title="Profile" />
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="glass-card overflow-hidden">
            <div className="h-44 bg-gold-gradient opacity-95" />
            <div className="-mt-14 flex flex-col gap-5 px-6 pb-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <img
                  src={profile?.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.name || 'RewardX'}`}
                  alt={profile?.name || 'Profile'}
                  className="h-28 w-28 rounded-3xl border-4 border-dark object-cover shadow-gold"
                />
                <div>
                  <h1 className="text-4xl font-black">{profile?.name || 'RewardX User'}</h1>
                  <p className="mt-2 capitalize text-textMuted">
                    {profile?.role || 'employee'} • {profile?.department || 'Unassigned'} • Joined {formatDate(profile?.joinDate)}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center justify-center gap-2">
                <FiEdit3 /> Edit Profile
              </button>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Points" value={summary.points.toLocaleString()} icon={BsTrophy} trendValue="+12%" color="text-primary" />
            <StatCard title="Badges Count" value={summary.badgesCount} icon={FiAward} trendValue="+2" color="text-info" />
            <StatCard title="Attendance %" value={`${summary.attendancePercentage}%`} icon={FiCalendar} trendValue="+4%" color="text-success" />
            <StatCard title="Avg Performance" value={summary.avgPerformanceScore} icon={FiUser} trendValue="+8%" color="text-primary" />
          </section>

          <section className="glass-card p-5">
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                ['badges', 'My Badges'],
                ['rewards', 'Reward History'],
                ['feedback', 'Feedback Received'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`rounded-2xl px-4 py-2 font-bold transition ${tab === value ? 'bg-primary text-dark' : 'bg-white/[0.04] text-textMuted hover:text-primary'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'badges' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {badges.length === 0 && <p className="rounded-2xl bg-white/[0.04] p-5 text-textMuted">No badges earned yet.</p>}
                {badges.map(({ badgeId, earnedAt }) => (
                  <div key={badgeId?._id || earnedAt} className={`rounded-3xl border p-5 ${tierClass[badgeId?.tier] || 'border-white/10 bg-white/[0.04]'}`}>
                    <p className="text-5xl">{badgeId?.icon || '🏆'}</p>
                    <h3 className="mt-4 text-xl font-black">{badgeId?.name || 'Badge'}</h3>
                    <p className="mt-1 capitalize text-sm opacity-80">{badgeId?.tier || 'earned'} tier</p>
                    <p className="mt-3 text-xs opacity-70">Earned {formatDate(earnedAt)}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'rewards' && (
              <div className="relative space-y-4 border-l border-white/10 pl-5">
                {rewards.length === 0 && <p className="rounded-2xl bg-white/[0.04] p-5 text-textMuted">No reward history yet.</p>}
                {rewards.map((reward) => (
                  <div key={reward._id} className="relative rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <span className="absolute -left-[1.85rem] top-5 h-3 w-3 rounded-full bg-primary shadow-gold" />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black">{reward.description}</p>
                        <p className="text-sm capitalize text-textMuted">{reward.category} • {formatDate(reward.awardedAt)}</p>
                      </div>
                      <span className="font-black text-primary">{reward.type === 'bonus' ? `₹${reward.amount}` : `${reward.amount} pts`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'feedback' && (
              <div className="grid gap-4 md:grid-cols-2">
                {feedback.length === 0 && <p className="rounded-2xl bg-white/[0.04] p-5 text-textMuted">No feedback received yet.</p>}
                {feedback.map((item) => (
                  <article key={item._id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <FiMessageSquare className="text-primary" />
                      <p className="font-black">{item.fromEmployee?.name || 'Anonymous'} • {item.rating}/5</p>
                    </div>
                    <p className="leading-7 text-textMuted">{item.message}</p>
                    <p className="mt-4 text-xs text-textMuted">{formatDate(item.createdAt)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {modalOpen && (
        <div className="modal-backdrop">
          <form onSubmit={saveProfile} className="glass-card w-full max-w-lg p-6">
            <h2 className="text-2xl font-black">Edit Profile</h2>
            <div className="mt-5 space-y-4">
              <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input-field" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <input className="input-field" placeholder="Profile image URL" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
