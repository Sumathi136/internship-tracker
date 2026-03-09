import React, { useEffect, useState } from 'react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, Star, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ResumeManager() {
  const [resumes, setResumes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name:'', version:'v1', tags:'', notes:'' });
  const [uploading, setUploading] = useState(false);

  const load = () => resumeAPI.getAll().then(r => setResumes(r.data.resumes));
  useEffect(() => { load(); }, []);

  const upload = async e => {
    e.preventDefault();
    if (!file) return toast.error('Select a file first');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('name', form.name || file.name);
      fd.append('version', form.version);
      fd.append('tags', form.tags);
      fd.append('notes', form.notes);
      await resumeAPI.upload(fd);
      toast.success('Uploaded!');
      setShowForm(false); setFile(null); setForm({ name:'', version:'v1', tags:'', notes:'' });
      load();
    } catch(err) { toast.error(err.response?.data?.error||'Upload failed'); }
    finally { setUploading(false); }
  };

  const del = async id => { if(!confirm('Delete?')) return; await resumeAPI.delete(id); toast.success('Deleted'); load(); };
  const setDef = async id => { await resumeAPI.update(id, { isDefault:true }); toast.success('Set as default'); load(); };
  const fmt = b => !b?'':b<1024?b+'B':b<1048576?(b/1024).toFixed(1)+'KB':(b/1048576).toFixed(1)+'MB';

  const inp = { background:'#1a1e2a', border:'1px solid #252a38', borderRadius:10, padding:'9px 14px', color:'#e8eaf0', fontSize:'0.88rem', outline:'none', fontFamily:'DM Sans' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div><h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e8eaf0' }}>Resume Manager</h1><p style={{ color:'#6b7280', fontSize:'0.88rem', marginTop:4 }}>Store and manage your resume versions</p></div>
        <button onClick={()=>setShowForm(v=>!v)} style={{ padding:'9px 18px', borderRadius:10, background:'#6c63ff', color:'#fff', border:'none', cursor:'pointer', fontFamily:'Syne', fontWeight:700, fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}><Upload size={15}/>Upload Resume</button>
      </div>

      {showForm && (
        <div style={{ background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px 24px', marginBottom:20 }}>
          <h3 style={{ fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', marginBottom:16 }}>Upload New Resume</h3>
          <form onSubmit={upload}>
            <div onClick={()=>document.getElementById('rfile').click()} style={{ border:'2px dashed #252a38', borderRadius:12, padding:32, textAlign:'center', cursor:'pointer', marginBottom:16 }}>
              <input id="rfile" type="file" accept=".pdf,.doc,.docx" hidden onChange={e=>setFile(e.target.files[0])}/>
              <FileText size={32} color="#6c63ff" style={{ margin:'0 auto 8px' }}/>
              <div style={{ color: file?'#22d3a5':'#9ca3af' }}>{file?file.name:'Click to select PDF / DOC / DOCX (max 5MB)'}</div>
            </div>
            <div style={{ display:'flex', gap:16, marginBottom:12, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:'0.78rem', color:'#6b7280' }}>Name</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="SWE Intern v2"/></div>
              <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:'0.78rem', color:'#6b7280' }}>Version</label><input style={inp} value={form.version} onChange={e=>setForm(f=>({...f,version:e.target.value}))} placeholder="v1"/></div>
            </div>
            <div style={{ display:'flex', gap:16, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:'0.78rem', color:'#6b7280' }}>Tags</label><input style={inp} value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="SWE, Data"/></div>
              <div style={{ flex:1, minWidth:180, display:'flex', flexDirection:'column', gap:6 }}><label style={{ fontSize:'0.78rem', color:'#6b7280' }}>Notes</label><input style={inp} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notes…"/></div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" disabled={uploading} style={{ padding:'9px 22px', borderRadius:10, background:'#6c63ff', border:'none', color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>{uploading?'Uploading…':'Upload'}</button>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'9px 18px', borderRadius:10, border:'1px solid #252a38', background:'transparent', color:'#6b7280', cursor:'pointer', fontSize:'0.88rem' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {resumes.length===0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#4b5563' }}><FileText size={40} style={{ margin:'0 auto 12px' }}/><p>No resumes uploaded yet.</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {resumes.map(r=>(
            <div key={r._id} style={{ background:'#13161f', border:`1px solid ${r.isDefault?'#6c63ff44':'#252a38'}`, borderRadius:14, padding:18 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(108,99,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><FileText size={22} color="#6c63ff"/></div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontWeight:600, color:'#e8eaf0', fontSize:'0.9rem' }}>{r.name}</div>
                  <div style={{ color:'#6b7280', fontSize:'0.78rem', marginTop:2 }}>{r.version} · {fmt(r.fileSize)}</div>
                </div>
                {r.isDefault && <span style={{ padding:'3px 10px', background:'rgba(108,99,255,0.15)', color:'#6c63ff', borderRadius:99, fontSize:'0.72rem', fontWeight:600 }}>Default</span>}
              </div>
              {r.tags?.length>0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:8 }}>{r.tags.map(t=><span key={t} style={{ padding:'2px 8px', background:'#1a1e2a', border:'1px solid #252a38', borderRadius:99, fontSize:'0.72rem', color:'#6b7280' }}>{t}</span>)}</div>}
              {r.notes && <p style={{ color:'#6b7280', fontSize:'0.8rem', marginBottom:8 }}>{r.notes}</p>}
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ color:'#4b5563', fontSize:'0.75rem' }}>{format(new Date(r.createdAt),'dd MMM yyyy')}</span>
                <span style={{ color:'#4b5563', fontSize:'0.75rem' }}>Used {r.timesUsed}x</span>
              </div>
              <div style={{ display:'flex', gap:8, borderTop:'1px solid #1a1e2a', paddingTop:10 }}>
                {!r.isDefault && <button onClick={()=>setDef(r._id)} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:7, border:'1px solid #252a38', background:'transparent', color:'#6b7280', cursor:'pointer', fontSize:'0.78rem' }}><Star size={13}/>Set Default</button>}
                <button onClick={()=>del(r._id)} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:7, border:'1px solid #252a38', background:'transparent', color:'#ff6584', cursor:'pointer', fontSize:'0.78rem' }}><Trash2 size={13}/>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}