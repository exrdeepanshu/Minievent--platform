import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import EventForm from '../components/EventForm';
import { useAuth } from '../context/AuthContext';

export default function EditEventPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const [event,    setEvent]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        // Only the owner can edit
        if (data.createdBy?._id !== user?.id && !data.isOwner) {
          toast.error('You are not authorized to edit this event.');
          navigate('/events');
          return;
        }
        setEvent(data);
      })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Event updated! ✅');
      navigate(`/events/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader-page"><div className="spinner" /></div>;
  if (!event)  return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 28, gap: 6 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            ✏️ Edit Event
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>{event.title}</p>
        </div>

        <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
          <EventForm initial={event} onSubmit={handleSubmit} loading={saving} />
        </div>
      </div>
    </div>
  );
}
