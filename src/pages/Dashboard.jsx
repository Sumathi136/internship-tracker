import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI, appAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Briefcase, TrendingUp, Award, AlertCircle, Plus } from 'lucide-react';

const COLORS = { Applied:'#6c63ff', Interview:'#f59e0b', Offer:'#22d3a5', Rejected:'#ff6584', Wishlist:'#6b7280', OA:'#3b82f6', Withdrawn:'#9ca3af', Ghosted:'#4b5563' };
const PIE_C  = ['#6c63ff','#22d3a5','#f59e0b','#ff6584','#3b82f6','#a78bfa'];

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div style={{ background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px', display:'flex', alignItems:'center', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon size={20} color={color}/></div>
      <div><div style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e8eaf0' }}>{value}</div><div style={{ color:'#6b7280', fontSize:'0.82rem', marginTop:2 }}>{label}</div></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.overview(), appAPI.upcoming(7)])
      .then(([s, d]) => { setStats(s.data); setDeadlines(d.data.applications); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:'#6b7280', padding:40, textAlign:'center' }}>Loading…</div>;

  const { overview, charts } = stats || {};
  const goalPct = Math.min(100, Math.round((overview?.total / (user?.applicationGoal || 50)) * 100));
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.7rem', color:'#e8eaf0' }}>Good {greet}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color:'#6b7280', marginTop:4, fontSize:'0.9rem' }}>Here's your internship hunt overview</p>
        </div>
        <Link to="/applications/new" style={{ padding:'9px 18px', borderRadius:10, background:'#6c63ff', color:'#fff', textDecoration:'none', fontFamily:'Syne', fontWeight:700, fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}><Plus size={16}/>New Application</Link>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:20 }}>
        <StatCard label="Total Applied"  value={overview?.total||0}              icon={Briefcase}   color="#6c63ff" bg="rgba(108,99,255,0.1)"/>
        <StatCard label="Interviews"     value={overview?.interviews||0}         icon={TrendingUp}  color="#f59e0b" bg="rgba(245,158,11,0.1)"/>
        <StatCard label="Offers"         value={overview?.offers||0}             icon={Award}       color="#22d3a5" bg="rgba(34,211,165,0.1)"/>
        <StatCard label="Offer Rate"     value={`${overview?.offerRate||0}%`}    icon={TrendingUp}  color="#a78bfa" bg="rgba(167,139,250,0.1)"/>
      </div>

      <div style={{ background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px 24px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontFamily:'Syne', fontWeight:700, color:'#e8eaf0' }}>Application Goal</span>
          <span style={{ color:'#6c63ff', fontWeight:600 }}>{overview?.total} / {user?.applicationGoal||50}</span>
        </div>
        <div style={{ background:'#1a1e2a', borderRadius:99, height:8, overflow:'hidden' }}>
          <div style={{ width:`${goalPct}%`, background:'linear-gradient(90deg,#6c63ff,#22d3a5)', height:'100%', borderRadius:99 }}/>
        </div>
        <p style={{ color:'#6b7280', fontSize:'0.8rem', marginTop:8 }}>{goalPct}% of your goal reached</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16, marginBottom:20 }}>
        <div style={{ background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px 24px' }}>
          <h3 style={{ fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', marginBottom:16, fontSize:'1rem' }}>Monthly Applications</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.monthlyData||[]} barSize={20}>
              <XAxis dataKey="name" tick={{ fill:'#6b7280', fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#6b7280', fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'#1a1e2a', border:'1px solid #252a38', borderRadius:8, color:'#e8eaf0' }}/>
              <Bar dataKey="applications" fill="#6c63ff" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px 24px' }}>
          <h3 style={{ fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', marginBottom:16, fontSize:'1rem' }}>Status Breakdown</h3>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <PieChart width={140} height={140}>
              <Pie data={charts?.statusCounts||[]} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {(charts?.statusCounts||[]).map((e,i)=><Cell key={i} fill={COLORS[e.name]||PIE_C[i%PIE_C.length]}/>)}
              </Pie>
            </PieChart>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {(charts?.statusCounts||[]).map((s,i)=>(
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:COLORS[s.name]||PIE_C[i%PIE_C.length], flexShrink:0 }}/>
                  <span style={{ color:'#9ca3af', fontSize:'0.8rem', flex:1 }}>{s.name}</span>
                  <span style={{ color:'#e8eaf0', fontSize:'0.8rem', fontWeight:600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {deadlines.length > 0 && (
        <div style={{ background:'#13161f', border:'1px solid #f59e0b33', borderRadius:14, padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <AlertCircle size={16} color="#f59e0b"/>
            <h3 style={{ fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', fontSize:'1rem' }}>Upcoming Deadlines (7 days)</h3>
          </div>
          {deadlines.map(d => {
            const days = Math.ceil((new Date(d.deadline)-new Date())/86400000);
            return (
              <Link key={d._id} to={`/applications/${d._id}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#1a1e2a', borderRadius:10, textDecoration:'none', marginBottom:8 }}>
                <div>
                  <div style={{ color:'#e8eaf0', fontWeight:600, fontSize:'0.9rem' }}>{d.company}</div>
                  <div style={{ color:'#6b7280', fontSize:'0.8rem', marginTop:2 }}>{d.role}</div>
                </div>
                <div style={{ fontFamily:'Syne', fontWeight:700, fontSize:'0.85rem', color: days<=2?'#ff6584':'#f59e0b' }}>{days}d left</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}