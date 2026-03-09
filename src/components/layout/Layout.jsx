import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Briefcase, FileText, StickyNote, BarChart3, Settings, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications',icon: Briefcase,       label: 'Applications' },
  { to: '/resumes',     icon: FileText,         label: 'Resumes' },
  { to: '/notes',       icon: StickyNote,       label: 'Notes' },
  { to: '/analytics',   icon: BarChart3,        label: 'Analytics' },
  { to: '/settings',    icon: Settings,         label: 'Settings' },
];

const S = {
  shell:    { display:'flex', minHeight:'100vh', background:'#0c0e14' },
  overlay:  { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:149 },
  sidebar:  { width:240, background:'#13161f', borderRight:'1px solid #252a38', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, height:'100vh', zIndex:150 },
  sTop:     { padding:'20px 20px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #252a38' },
  logo:     { display:'flex', alignItems:'center', gap:8, fontFamily:'Syne', fontWeight:800, fontSize:'1.15rem', color:'#e8eaf0' },
  logoIcon: { color:'#6c63ff' },
  nav:      { flex:1, padding:'16px 12px', display:'flex', flexDirection:'column', gap:4, overflowY:'auto' },
  link:     { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, color:'#6b7280', textDecoration:'none', fontSize:'0.9rem', fontWeight:500 },
  linkA:    { background:'rgba(108,99,255,0.12)', color:'#6c63ff' },
  sBot:     { padding:16, borderTop:'1px solid #252a38' },
  uCard:    { display:'flex', alignItems:'center', gap:10, marginBottom:12 },
  avatar:   { width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6c63ff,#ff6584)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:700, fontSize:'0.85rem', color:'#fff', flexShrink:0 },
  uName:    { fontWeight:600, fontSize:'0.88rem', color:'#e8eaf0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  uEmail:   { fontSize:'0.75rem', color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  logout:   { display:'flex', alignItems:'center', gap:8, width:'100%', background:'transparent', border:'1px solid #252a38', borderRadius:8, padding:'8px 12px', color:'#6b7280', cursor:'pointer', fontSize:'0.85rem' },
  main:     { flex:1, marginLeft:240, display:'flex', flexDirection:'column', minHeight:'100vh' },
  topbar:   { position:'sticky', top:0, zIndex:100, background:'rgba(12,14,20,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid #252a38', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  addBtn:   { padding:'8px 18px', borderRadius:10, background:'#6c63ff', color:'#fff', textDecoration:'none', fontFamily:'Syne', fontWeight:700, fontSize:'0.85rem' },
  content:  { flex:1, padding:'28px 28px 48px' },
  menuBtn:  { background:'none', border:'none', color:'#e8eaf0', cursor:'pointer' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div style={S.shell}>
      {open && <div style={S.overlay} onClick={() => setOpen(false)} />}
      <aside style={{ ...S.sidebar, transform: open ? 'translateX(0)' : undefined }}>
        <div style={S.sTop}>
          <div style={S.logo}><span style={S.logoIcon}>◈</span> InternTrack</div>
          <button style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer' }} onClick={() => setOpen(false)}><X size={18}/></button>
        </div>
        <nav style={S.nav}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              style={({ isActive }) => ({ ...S.link, ...(isActive ? S.linkA : {}) })}>
              {({ isActive }) => (<><Icon size={18} style={{ flexShrink:0 }}/><span>{label}</span>{isActive && <ChevronRight size={14} style={{ marginLeft:'auto', opacity:0.5 }}/>}</>)}
            </NavLink>
          ))}
        </nav>
        <div style={S.sBot}>
          <div style={S.uCard}>
            <div style={S.avatar}>{initials}</div>
            <div style={{ overflow:'hidden' }}>
              <div style={S.uName}>{user?.name}</div>
              <div style={S.uEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={S.logout} onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={16}/><span>Logout</span>
          </button>
        </div>
      </aside>
      <div style={S.main}>
        <header style={S.topbar}>
          <button style={S.menuBtn} onClick={() => setOpen(true)}><Menu size={22}/></button>
          <NavLink to="/applications/new" style={S.addBtn}>+ Add Application</NavLink>
        </header>
        <div style={S.content}><Outlet /></div>
      </div>
    </div>
  );
}