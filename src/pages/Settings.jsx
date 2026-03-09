import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, reminderAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name:user?.name||'', college:user?.college||'', degree:user?.degree||'', graduationYear:user?.graduationYear||'', linkedIn:user?.linkedIn||'', github:user?.github||'', applicationGoal:user?.applicationGoal||50, emailReminders:user?.emailReminders??true, reminderDaysBefore:user?.reminderDaysBefore||3 });
  const [skills, setSkills] = useState((user?.skills||[]).join(', '));
  const [pwd, setPwd] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  const inp = { background:'#1a1e2a', border:'1px solid #252a38', borderRadius:10, padding:'10px 14px', color:'#e8eaf0', fontSize:'0.88rem', outline:'none', fontFamily:'DM Sans', width:'100%' };
  const lbl = { fontSize:'0.78rem', color:'#6b7280', fontWeight:500 };
  const fld = { display:'flex', flexDirection:'column', gap:6 };
  const sec = { background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'22px 24px', marginBottom:16 };
  const sh  = { fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', marginBottom:18, fontSize:'1rem' };
  const row = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await authAPI.updateProfile({ ...profile, skills: skills.split(',').map(s=>s.trim()).filter(Boolean) });
      updateUser(r.data.user);
      toast.success('Profile saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const savePwd = async () => {
    if (!pwd.currentPassword||!pwd.newPassword) return toast.error('Fill all fields');
    if (pwd.newPassword !== pwd.confirm) return toast.error('Passwords do not match');
    if (pwd.newPassword.length < 6) return toast.error('Min 6 characters');
    setSaving(true);
    try { await authAPI.changePassword({ currentPassword:pwd.currentPassword, newPassword:pwd.newPassword }); toast.success('Password changed!'); setPwd({ currentPassword:'', newPassword:'', confirm:'' }); }
    catch(err) { toast.error(err.response?.data?.error||'Failed'); }
    finally { setSaving(false); }
  };

  const testEmail = async () => {
    try { await reminderAPI.sendTest(); toast.success('Test email sent!'); }
    catch(err) { toast.error(err.response?.data?.error||'Email not configured'); }
  };

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e8eaf0', marginBottom:24 }}>Settings</h1>

      <div style={{ display:'flex', gap:4, marginBottom:20, background:'#13161f', padding:4, borderRadius:12, width:'fit-content', border:'1px solid #252a38' }}>
        {[['profile','Profile'],['security','Security'],['reminders','Reminders']].map(([k,v])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ padding:'8px 18px', borderRadius:9, border:'none', background:tab===k?'#6c63ff':'transparent', color:tab===k?'#fff':'#6b7280', cursor:'pointer', fontFamily:'Syne', fontWeight:600, fontSize:'0.85rem' }}>{v}</button>
        ))}
      </div>

      {tab==='profile' && <>
        <div style={sec}>
          <div style={sh}>Personal Info</div>
          <div style={{ ...row }}><div style={fld}><label style={lbl}>Full Name</label><input style={inp} value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/></div><div style={fld}><label style={lbl}>College / University</label><input style={inp} value={profile.college} onChange={e=>setProfile(p=>({...p,college:e.target.value}))}/></div></div>
          <div style={{ ...row }}><div style={fld}><label style={lbl}>Degree</label><input style={inp} value={profile.degree} onChange={e=>setProfile(p=>({...p,degree:e.target.value}))} placeholder="B.Tech CSE"/></div><div style={fld}><label style={lbl}>Graduation Year</label><input type="number" style={inp} value={profile.graduationYear} onChange={e=>setProfile(p=>({...p,graduationYear:e.target.value}))} placeholder="2026"/></div></div>
          <div style={{ ...row }}><div style={fld}><label style={lbl}>LinkedIn URL</label><input style={inp} value={profile.linkedIn} onChange={e=>setProfile(p=>({...p,linkedIn:e.target.value}))}/></div><div style={fld}><label style={lbl}>GitHub URL</label><input style={inp} value={profile.github} onChange={e=>setProfile(p=>({...p,github:e.target.value}))}/></div></div>
          <div style={{ marginBottom:14 }}><div style={{ ...fld }}><label style={lbl}>Skills (comma separated)</label><input style={inp} value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Python, React, SQL"/></div></div>
        </div>
        <div style={sec}>
          <div style={sh}>Goals</div>
          <div style={{ ...fld, maxWidth:300 }}><label style={lbl}>Application Goal (total apps to send)</label><input type="number" style={inp} value={profile.applicationGoal} onChange={e=>setProfile(p=>({...p,applicationGoal:Number(e.target.value)}))}/></div>
        </div>
        <button onClick={saveProfile} disabled={saving} style={{ padding:'10px 28px', borderRadius:10, background:'#6c63ff', border:'none', color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>{saving?'Saving…':'Save Changes'}</button>
      </>}

      {tab==='security' && <>
        <div style={sec}>
          <div style={sh}>Change Password</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[['currentPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm New Password']].map(([k,l])=>(
              <div key={k} style={fld}><label style={lbl}>{l}</label><input type="password" style={inp} value={pwd[k]} onChange={e=>setPwd(p=>({...p,[k]:e.target.value}))} placeholder="••••••••"/></div>
            ))}
            <button onClick={savePwd} disabled={saving} style={{ padding:'10px 28px', borderRadius:10, background:'#6c63ff', border:'none', color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', width:'fit-content' }}>{saving?'Updating…':'Change Password'}</button>
          </div>
        </div>
        <div style={sec}>
          <div style={sh}>Account Info</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, color:'#9ca3af', fontSize:'0.88rem' }}>
            <div><span style={{ color:'#6b7280' }}>Email: </span>{user?.email}</div>
            <div><span style={{ color:'#6b7280' }}>Member since: </span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
          </div>
        </div>
      </>}

      {tab==='reminders' && <>
        <div style={sec}>
          <div style={sh}>Email Reminders</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
              <div onClick={()=>setProfile(p=>({...p,emailReminders:!p.emailReminders}))} style={{ width:44, height:24, borderRadius:99, background:profile.emailReminders?'#6c63ff':'#252a38', position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:profile.emailReminders?23:3, transition:'left 0.2s' }}/>
              </div>
              <span style={{ color:'#9ca3af', fontSize:'0.9rem' }}>Enable deadline reminders</span>
            </label>
            <div style={{ ...fld, maxWidth:260 }}>
              <label style={lbl}>Remind me _ days before deadline</label>
              <input type="number" style={inp} min={1} max={14} value={profile.reminderDaysBefore} onChange={e=>setProfile(p=>({...p,reminderDaysBefore:Number(e.target.value)}))}/>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={saveProfile} disabled={saving} style={{ padding:'10px 24px', borderRadius:10, background:'#6c63ff', border:'none', color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>{saving?'Saving…':'Save Preferences'}</button>
          <button onClick={testEmail} style={{ padding:'10px 20px', borderRadius:10, border:'1px solid #252a38', background:'transparent', color:'#9ca3af', cursor:'pointer', fontSize:'0.88rem' }}>Send Test Email</button>
        </div>
        <p style={{ color:'#4b5563', fontSize:'0.78rem', marginTop:12 }}>Configure SMTP_HOST, SMTP_USER, SMTP_PASS in server/.env to enable email delivery.</p>
      </>}
    </div>
  );
}