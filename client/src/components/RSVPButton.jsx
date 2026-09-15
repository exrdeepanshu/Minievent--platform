import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Check, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * RSVPButton – handles join / leave with optimistic UI updates.
 * Props:
 *   event        – the event object
 *   onRsvpChange – optional callback(updatedCounts) to refresh parent state
 *   compact      – renders a smaller pill button (for EventCard)
 */
export default function RSVPButton({ event, onRsvpChange, compact = false }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading,  setLoading]  = useState(false);
  const [hasRsvp,  setHasRsvp]  = useState(event.hasRsvp);
  const [count,    setCount]    = useState(event.attendeeCount);

  const isFull = !hasRsvp && count >= event.capacity;
  const isPast = new Date(event.date) < new Date();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to RSVP');
      navigate('/login');
      return;
    }
    if (isPast)  return toast.error('This event has already passed.');
    if (isFull)  return toast.error('This event is at full capacity.');

    setLoading(true);

    // Optimistic UI update
    const optimisticRsvp  = !hasRsvp;
    const optimisticCount = optimisticRsvp ? count + 1 : count - 1;
    setHasRsvp(optimisticRsvp);
    setCount(optimisticCount);

    try {
      const method = hasRsvp ? 'delete' : 'post';
      const { data } = await api[method](`/events/${event._id}/rsvp`);

      // Sync with server's authoritative counts
      setCount(data.attendeeCount ?? optimisticCount);
      toast.success(hasRsvp ? 'RSVP cancelled' : data.message || 'RSVP successful! 🎉');
      onRsvpChange?.({ attendeeCount: data.attendeeCount, hasRsvp: !hasRsvp });
    } catch (err) {
      // Roll back optimistic update on failure
      setHasRsvp(hasRsvp);
      setCount(count);
      toast.error(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading || (isFull && !hasRsvp) || isPast}
        style={{
          padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
          cursor: loading || (isFull && !hasRsvp) ? 'not-allowed' : 'pointer',
          border: 'none', fontFamily: 'inherit', transition: 'all 0.15s ease',
          background: hasRsvp
            ? 'rgba(16,185,129,0.15)'
            : isFull ? 'var(--surface)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: hasRsvp ? 'var(--success)' : isFull ? 'var(--text-3)' : '#fff',
          opacity: isPast ? 0.5 : 1,
        }}
      >
        {loading
          ? '…'
          : hasRsvp ? '✓ Going'
          : isFull  ? 'Full'
          : 'RSVP'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || (isFull && !hasRsvp) || isPast}
      className="btn btn-lg btn-full"
      style={{
        background: hasRsvp
          ? 'rgba(16,185,129,0.12)'
          : isFull ? 'var(--surface-2)'
          : 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: hasRsvp ? 'var(--success)' : isFull ? 'var(--text-3)' : '#fff',
        border: hasRsvp ? '1px solid rgba(16,185,129,0.3)' : 'none',
        cursor: isFull && !hasRsvp ? 'not-allowed' : 'pointer',
        opacity: isPast ? 0.6 : 1,
        boxShadow: hasRsvp || isFull ? 'none' : '0 4px 20px var(--primary-glow)',
        gap: 10,
      }}
    >
      {loading ? (
        <><Loader2 size={18} style={{ animation: 'spin 0.75s linear infinite' }} /> Processing…</>
      ) : hasRsvp ? (
        <><Check size={18} /> You're Going! (Click to cancel)</>
      ) : isFull ? (
        <>Event Full — Waitlist Unavailable</>
      ) : isPast ? (
        <>Event Has Ended</>
      ) : (
        <><UserPlus size={18} /> RSVP to This Event</>
      )}
    </button>
  );
}
