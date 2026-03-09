import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { appAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ExternalLink, Edit, Trash2, Clock, Plus } from 'lucide-react';

const STATUS_COLORS = { Applied: '#6c63ff', Interview: '#f59e0b', Offer: '#22d3a5', Rejected: '#ff6584', Wishlist: '#6b7280', OA: '#3b82f6', Withdrawn: '#9ca3af', Ghosted: '#4b5563' };

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [tlEvent, setTlEvent] = useState({ event: '', note: '' });
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [round, setRound] = useState({ round: 1, type: 'Technical', date: '', duration: 60, feedback: '', result: 'Pending' });

  const fetchApp = () => {
    appAPI.getOne(id).then(res => { setApp(res.data.application); setLoading(false); });
  };
  useEffect(() => { fetchApp(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    await appAPI.delete(id);
    toast.success('Deleted');
    navigate('/applications');
  };

  const addTimeline = async () => {
    if (!tlEvent.event) return;
    await appAPI.addTimeline(id, tlEvent);
    toast.success('Event added');
    setTlEvent({ event: '', note: '' });
    setShowTimelineForm(false);
    fetchApp();
  };

  const addRound = async () => {
    await appAPI.addInterviewRound(id, round);
    toast.success('Round added');
    setShowRoundForm(false);
    fetchApp();
  };

  if (loading) return <div style={{ color: '#6b7280', padding: 40 }}>Loading...</div>;
  if (!app) return <div style={{ color: '#ff6584', padding: 40 }}>Application not found</div>;

  const color = STATUS_COLORS[app.status] || '#6b7280';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={styles.company}>{app.company}</h1>
            <span style={{ ...styles.badge, background: `${color}22`, color }}>{app.status}</span>
            {app.isFavorite && <span>⭐</span>}
          </div>
          <div style={styles.role}>{app.role}</div>
          <div style={styles.meta}>
            {app.location && <span>📍 {app.location}</span>}
            {app.workType && <span>🏠 {app.workType}</span>}
            {app.domain && <span>💼 {app.domain}</span>}
            {app.stipend && <span>💰 {app.stipend}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {app.jobLink && <a href={app.jobLink} target="_blank" rel="noopener noreferrer" style={styles.outlineBtn}><ExternalLink size={14} /> Job Link</a>}
          <Link to={`/applications/${id}/edit`} style={styles.outlineBtn}><Edit size={14} /> Edit</Link>
          <button onClick={handleDelete} style={styles.dangerBtn}><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Column */}
        <div style={styles.left}>
          {/* Dates */}
          <Card title="Dates">
            <InfoRow label="Applied" value={app.dateApplied ? format(new Date(app.dateApplied), 'dd MMM yyyy') : '—'} />
            <InfoRow label="Deadline" value={app.deadline ? format(new Date(app.deadline), 'dd MMM yyyy') : '—'} urgent={isUrgent(app.deadline)} />
            <InfoRow label="Start Date" value={app.startDate ? format(new Date(app.startDate), 'dd MMM yyyy') : '—'} />
            <InfoRow label="End Date" value={app.endDate ? format(new Date(app.endDate), 'dd MMM yyyy') : '—'} />
          </Card>

          {/* Recruiter */}
          {(app.recruiterName || app.recruiterEmail) && (
            <Card title="Recruiter Contact">
              {app.recruiterName && <InfoRow label="Name" value={app.recruiterName} />}
              {app.recruiterEmail && <InfoRow label="Email" value={app.recruiterEmail} />}
              {app.referredBy && <InfoRow label="Referred By" value={app.referredBy} />}
            </Card>
          )}

          {/* Notes */}
          {app.notes && (
            <Card title="Notes">
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{app.notes}</p>
            </Card>
          )}

          {/* Tags */}
          {app.tags?.length > 0 && (
            <Card title="Tags">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {app.tags.map(t => (
                  <span key={t} style={{ padding: '3px 10px', background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 99, fontSize: '0.78rem', color: '#9ca3af' }}>{t}</span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div style={styles.right}>
          {/* Interview Rounds */}
          <Card title="Interview Rounds" action={<button onClick={() => setShowRoundForm(v => !v)} style={styles.smallBtn}><Plus size={12} /> Add Round</button>}>
            {showRoundForm && (
              <div style={styles.miniForm}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['round', 'duration'].map(k => (
                    <input key={k} type="number" placeholder={k === 'round' ? 'Round #' : 'Duration (min)'} style={{ ...styles.miniInput, flex: 1 }}
                      value={round[k]} onChange={e => setRound(r => ({ ...r, [k]: e.target.value }))} />
                  ))}
                  <select style={{ ...styles.miniInput, flex: 1 }} value={round.type} onChange={e => setRound(r => ({ ...r, type: e.target.value }))}>
                    {['Phone', 'Technical', 'HR', 'System Design', 'Assignment', 'Group Discussion', 'Final'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input type="date" style={{ ...styles.miniInput, flex: 1 }} value={round.date} onChange={e => setRound(r => ({ ...r, date: e.target.value }))} />
                  <select style={{ ...styles.miniInput, flex: 1 }} value={round.result} onChange={e => setRound(r => ({ ...r, result: e.target.value }))}>
                    {['Pending', 'Scheduled', 'Passed', 'Failed'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <textarea style={{ ...styles.miniInput, width: '100%', minHeight: 60, resize: 'vertical', marginTop: 8 }}
                  placeholder="Feedback / notes..." value={round.feedback} onChange={e => setRound(r => ({ ...r, feedback: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={addRound} style={styles.saveBtn}>Save Round</button>
                  <button onClick={() => setShowRoundForm(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}
            {app.interviewRounds?.length === 0 && !showRoundForm && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No rounds tracked yet.</p>}
            {app.interviewRounds?.map((r, i) => (
              <div key={i} style={styles.roundCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#e8eaf0', fontSize: '0.88rem' }}>Round {r.round} — {r.type}</span>
                  <span style={{ fontSize: '0.75rem', color: r.result === 'Passed' ? '#22d3a5' : r.result === 'Failed' ? '#ff6584' : '#f59e0b' }}>{r.result}</span>
                </div>
                {r.date && <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{format(new Date(r.date), 'dd MMM yyyy')} · {r.duration}min</div>}
                {r.feedback && <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: 4 }}>{r.feedback}</p>}
              </div>
            ))}
          </Card>

          {/* Timeline */}
          <Card title="Timeline" action={<button onClick={() => setShowTimelineForm(v => !v)} style={styles.smallBtn}><Plus size={12} /> Add Event</button>}>
            {showTimelineForm && (
              <div style={styles.miniForm}>
                <input style={styles.miniInput} placeholder="Event description *" value={tlEvent.event} onChange={e => setTlEvent(t => ({ ...t, event: e.target.value }))} />
                <input style={{ ...styles.miniInput, marginTop: 6 }} placeholder="Optional note..." value={tlEvent.note} onChange={e => setTlEvent(t => ({ ...t, note: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={addTimeline} style={styles.saveBtn}>Save</button>
                  <button onClick={() => setShowTimelineForm(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}
            <div style={styles.timeline}>
              {[...(app.timeline || [])].reverse().map((t, i) => (
                <div key={i} style={styles.tlItem}>
                  <div style={styles.tlDot} />
                  <div style={styles.tlContent}>
                    <div style={styles.tlEvent}>{t.event}</div>
                    {t.note && <div style={styles.tlNote}>{t.note}</div>}
                    <div style={styles.tlDate}>{format(new Date(t.date), 'dd MMM yyyy, hh:mm a')}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <div style={{ background: '#13161f', border: '1px solid #252a38', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#e8eaf0', fontSize: '0.95rem' }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, urgent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1e2a' }}>
      <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>{label}</span>
      <span style={{ color: urgent ? '#ff6584' : '#9ca3af', fontSize: '0.82rem', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function isUrgent(deadline) {
  if (!deadline) return false;
  return new Date(deadline) - new Date() < 3 * 86400000;
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  company: { fontFamily: 'Syne', fontWeight: 800, fontSize: '1.7rem', color: '#e8eaf0' },
  role: { color: '#9ca3af', fontSize: '1rem', marginBottom: 8 },
  meta: { display: 'flex', gap: 16, flexWrap: 'wrap', color: '#6b7280', fontSize: '0.85rem' },
  badge: { padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 },
  outlineBtn: { padding: '8px 14px', borderRadius: 9, border: '1px solid #252a38', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' },
  dangerBtn: { padding: '8px 14px', borderRadius: 9, border: '1px solid #ff658433', background: 'rgba(255,101,132,0.1)', color: '#ff6584', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  left: {},
  right: {},
  roundCard: { background: '#1a1e2a', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  tlItem: { display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' },
  tlDot: { width: 10, height: 10, borderRadius: '50%', background: '#6c63ff', flexShrink: 0, marginTop: 4 },
  tlContent: { flex: 1 },
  tlEvent: { color: '#e8eaf0', fontSize: '0.85rem', fontWeight: 500 },
  tlNote: { color: '#6b7280', fontSize: '0.78rem', marginTop: 2 },
  tlDate: { color: '#4b5563', fontSize: '0.75rem', marginTop: 2 },
  miniForm: { background: '#1a1e2a', borderRadius: 10, padding: 14, marginBottom: 14 },
  miniInput: { background: '#13161f', border: '1px solid #252a38', borderRadius: 8, padding: '8px 12px', color: '#e8eaf0', fontSize: '0.85rem', outline: 'none', width: '100%', fontFamily: 'DM Sans' },
  saveBtn: { padding: '7px 16px', borderRadius: 8, background: '#6c63ff', border: 'none', color: '#fff', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  cancelBtn: { padding: '7px 14px', borderRadius: 8, border: '1px solid #252a38', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '0.82rem' },
  smallBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid #252a38', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '0.78rem' }
};