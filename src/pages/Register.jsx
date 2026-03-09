import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const S = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0c0e14', padding:20 },
  card:  { background:'#13161f', border:'1px solid #252a38', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:420 },
  logo:  { fontFamily:'Syne', fontWeight:800, fontSize:'1.3rem', color:'#e8eaf0', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  title: { fontFamily:'Syne', fontWeight:800, fontSize:'1.8rem', color:'#e8eaf0', textAlign:'center', marginBottom:8 },
  sub:   { color:'#6b7280', fontSize:'0.9rem', textAlign:'center', marginBottom:28 },
  field: { display:'flex', flexDirection:'column', gap:6, marginBottom:16 },
  label: { fontSize:'0.8rem', color:'#9ca3af', fontWeight:500 },
  input: { background:'#1a1e2a', border:'1px solid #252a38', borderRadius:10, padding:'11px 14px', color:'#e8eaf0', fontSize:'0.9rem', outline:'none', fontFamily:'DM Sans' },
  btn:   { width:'100%', marginTop:8, padding:12, borderRadius:10, background:'#6c63ff', border:'none', color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:'0.95rem', cursor:'pointer' },
  foot:  { textAlign:'center', marginTop:24, color:'#6b7280', fontSize:'0.88rem' },
  link:  { color:'#6c63ff', textDecoration:'none', fontWeight:600 },
};

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { await register(form.name, form.email, form.password); toast.success('Account created!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}><span style={{ color:'#6c63ff' }}>◈</span> InternTrack</div>
        <div style={S.title}>Get started</div>
        <div style={S.sub}>Create your free account</div>
        <form onSubmit={submit}>
          {[['name','Full Name','text','Your Name'],['email','Email','email','you@example.com'],['password','Password','password','••••••••']].map(([k,lbl,t,ph])=>(
            <div key={k} style={S.field}><label style={S.label}>{lbl}</label><input style={S.input} type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} required/></div>
          ))}
          <button type="submit" style={S.btn} disabled={loading}>{loading?'Creating…':'Create Account'}</button>
        </form>
        <div style={S.foot}>Have an account? <Link to="/login" style={S.link}>Sign in</Link></div>
      </div>
    </div>
  );
}