import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import EventForm from '../components/EventForm';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Event created successfully! 🎉');
      navigate(`/events/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 28, gap: 6 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            🚀 Create New Event
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
            Fill in the details below. Use AI to auto-generate your description!
          </p>
        </div>

        <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
          <EventForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
}
