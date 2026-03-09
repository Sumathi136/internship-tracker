import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}><span style={styles.logoIcon}>◈</span> InternTrack</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.sub}>Sign in to continue tracking your journey</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footer}>
          No account? <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0e14', padding: 20 },
  card: { background: '#13161f', border: '1px solid #252a38', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420 },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: '#e8eaf0', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoIcon: { color: '#6c63ff' },
  title: { fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#e8eaf0', marginBottom: 8 },
  sub: { color: '#6b7280', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 },
  input: { background: '#1a1e2a', border: '1px solid #252a38', borderRadius: 10, padding: '11px 14px', color: '#e8eaf0', fontSize: '0.9rem', outline: 'none', fontFamily: 'DM Sans' },
  btn: { marginTop: 8, padding: '12px', borderRadius: 10, background: '#6c63ff', border: 'none', color: '#fff', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: '0.88rem' },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 600 }
};