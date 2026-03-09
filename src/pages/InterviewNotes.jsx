import React, { useEffect, useState } from 'react';
import { noteAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Pin, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['All', 'Interview Prep', 'Company Research', 'Questions Asked', 'Personal Reflection', 'Coding Problem', 'General'];
const COLORS = { default: '#252a38', blue: '#1e3a5f', green: '#14432a', yellow: '#3d3000', red: '#3d1a1a', purple: '#2a1a3d' };
const COLOR_ACCENTS = { default: '#9ca3af', blue: '#3b82f6', green: '#22d3a5', yellow: '#f59e0b', red: '#ff6584', purple: '#a78bfa' };

export default function InterviewNotes() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'General', tags: '', isPinned: false, color: 'default' });

  const fetchNotes = () => {
    noteAPI.getAll({ type: filter === 'All' ? undefined : filter, search })
      .then(r => setNotes(r.data.notes));
  };
  useEffect(() => { fetchNotes(); }, [filter, search]);

  const openNew = () => { setEditing(null); setForm({ title: '', content: '', type: 'General', tags: '', isPinned: false, color: 'default' }); setShowForm(true); };
  const openEdit = (note) => { setEditing(note); setForm({ ...note, tags: (note.tags || []).join(', ') }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (editing) { await noteAPI.update(editing._id, payload); toast.success('Note updated'); }
      else { await noteAPI.create(payload); toast.success('Note created'); }
      setShowForm(false);
      fetchNotes();
    } catch (err) { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    await noteAPI.delete(id);
    toast.success('Deleted');
    fetchNotes();
  };

  const togglePin = async (note) => {
    await noteAPI.update(note._id, { isPinned: !note.isPinned });
    fetchNotes();
  };

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.title}>Interview Notes</h1>
          <p style={styles.sub}>Company research, prep notes, coding problems</p>
        </div>
        <button onClick={openNew} style={styles.addBtn}><Plus size={15} /> New Note</button>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <div style={styles.searchWrap}>
          <Search size={15} style={styles.searchIcon} />
          <input style={styles.searchInput} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={styles.typeTabs}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ ...styles.tab, ...(filter === t ? styles.tabActive : {}) }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Note form modal */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editing ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <input style={styles.input} placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div style={styles.formRow}>
                <select style={styles.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
                </select>
                <select style={styles.select} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}>
                  {Object.keys(COLORS).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <textarea style={{ ...styles.input, minHeight: 180, resize: 'vertical' }}
                placeholder="Write your notes here..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              <div style={styles.formRow}>
                <input style={styles.input} placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                <label style={styles.pinLabel}>
                  <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} />
                  📌 Pin this note
                </label>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={styles.saveBtn}>Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      <div style={styles.notesGrid}>
        {notes.length === 0 ? (
          <div style={styles.empty}><div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div><p>No notes yet. Create your first one!</p></div>
        ) : notes.map(note => (
          <div key={note._id} style={{ ...styles.noteCard, background: COLORS[note.color] || COLORS.default, borderColor: `${COLOR_ACCENTS[note.color]}33` }}>
            <div style={styles.noteTop}>
              <span style={{ ...styles.noteType, color: COLOR_ACCENTS[note.color] || COLOR_ACCENTS.default }}>{note.type}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {note.isPinned && <Pin size={13} color="#f59e0b" fill="#f59e0b" />}
                <button onClick={() => togglePin(note)} style={styles.iconBtn}><Pin size={13} /></button>
                <button onClick={() => openEdit(note)} style={styles.iconBtn}><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(note._id)} style={{ ...styles.iconBtn, color: '#ff6584' }}><Trash2 size={13} /></button>
              </div>
            </div>
            <h3 style={styles.noteTitle}>{note.title}</h3>
            {note.application && <div style={styles.noteApp}>📎 {note.application.company} — {note.application.role}</div>}
            {note.content && <p style={styles.noteContent}>{note.content}</p>}
            {note.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                {note.tags.map(t => <span key={t} style={styles.noteTag}>{t}</span>)}
              </div>
            )}
            <div style={styles.noteDate}>{format(new Date(note.updatedAt), 'dd MMM yyyy')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: '#e8eaf0' },
  sub: { color: '#6b7280', fontSize: '0.88rem', marginTop: 4 },
  addBtn: { padding: '9px 18px', borderRadius: 10, background: '#6c63ff', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 },
  filtersRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: 1, minWidth: 200 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' },
  searchInput: { width: '100%', background: '#13161f', border: '1px solid #252a38', borderRadius: 10, padding: '9px 14px 9px 36px', color: '#e8eaf0', fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans' },
  typeTabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tab: { padding: '6px 12px', borderRadius: 8, border: '1px solid #252a38', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '0.78rem' },
  tabActive: { background: '#6c63ff', color: '#fff', border: '1px solid #6c63ff' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#13161f', border: '1px solid #252a38', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#e8eaf0' },
  closeBtn: { background: '#1a1e2a', border: '1px solid #252a38', color: '#6b7280', borderRadius: 8, width: 30, height: 30, cursor: 'pointer' },
  modalBody: { padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  modalFooter: { padding: '0 24px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  formRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input: { background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 10, padding: '9px 14px', color: '#e8eaf0', fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans', width: '100%' },
  select: { flex: 1, background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 10, padding: '9px 14px', color: '#e8eaf0', fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans' },
  pinLabel: { display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer', flex: 1, padding: '9px 0' },
  saveBtn: { padding: '9px 22px', borderRadius: 10, background: '#6c63ff', border: 'none', color: '#fff', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' },
  cancelBtn: { padding: '9px 18px', borderRadius: 10, border: '1px solid #252a38', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '0.88rem' },
  notesGrid: { columns: '300px', gap: 14 },
  noteCard: { break_inside: 'avoid', border: '1px solid', borderRadius: 14, padding: '16px', marginBottom: 14, display: 'flex', flexDirection: 'column' },
  noteTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteType: { fontSize: '0.72rem', fontWeight: 600 },
  iconBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 2 },
  noteTitle: { fontFamily: 'Syne', fontWeight: 700, color: '#e8eaf0', fontSize: '0.95rem', marginBottom: 6 },
  noteApp: { color: '#6b7280', fontSize: '0.78rem', marginBottom: 6 },
  noteContent: { color: '#9ca3af', fontSize: '0.83rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  noteTag: { padding: '2px 7px', background: 'rgba(0,0,0,0.2)', borderRadius: 99, fontSize: '0.7rem', color: '#9ca3af' },
  noteDate: { color: '#4b5563', fontSize: '0.72rem', marginTop: 10 },
  empty: { textAlign: 'center', color: '#6b7280', padding: '60px 20px', gridColumn: '1/-1' }
};