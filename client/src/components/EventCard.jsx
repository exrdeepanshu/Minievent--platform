import { Link } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import RSVPButton from './RSVPButton';

export default function EventCard({ event, onRsvpChange }) {
  const past    = isPast(new Date(event.date));
  const pct     = event.capacity > 0 ? Math.min(100, Math.round((event.attendeeCount / event.capacity) * 100)) : 0;
  const isFull  = event.attendeeCount >= event.capacity;

  const barColor = pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--success)';

  return (
    <article
      className="card animate-fadeUp"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {/* Image */}
      <Link to={`/events/${event._id}`} style={{ display: 'block', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover',
                       transition: 'transform 0.4s ease', display: 'block' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: `linear-gradient(135deg, var(--primary-dark), var(--secondary))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48,
            }}>
              {categoryEmoji(event.category)}
            </div>
          )}

          {/* Badges overlay */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-primary"
              style={{ backdropFilter: 'blur(10px)', background: 'rgba(124,58,237,0.75)' }}>
              {event.category}
            </span>
            {event.isOnline && (
              <span className="badge" style={{ background: 'rgba(16,185,129,0.75)', color: '#fff', backdropFilter: 'blur(10px)' }}>
                🌐 Online
              </span>
            )}
          </div>

          {past && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ background: 'rgba(0,0,0,0.7)', color: '#aaa', padding: '6px 16px',
                             borderRadius: 50, fontSize: 13, fontWeight: 600 }}>
                Past Event
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Title */}
        <Link to={`/events/${event._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: 17, fontWeight: 700, color: 'var(--text)',
            lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color var(--t150)',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
          >
            {event.title}
          </h3>
        </Link>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <MetaRow icon={<Calendar size={13} />}>
            {format(new Date(event.date), 'EEE, MMM d • h:mm a')}
          </MetaRow>
          <MetaRow icon={<MapPin size={13} />}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
              {event.location}
            </span>
          </MetaRow>
          <MetaRow icon={<Users size={13} />}>
            {event.attendeeCount} / {event.capacity} attending
          </MetaRow>
        </div>

        {/* Capacity bar */}
        <div>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: barColor, borderRadius: 4,
              transition: 'width 0.5s var(--ease)',
            }} />
          </div>
          <p style={{ fontSize: 11, color: isFull ? 'var(--danger)' : 'var(--text-3)', marginTop: 4 }}>
            {isFull ? '🔴 Full' : `${event.capacity - event.attendeeCount} spots left`}
          </p>
        </div>

        {/* Host */}
        {event.createdBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8,
                        borderTop: '1px solid var(--border)' }}>
            <img src={event.createdBy.avatarUrl} alt={event.createdBy.name}
              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              by <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{event.createdBy.name}</span>
            </span>

            {!past && (
              <div style={{ marginLeft: 'auto' }}>
                <RSVPButton
                  event={event}
                  onRsvpChange={onRsvpChange}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function MetaRow({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-2)' }}>
      <span style={{ color: 'var(--primary-light)', flexShrink: 0 }}>{icon}</span>
      {children}
    </div>
  );
}

function categoryEmoji(cat) {
  const map = {
    Technology: '💻', Music: '🎵', Sports: '⚽', Art: '🎨',
    Food: '🍔', Business: '💼', Health: '🏥', Education: '📚',
    Entertainment: '🎬', Other: '🎪',
  };
  return map[cat] || '🎪';
}
