import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, Download, Trash2, CheckSquare, Star, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  Applied: '#6c63ff', Interview: '#f59e0b', Offer: '#22d3a5',
  Rejected: '#ff6584', Wishlist: '#6b7280', OA: '#3b82f6',
  Withdrawn: '#9ca3af', Ghosted: '#4b5563'
};
const STATUSES = ['All', 'Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Ghosted'];
const PRIORITIES = { Dream: '#ff6584', High: '#f59e0b', Medium: '#6c63ff', Low: '#6b7280' };

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const fetchApps = useCallback(() => {
    setLoading(true);
    appAPI.getAll({ status: status === 'All' ? undefined : status, search, page, limit: 15, sortBy })
      .then(res => {
        setApps(res.data.applications);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [status, search, page, sortBy]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;
    await appAPI.delete(id);
    toast.success('Deleted');
    fetchApps();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} applications?`)) return;
    await appAPI.bulkDelete(selected);
    toast.success(`${selected.length} deleted`);
    setSelected([]);
    fetchApps();
  };

  const handleExport = async () => {
    const res = await appAPI.exportCSV();
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'interntrack.csv'; a.click();
    toast.success('Exported!');
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(apps.map(a => a._id));

  const toggleFavorite = async (app) => {
    await appAPI.update(app._id, { isFavorite: !app.isFavorite });
    fetchApps();
  };

  return (
    <div>
      <div style={styles.topRow}>
        <div>
          <h1 style={styles.title}>Applications</h1>
          <p style={styles.sub}>{pagination.total || 0} total applications</p>
        </div>
        <div style={styles.topActions}>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} style={styles.dangerBtn}>
              <Trash2 size={15} /> Delete ({selected.length})
            </button>
          )}
          <button onClick={handleExport} style={styles.outlineBtn}><Download size={15} /> Export CSV</button>
          <Link to="/applications/new" style={styles.addBtn}>+ New</Link>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrap}>
          <Search size={16} style={styles.searchIcon} />
          <input style={styles.searchInput} placeholder="Search company, role, location..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={styles.statusTabs}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              style={{ ...styles.tab, ...(status === s ? styles.tabActive : {}) }}>{s}</button>
          ))}
        </div>
        <select style={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="deadline">Deadline</option>
          <option value="company">Company A-Z</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Bulk select bar */}
      {apps.length > 0 && (
        <div style={styles.bulkBar}>
          <button onClick={selectAll} style={styles.selectAllBtn}><CheckSquare size={14} /> Select all</button>
          {selected.length > 0 && <span style={styles.selectedCount}>{selected.length} selected</span>}
        </div>
      )}

      {/* Table */}
      {loading ? <div style={styles.loading}>Loading...</div> : (
        <div style={styles.tableWrap}>
          {apps.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</div>
              <p>No applications found.</p>
              <Link to="/applications/new" style={styles.addBtn}>+ Add your first</Link>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}></th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Applied</th>
                  <th style={styles.th}>Deadline</th>
                  <th style={styles.th}>Stipend</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app._id} style={styles.tr} onClick={() => navigate(`/applications/${app._id}`)}>
                    <td style={styles.td} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(app._id)}
                        onChange={() => toggleSelect(app._id)} style={{ cursor: 'pointer' }} />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.companyCell}>
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(app); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={14} fill={app.isFavorite ? '#f59e0b' : 'none'} color={app.isFavorite ? '#f59e0b' : '#6b7280'} />
                        </button>
                        <span style={styles.companyName}>{app.company}</span>
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.role}>{app.role}</span></td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: `${STATUS_COLORS[app.status]}22`, color: STATUS_COLORS[app.status] || '#6b7280' }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.priorityDot, background: PRIORITIES[app.priority] || '#6b7280' }} />
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{app.priority}</span>
                    </td>
                    <td style={styles.td}><span style={styles.meta}>{app.dateApplied ? format(new Date(app.dateApplied), 'dd MMM') : '—'}</span></td>
                    <td style={styles.td}>
                      <span style={{ ...styles.meta, color: isUrgent(app.deadline) ? '#ff6584' : '#6b7280' }}>
                        {app.deadline ? format(new Date(app.deadline), 'dd MMM') : '—'}
                      </span>
                    </td>
                    <td style={styles.td}><span style={styles.meta}>{app.stipend || '—'}</span></td>
                    <td style={styles.td} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {app.jobLink && (
                          <a href={app.jobLink} target="_blank" rel="noopener noreferrer" style={styles.iconBtn}>
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button onClick={() => navigate(`/applications/${app._id}/edit`)} style={styles.iconBtn}>✏️</button>
                        <button onClick={() => handleDelete(app._id)} style={{ ...styles.iconBtn, color: '#ff6584' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ ...styles.pageBtn, ...(page === p ? styles.pageBtnActive : {}) }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function isUrgent(deadline) {
  if (!deadline) return false;
  return new Date(deadline) - new Date() < 3 * 86400000;
}

const styles = {
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: '#e8eaf0' },
  sub: { color: '#6b7280', fontSize: '0.88rem', marginTop: 4 },
  topActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  addBtn: { padding: '8px 18px', borderRadius: 10, background: '#6c63ff', color: '#fff', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem' },
  outlineBtn: { padding: '8px 14px', borderRadius: 10, border: '1px solid #252a38', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 },
  dangerBtn: { padding: '8px 14px', borderRadius: 10, border: '1px solid #ff658433', background: 'rgba(255,101,132,0.1)', color: '#ff6584', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 },
  filtersBar: { display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { position: 'relative', flex: '1', minWidth: 200 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' },
  searchInput: { width: '100%', background: '#13161f', border: '1px solid #252a38', borderRadius: 10, padding: '9px 14px 9px 36px', color: '#e8eaf0', fontSize: '0.88rem', outline: 'none', fontFamily: 'DM Sans' },
  statusTabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tab: { padding: '6px 12px', borderRadius: 8, border: '1px solid #252a38', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'DM Sans' },
  tabActive: { background: '#6c63ff', color: '#fff', border: '1px solid #6c63ff' },
  sortSelect: { background: '#13161f', border: '1px solid #252a38', borderRadius: 8, padding: '8px 10px', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'DM Sans' },
  bulkBar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  selectAllBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.82rem' },
  selectedCount: { color: '#6c63ff', fontSize: '0.82rem', fontWeight: 600 },
  loading: { color: '#6b7280', padding: 40, textAlign: 'center' },
  tableWrap: { background: '#13161f', border: '1px solid #252a38', borderRadius: 14, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, borderBottom: '1px solid #252a38', whiteSpace: 'nowrap' },
  tr: { cursor: 'pointer', borderBottom: '1px solid #1a1e2a', transition: 'background 0.15s' },
  td: { padding: '14px 16px', color: '#e8eaf0', fontSize: '0.88rem', verticalAlign: 'middle' },
  companyCell: { display: 'flex', alignItems: 'center', gap: 8 },
  companyName: { fontWeight: 600 },
  role: { color: '#9ca3af', fontSize: '0.85rem' },
  badge: { padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 },
  priorityDot: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 6 },
  meta: { color: '#6b7280', fontSize: '0.82rem' },
  iconBtn: { background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#9ca3af', fontSize: '0.8rem', textDecoration: 'none' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#6b7280' },
  pagination: { display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 },
  pageBtn: { padding: '6px 12px', borderRadius: 8, border: '1px solid #252a38', background: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem' },
  pageBtnActive: { background: '#6c63ff', color: '#fff', border: '1px solid #6c63ff' }
};