import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  MapPin, Calendar, Users, Edit3, Trash2, ExternalLink,
  Tag, Globe, ArrowLeft, Share2, Clock
} from 'lucide-react';
import api from '../api/axios';
import RSVPButton from '../components/RSVPButton';
import { useAuth } from '../context/AuthContext';

export default function EventDetailPage() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [event,    setEvent]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/events/${id}`)
      .then(({ data }) => setEvent(data))
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted.');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete event');
      setDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <div className="loader-page"><div className="spinner" /><p>Loading event…</p></div>;
  if (!event)  return null;

  const isPast     = new Date(event.date) < new Date();
  const pct        = Math.min(100, Math.round((event.attendeeCount / event.capacity) * 100));
  const barColor   = pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--success)';
  const spotsLeft  = Math.max(0, event.capacity - event.attendeeCount);

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <Link to="/events" className="btn btn-ghost btn-sm" style={{ marginBottom: 24, gap: 6 }}>
          <ArrowLeft size={15} /> Back to Events
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 32, alignItems: 'start' }}>

          {/* ── Main column ─────────────────────────────────────────────── */}
          <div>
            {/* Image */}
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 28, position: 'relative' }}>
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title}
                  style={{ width: '100%', height: 'clamp(200px, 40vw, 440px)', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{
                  height: 'clamp(200px, 40vw, 440px)',
                  background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary) 50%, var(--accent) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80,
                }}>
                  🎪
                </div>
              )}
              {isPast && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: 'rgba(0,0,0,0.8)', color: '#aaa', padding: '10px 28px',
                                 borderRadius: 50, fontSize: 16, fontWeight: 700 }}>Past Event</span>
                </div>
              )}
            </div>

            {/* Category + Online badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="badge badge-primary">{event.category}</span>
              {event.isOnline && <span className="badge badge-success"><Globe size={11} /> Online Event</span>}
              {isPast && <span className="badge badge-gray"><Clock size={11} /> Ended</span>}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontFamily: 'var(--font-display)',
                          marginBottom: 20, lineHeight: 1.2 }}>
              {event.title}
            </h1>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                           gap: 16, padding: 24, background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                           border: '1px solid var(--border)', marginBottom: 28 }}>
              <MetaItem icon={<Calendar size={18} />} label="Date & Time">
                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}<br />
                <span style={{ color: 'var(--text-2)' }}>{format(new Date(event.date), 'h:mm a')}</span>
              </MetaItem>
              <MetaItem icon={<MapPin size={18} />} label="Location">
                {event.location}
                {event.isOnline && event.meetingLink && (
                  <a href={event.meetingLink} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary-light)', fontSize: 13, marginTop: 4, textDecoration: 'none' }}>
                    Join Online <ExternalLink size={12} />
                  </a>
                )}
              </MetaItem>
              <MetaItem icon={<Users size={18} />} label="Attendees">
                <strong>{event.attendeeCount}</strong> / {event.capacity}
                <div style={{ marginTop: 6, height: 4, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 12, color: event.isFull ? 'var(--danger)' : 'var(--success)', marginTop: 4, display: 'block' }}>
                  {event.isFull ? 'Event Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                </span>
              </MetaItem>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 20, marginBottom: 14 }}>About this Event</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 16 }}>
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <Tag size={14} style={{ color: 'var(--text-3)' }} />
                {event.tags.map((t) => (
                  <span key={t} className="badge badge-gray">#{t}</span>
                ))}
              </div>
            )}

            {/* Attendees preview */}
            {event.attendees?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, marginBottom: 14 }}>
                  {event.attendees.length} People Going
                </h3>
                <div style={{ display: 'flex', gap: -8, flexWrap: 'wrap' }}>
                  {event.attendees.slice(0, 20).map((a, i) => (
                    <img key={a._id} src={a.avatarUrl} alt={a.name}
                      title={a.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
                               border: '2px solid var(--bg)', marginLeft: i > 0 ? -8 : 0,
                               transition: 'transform 0.15s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                  {event.attendees.length > 20 && (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)',
                                  border: '2px solid var(--bg)', marginLeft: -8,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>
                      +{event.attendees.length - 20}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 'calc(var(--nav-h) + 20px)' }}>

            {/* RSVP card */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Capacity</p>
                <p style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {event.attendeeCount}
                  <span style={{ fontSize: 16, color: 'var(--text-2)', fontWeight: 400 }}> / {event.capacity}</span>
                </p>
              </div>
              <RSVPButton
                event={event}
                onRsvpChange={(updated) => setEvent((p) => ({ ...p, ...updated }))}
              />
              <button onClick={handleShare} className="btn btn-outline btn-full" style={{ marginTop: 10, gap: 8 }}>
                <Share2 size={15} /> Share Event
              </button>
            </div>

            {/* Host card */}
            {event.createdBy && (
              <div className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Organized by</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={event.createdBy.avatarUrl} alt={event.createdBy.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{event.createdBy.name}</p>
                    {event.createdBy.bio && (
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{event.createdBy.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Owner actions */}
            {event.isOwner && (
              <div className="card" style={{ padding: 16, display: 'flex', gap: 10, flexDirection: 'column' }}>
                <p style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Manage</p>
                <Link to={`/events/${event._id}/edit`} className="btn btn-outline btn-sm" style={{ gap: 8 }}>
                  <Edit3 size={14} /> Edit Event
                </Link>
                <button onClick={handleDelete} disabled={deleting} className="btn btn-danger btn-sm" style={{ gap: 8 }}>
                  <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete Event'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          .container > div > div[style*="position: sticky"] {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}

function MetaItem({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-light)' }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
