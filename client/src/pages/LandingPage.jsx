import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Users, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

const STATS = [
  { icon: '🎪', label: 'Events Created',   value: '500+' },
  { icon: '👥', label: 'Happy Attendees',  value: '12K+' },
  { icon: '🏙️', label: 'Cities Covered',  value: '48+'  },
  { icon: '⭐', label: 'Avg. Rating',      value: '4.9'  },
];

const FEATURES = [
  { icon: <Zap size={22} color="#8B5CF6" />,        title: 'Instant RSVP',        desc: 'One-click RSVP with real-time capacity tracking and race-condition protection.' },
  { icon: <Shield size={22} color="#10B981" />,      title: 'Secure by Default',   desc: 'JWT authentication, rate limiting, and atomic database operations keep your data safe.' },
  { icon: <Users size={22} color="#EC4899" />,       title: 'Community First',     desc: 'See who\'s attending, follow organizers, and build your event network.' },
  { icon: <CalendarDays size={22} color="#F59E0B" />,title: 'AI-Powered Creation', desc: 'Use our Gemini AI integration to write compelling event descriptions instantly.' },
];

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/events?limit=3&sort=popular')
      .then(({ data }) => setFeatured(data.events))
      .catch(() => {});
  }, []);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 20px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '10%', left: '15%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
        </div>

        <div style={{ maxWidth: 780, position: 'relative' }} className="animate-fadeUp">
          <div className="badge badge-primary" style={{ marginBottom: 24, fontSize: 13 }}>
            🎉 The best way to discover events
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-0.04em', marginBottom: 24,
          }}>
            Discover &amp; Create{' '}
            <span className="gradient-text">Amazing Events</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--text-2)', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            EventHub is the modern platform to create, discover, and RSVP to events.
            From tech meetups to music concerts — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
              Browse Events <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Start for Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', padding: '60px 20px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, fontFamily: 'var(--font-display)',
                               background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                               WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Events ───────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding: '80px 20px', maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">🔥 Trending Events</h2>
            <p className="section-sub">Most popular upcoming events right now</p>
          </div>
          <div className="events-grid stagger">
            {featured.map((e) => <EventCard key={e._id} event={e} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/events" className="btn btn-outline btn-lg">View All Events <ArrowRight size={16} /></Link>
          </div>
        </section>
      )}

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', padding: '80px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Why EventHub?</h2>
            <p className="section-sub">Everything you need to run amazing events</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}
            className="stagger">
            {FEATURES.map((f) => (
              <div key={f.title} className="card animate-fadeUp"
                style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          padding: 60, borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08))',
          border: '1px solid rgba(124,58,237,0.2)',
        }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Ready to host your event?
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 16 }}>
            Create your event in minutes. No fees, no fuss.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
