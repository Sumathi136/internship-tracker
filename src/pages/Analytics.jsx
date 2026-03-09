import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const C = ['#6c63ff','#22d3a5','#f59e0b','#ff6584','#3b82f6','#a78bfa','#34d399'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { statsAPI.overview().then(r=>{ setStats(r.data); setLoading(false); }); }, []);

  if (loading) return <div style={{ color:'#6b7280', padding:40 }}>Loading…</div>;
  const { overview, charts } = stats;
  const cc = { background:'#13161f', border:'1px solid #252a38', borderRadius:14, padding:'20px 24px', marginBottom:16 };
  const ct = { fontFamily:'Syne', fontWeight:700, color:'#e8eaf0', marginBottom:16, fontSize:'1rem' };
  const tt = { contentStyle:{ background:'#1a1e2a', border:'1px solid #252a38', borderRadius:8, color:'#e8eaf0' } };

  return (
    <div>
      <h1 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.6rem', color:'#e8eaf0', marginBottom:4 }}>Analytics</h1>
      <p style={{ color:'#6b7280', fontSize:'0.88rem', marginBottom:24 }}>Deep insights into your internship hunt</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14, marginBottom:20 }}>
        {[['Total',overview.total,'#6c63ff'],['Interviews',overview.interviews,'#f59e0b'],['Offers',overview.offers,'#22d3a5'],['This Week',overview.recentActivity,'#a78bfa'],['Rejected',overview.rejected,'#ff6584'],['Offer Rate',`${overview.offerRate}%`,'#22d3a5']].map(([l,v,c])=>(
          <div key={l} style={{ ...cc, marginBottom:0, borderTop:`3px solid ${c}` }}>
            <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:'1.8rem', color:c, marginBottom:4 }}>{v}</div>
            <div style={{ color:'#6b7280', fontSize:'0.8rem' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={cc}>
        <div style={ct}>Application Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={charts.monthlyData}>
            <XAxis dataKey="name" tick={{ fill:'#6b7280', fontSize:12 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'#6b7280', fontSize:12 }} axisLine={false} tickLine={false}/>
            <Tooltip {...tt}/>
            <Line type="monotone" dataKey="applications" stroke="#6c63ff" strokeWidth={2.5} dot={{ fill:'#6c63ff', r:4 }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16, marginBottom:16 }}>
        <div style={cc}>
          <div style={ct}>Status Distribution</div>
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <PieChart width={180} height={180}>
              <Pie data={charts.statusCounts} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {charts.statusCounts.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}
              </Pie>
            </PieChart>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {charts.statusCounts.map((s,i)=>(
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:C[i%C.length], flexShrink:0 }}/>
                  <span style={{ color:'#9ca3af', fontSize:'0.82rem', flex:1 }}>{s.name}</span>
                  <span style={{ color:'#e8eaf0', fontSize:'0.82rem', fontWeight:600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={cc}>
          <div style={ct}>By Domain</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.domainCounts} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fill:'#9ca3af', fontSize:11 }} axisLine={false} tickLine={false} width={90}/>
              <Tooltip {...tt}/>
              <Bar dataKey="value" radius={[0,6,6,0]}>{charts.domainCounts.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
        <div style={cc}>
          <div style={ct}>Priority Breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={charts.priorityCounts} barSize={28}>
              <XAxis dataKey="name" tick={{ fill:'#9ca3af', fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#6b7280', fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip {...tt}/>
              <Bar dataKey="value" radius={[6,6,0,0]}>{charts.priorityCounts.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={cc}>
          <div style={ct}>Conversion Funnel</div>
          {[['Applied', overview.applied+overview.interviews+overview.offers, '#6c63ff'],['Got Interview', overview.interviews+overview.offers, '#f59e0b'],['Got Offer', overview.offers, '#22d3a5']].map(([l,v,c])=>{
            const pct = overview.total>0 ? Math.round((v/overview.total)*100) : 0;
            return (
              <div key={l} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ color:'#9ca3af', fontSize:'0.82rem' }}>{l}</span>
                  <span style={{ color:c, fontSize:'0.82rem', fontWeight:600 }}>{v} ({pct}%)</span>
                </div>
                <div style={{ background:'#1a1e2a', borderRadius:99, height:6 }}>
                  <div style={{ width:`${pct}%`, background:c, height:'100%', borderRadius:99 }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
