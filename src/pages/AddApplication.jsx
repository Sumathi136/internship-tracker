
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { appAPI, resumeAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUSES  = ['Wishlist','Applied','OA','Interview','Offer','Rejected','Withdrawn','Ghosted'];
const PRIORITIES= ['Low','Medium','High','Dream'];
const DOMAINS   = ['Software','Data Science','Design','Product','Marketing','Finance','Research','Other'];
const WORK      = ['On-site','Remote','Hybrid'];
const EMPTY = { company:'',role:'',location:'',workType:'On-site',domain:'Software',status:'Applied',priority:'Medium',
  dateApplied:today(),deadline:'',startDate:'',endDate:'',stipend:'',isPaid:true,
  recruiterName:'',recruiterEmail:'',recruiterLinkedIn:'',referredBy:'',
  jobLink:'',companyWebsite:'',applicationPortal:'',notes:'',tags:'',resumeUsed:'' };

function today(){ return new Date().toISOString().split('T')[0]; }

export default function AddApplication() {
  const { id } = useParams();
  const location = useLocation();
  const isEdit = !!id && !location.pathname.endsWith('/new');
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [resumes, setResumes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    resumeAPI.getAll().then(r => setResumes(r.data.resumes));
    if (isEdit) {
      appAPI.getOne(id).then(r => {
        const a = r.data.application;
        setForm({ ...EMPTY, ...a,
          dateApplied: a.dateApplied ? a.dateApplied.split('T')[0] : '',
          deadline:    a.deadline    ? a.deadline.split('T')[0]    : '',
          startDate:   a.startDate   ? a.startDate.split('T')[0]   : '',
          endDate:     a.endDate     ? a.endDate.split('T')[0]     : '',
          tags:        (a.tags||[]).join(', '),
          resumeUsed:  a.resumeUsed?._id || ''
        });
      });
    }
  }, [id, isEdit]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async e => {
    e.preventDefault();
    if (!form.company||!form.role) return toast.error('Company and role required');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] };
      if (isEdit) { await appAPI.update(id, payload); toast.success('Updated!'); }
      else        { await appAPI.create(payload);     toast.success('Added!'); }
      navigate('/applications');
    } catch(err) { toast.error(err.response?.data?.error||'Failed'); }
    finally { setSaving(false); }
  };

  const inp  = { background:'#1a1e2a', border:'1px solid #252a38', borderRadius:10, padding:'10px 14px', color:'#e8eaf0', fontSize:'0.88rem', outline:'none', fontFamily:'DM Sans', width:'100%' };
  const lbl  = { fontSize:'0.78rem', color:'#6b7280', fontWeight:500 };
  const row  = { display:'flex', gap:16, marginBottom:14, flexWrap:'wrap' };
  const fld  = { flex:1, minWidth:200, display:'flex', flexDirection:'column', gap:6 };
  const sec  = { background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px 24px', marginBottom:16 };
  const sh   = { fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', marginBottom:16, fontSize:'0.95rem' };

  return (
    <div style={{ maxWidth:800, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e8eaf0' }}>{isEdit?'Edit Application':'New Application'}</h1>
        <button onClick={()=>navigate(-1)} style={{ padding:'8px 18px', borderRadius:10, border:'1px solid #252a38', background:'transparent', color:'#6b7280', cursor:'pointer' }}>Cancel</button>
      </div>
      <form onSubmit={submit}>
        <div style={sec}><div style={sh}>Basic Info</div>
          <div style={row}><div style={fld}><label style={lbl}>Company *</label><input style={inp} value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Google" required/></div><div style={fld}><label style={lbl}>Role *</label><input style={inp} value={form.role} onChange={e=>set('role',e.target.value)} placeholder="SWE Intern" required/></div></div>
          <div style={row}><div style={fld}><label style={lbl}>Location</label><input style={inp} value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Bangalore / Remote"/></div><div style={fld}><label style={lbl}>Work Type</label><select style={inp} value={form.workType} onChange={e=>set('workType',e.target.value)}>{WORK.map(w=><option key={w}>{w}</option>)}</select></div></div>
          <div style={row}><div style={fld}><label style={lbl}>Domain</label><select style={inp} value={form.domain} onChange={e=>set('domain',e.target.value)}>{DOMAINS.map(d=><option key={d}>{d}</option>)}</select></div><div style={fld}><label style={lbl}>Resume Used</label><select style={inp} value={form.resumeUsed} onChange={e=>set('resumeUsed',e.target.value)}><option value="">None</option>{resumes.map(r=><option key={r._id} value={r._id}>{r.name}</option>)}</select></div></div>
        </div>
        <div style={sec}><div style={sh}>Status & Priority</div>
          <div style={row}><div style={fld}><label style={lbl}>Status</label><select style={inp} value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div><div style={fld}><label style={lbl}>Priority</label><select style={inp} value={form.priority} onChange={e=>set('priority',e.target.value)}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div></div>
          <div style={row}><div style={fld}><label style={lbl}>Date Applied</label><input type="date" style={inp} value={form.dateApplied} onChange={e=>set('dateApplied',e.target.value)}/></div><div style={fld}><label style={lbl}>Deadline</label><input type="date" style={inp} value={form.deadline} onChange={e=>set('deadline',e.target.value)}/></div></div>
          <div style={row}><div style={fld}><label style={lbl}>Start Date</label><input type="date" style={inp} value={form.startDate} onChange={e=>set('startDate',e.target.value)}/></div><div style={fld}><label style={lbl}>End Date</label><input type="date" style={inp} value={form.endDate} onChange={e=>set('endDate',e.target.value)}/></div></div>
        </div>
        <div style={sec}><div style={sh}>Compensation</div>
          <div style={row}><div style={fld}><label style={lbl}>Stipend</label><input style={inp} value={form.stipend} onChange={e=>set('stipend',e.target.value)} placeholder="₹30,000/month"/></div><div style={fld}><label style={lbl}>Paid?</label><div style={{ display:'flex', gap:16, padding:'10px 0' }}>{[true,false].map(v=><label key={String(v)} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', color:'#9ca3af', fontSize:'0.88rem' }}><input type="radio" checked={form.isPaid===v} onChange={()=>set('isPaid',v)}/>{v?'Yes':'No'}</label>)}</div></div></div>
        </div>
        <div style={sec}><div style={sh}>Recruiter Contact</div>
          <div style={row}><div style={fld}><label style={lbl}>Recruiter Name</label><input style={inp} value={form.recruiterName} onChange={e=>set('recruiterName',e.target.value)} placeholder="Jane Smith"/></div><div style={fld}><label style={lbl}>Recruiter Email</label><input style={inp} value={form.recruiterEmail} onChange={e=>set('recruiterEmail',e.target.value)} placeholder="recruiter@co.com"/></div></div>
          <div style={row}><div style={fld}><label style={lbl}>Recruiter LinkedIn</label><input style={inp} value={form.recruiterLinkedIn} onChange={e=>set('recruiterLinkedIn',e.target.value)}/></div><div style={fld}><label style={lbl}>Referred By</label><input style={inp} value={form.referredBy} onChange={e=>set('referredBy',e.target.value)} placeholder="Alumni / Friend"/></div></div>
        </div>
        <div style={sec}><div style={sh}>Links & Tags</div>
          <div style={row}><div style={fld}><label style={lbl}>Job Link</label><input type="url" style={inp} value={form.jobLink} onChange={e=>set('jobLink',e.target.value)} placeholder="https://…"/></div><div style={fld}><label style={lbl}>Company Website</label><input type="url" style={inp} value={form.companyWebsite} onChange={e=>set('companyWebsite',e.target.value)} placeholder="https://…"/></div></div>
          <div style={row}><div style={fld}><label style={lbl}>Application Portal</label><input type="url" style={inp} value={form.applicationPortal} onChange={e=>set('applicationPortal',e.target.value)}/></div><div style={fld}><label style={lbl}>Tags (comma separated)</label><input style={inp} value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="MAANG, Python"/></div></div>
        </div>
        <div style={sec}><div style={sh}>Notes</div>
          <textarea style={{ ...inp, minHeight:100, resize:'vertical' }} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Interview rounds, contacts, anything important…"/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:8 }}>
          <button type="button" onClick={()=>navigate(-1)} style={{ padding:'10px 20px', borderRadius:10, border:'1px solid #252a38', background:'transparent', color:'#6b7280', cursor:'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding:'10px 28px', borderRadius:10, background:'#6c63ff', border:'none', color:'#fff', fontFamily:'Syne', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }} disabled={saving}>{saving?'Saving…':isEdit?'Save Changes':'Add Application'}</button>
        </div>
      </form>
    </div>
  );
}