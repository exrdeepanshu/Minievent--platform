import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Users, CalendarCheck, LayoutDashboard, Edit3 } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

const TAB = { created: 'created', attending: 'attending' };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [data,    setData]    = useState({ createdEvents: [], attendingEvents: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState(TAB.created);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/users/dashboard')
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: u } = await api.put('/auth/profile', profile);
      updateUser(u);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const events = tab === TAB.created ? data.createdEvents : data.attendingEvents;
  const { stats } = data;

  return (
    <div className="page">
      <div className="container">
        {/* Profile Header */}
        <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)', marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <img src={user?.avatarUrl} alt={user?.name}
              style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="form-input" placeholder="Your name" value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                <textarea className="form-textarea" placeholder="A short bio…" value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  style={{ minHeight: 80 }} maxLength={200} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary btn-sm">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontFamily: 'var(--font-display)' }}>{user?.name}</h1>
                  <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 4 }}>{user?.email}</p>
                {user?.bio && <p style={{ color: 'var(--text-2)', fontSize: 15, marginTop: 8 }}>{user.bio}</p>}
              </>
            )}
          </div>

          {/* Stats */}
          {!editing && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Created',   value: stats.totalCreated   || 0, icon: <Calendar size={16} /> },
                { label: 'Attending', value: stats.totalAttending  || 0, icon: <CalendarCheck size={16} /> },
                { label: 'Upcoming',  value: (stats.upcomingCreated || 0) + (stats.upcomingAttending || 0), icon: <Users size={16} /> },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary-light)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 4 }}>
                    {s.icon} {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--surface)', padding: 4, borderRadius: 'var(--radius)', width: 'fit-content' }}>
          {[
            { key: TAB.created,   label: `My Events (${data.createdEvents.length})`,   icon: <LayoutDashboard size={14} /> },
            { key: TAB.attending, label: `Attending (${data.attendingEvents.length})`, icon: <CalendarCheck size={14} /> },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 8, border: 'none',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
                background: tab === t.key ? 'var(--primary)' : 'transparent',
                color:      tab === t.key ? '#fff' : 'var(--text-2)',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader-page"><div className="spinner" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="icon">{tab === TAB.created ? '🎪' : '🎟️'}</div>
            <h3>{tab === TAB.created ? "You haven't created any events yet" : "You're not attending any events"}</h3>
            <p>{tab === TAB.created ? 'Create your first event and start bringing people together!' : 'Browse upcoming events and RSVP to get started.'}</p>
            <Link to={tab === TAB.created ? '/events/create' : '/events'} className="btn btn-primary" style={{ marginTop: 16 }}>
              {tab === TAB.created ? <><Plus size={15} /> Create Event</> : <><Calendar size={15} /> Browse Events</>}
            </Link>
          </div>
        ) : (
          <div className="events-grid stagger">
            {events.map((event) => (
              <div key={event._id} style={{ position: 'relative' }}>
                <EventCard event={event} />
                {/* Past event overlay label */}
                {isPast(new Date(event.date)) && (
                  <span className="badge badge-gray" style={{ position: 'absolute', top: 12, right: 12 }}>
                    Past
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
