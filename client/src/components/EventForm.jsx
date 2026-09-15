import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Wand2, X, Loader2, ImageIcon } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = [
  'Technology','Music','Sports','Art','Food',
  'Business','Health','Education','Entertainment','Other',
];

/** Shared form used by both CreateEventPage and EditEventPage */
export default function EventForm({ initial = {}, onSubmit, loading: submitting }) {
  const [form, setForm] = useState({
    title:       initial.title       || '',
    description: initial.description || '',
    date:        initial.date ? toDatetimeLocal(initial.date) : '',
    location:    initial.location    || '',
    capacity:    initial.capacity    || '',
    category:    initial.category    || 'Other',
    tags:        initial.tags?.join(', ') || '',
    isOnline:    initial.isOnline    || false,
    meetingLink: initial.meetingLink || '',
  });
  const [errors,     setErrors]     = useState({});
  const [imageFile,  setImageFile]  = useState(null);
  const [imagePreview, setImagePreview] = useState(initial.imageUrl || null);
  const [aiLoading,  setAiLoading]  = useState(false);
  const fileRef = useRef();

  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())           e.title       = 'Title is required';
    if (form.title.length > 100)      e.title       = 'Max 100 characters';
    if (!form.description.trim())     e.description = 'Description is required';
    if (form.description.length < 10) e.description = 'At least 10 characters';
    if (!form.date)                   e.date        = 'Date & time is required';
    if (form.date && new Date(form.date) < new Date() && !initial._id)
                                      e.date        = 'Date must be in the future';
    if (!form.location.trim())        e.location    = 'Location is required';
    if (!form.capacity)               e.capacity    = 'Capacity is required';
    if (parseInt(form.capacity) < 1)  e.capacity    = 'Capacity must be at least 1';
    if (form.isOnline && !form.meetingLink.trim()) e.meetingLink = 'Meeting link required for online events';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Image handling ────────────────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── AI Description ────────────────────────────────────────────────────────
  const handleAI = async () => {
    if (!form.title.trim()) { toast.error('Enter a title first'); return; }
    setAiLoading(true);
    try {
      const { data } = await api.post('/events/ai/describe', {
        title:    form.title,
        category: form.category,
        location: form.location,
        date:     form.date,
      });
      set('description', data.description);
      toast.success('✨ AI description generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }} noValidate>

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Event Title *</label>
        <input className={`form-input${errors.title ? ' error' : ''}`}
          placeholder="e.g. React Workshop 2026" value={form.title}
          onChange={(e) => set('title', e.target.value)} maxLength={100} />
        {errors.title && <p className="form-error">{errors.title}</p>}
        <p className="form-hint">{form.title.length}/100 characters</p>
      </div>

      {/* Description + AI */}
      <div className="form-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label className="form-label" style={{ margin: 0 }}>Description *</label>
          <button type="button" onClick={handleAI} disabled={aiLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid rgba(124,58,237,0.4)',
              background: 'rgba(124,58,237,0.08)', color: 'var(--primary-light)',
              cursor: aiLoading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => !aiLoading && (e.currentTarget.style.background = 'rgba(124,58,237,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.08)')}
          >
            {aiLoading
              ? <><Loader2 size={12} style={{ animation: 'spin 0.75s linear infinite' }} /> Generating…</>
              : <><Wand2 size={12} /> ✨ AI Write</>}
          </button>
        </div>
        <textarea className={`form-textarea${errors.description ? ' error' : ''}`}
          placeholder="Describe your event — what to expect, the vibe, who should attend…"
          value={form.description} onChange={(e) => set('description', e.target.value)}
          maxLength={3000} style={{ minHeight: 140 }} />
        {errors.description && <p className="form-error">{errors.description}</p>}
        <p className="form-hint">{form.description.length}/3000 · Click "AI Write" to auto-generate from your title</p>
      </div>

      {/* Date + Location row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Date & Time *</label>
          <input type="datetime-local" className={`form-input${errors.date ? ' error' : ''}`}
            value={form.date} onChange={(e) => set('date', e.target.value)} />
          {errors.date && <p className="form-error">{errors.date}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Location *</label>
          <input className={`form-input${errors.location ? ' error' : ''}`}
            placeholder="City, venue, or 'Online'" value={form.location}
            onChange={(e) => set('location', e.target.value)} maxLength={200} />
          {errors.location && <p className="form-error">{errors.location}</p>}
        </div>
      </div>

      {/* Capacity + Category */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Capacity *</label>
          <input type="number" min="1" max="100000" className={`form-input${errors.capacity ? ' error' : ''}`}
            placeholder="e.g. 100" value={form.capacity}
            onChange={(e) => set('capacity', e.target.value)} />
          {errors.capacity && <p className="form-error">{errors.capacity}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label className="form-label">Tags</label>
        <input className="form-input" placeholder="react, webdev, beginner (comma-separated)"
          value={form.tags} onChange={(e) => set('tags', e.target.value)} />
        <p className="form-hint">Optional — helps people discover your event</p>
      </div>

      {/* Online toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button"
          onClick={() => set('isOnline', !form.isOnline)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 2,
            background: form.isOnline ? 'var(--primary)' : 'var(--surface-2)',
            transition: 'background 0.2s', position: 'relative',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            transform: `translateX(${form.isOnline ? 20 : 0}px)`, transition: 'transform 0.2s',
          }} />
        </button>
        <label style={{ fontSize: 14, color: 'var(--text-2)', cursor: 'pointer' }}
          onClick={() => set('isOnline', !form.isOnline)}>
          🌐 This is an online event
        </label>
      </div>
      {form.isOnline && (
        <div className="form-group">
          <label className="form-label">Meeting Link *</label>
          <input className={`form-input${errors.meetingLink ? ' error' : ''}`}
            type="url" placeholder="https://meet.google.com/..." value={form.meetingLink}
            onChange={(e) => set('meetingLink', e.target.value)} />
          {errors.meetingLink && <p className="form-error">{errors.meetingLink}</p>}
        </div>
      )}

      {/* Image upload */}
      <div className="form-group">
        <label className="form-label">Event Image</label>

        {imagePreview ? (
          <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden',
                        border: '1px solid var(--border)', maxHeight: 240 }}>
            <img src={imagePreview} alt="Preview"
              style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
            <button type="button" onClick={removeImage}
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
              padding: 40, textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.15s', background: 'var(--surface)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } }}
            onDragOver={(e) => e.preventDefault()}
          >
            <ImageIcon size={36} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>Click or drag & drop an image</p>
            <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>JPG, PNG, WEBP, GIF · Max 5 MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
      </div>

      {/* Submit */}
      <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
        {submitting
          ? <><Loader2 size={18} style={{ animation: 'spin 0.75s linear infinite' }} /> Saving…</>
          : initial._id ? '💾 Save Changes' : '🚀 Create Event'}
      </button>
    </form>
  );
}

function toDatetimeLocal(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
