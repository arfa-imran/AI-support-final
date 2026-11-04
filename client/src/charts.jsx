import s from './dash.module.css'
const COL=['var(--chart-1)','var(--chart-2)','var(--chart-3)','var(--chart-4)']
export function AreaChart({data,labels,h=190}){
  const w=600,pad=24,max=Math.max(...data)*1.15,x=i=>pad+i*((w-pad*2)/(data.length-1)),y=v=>h-28-(v/max)*(h-48)
  const line=data.map((v,i)=>(i?'L':'M')+x(i)+' '+y(v)).join(' ')
  return <svg viewBox={`0 0 ${w} ${h}`} className={s.chart} role="img" aria-label={'Requests per day: '+data.map((v,i)=>labels[i]+' '+v).join(', ')}>
    <defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--chart-3)" stopOpacity=".45"/><stop offset="1" stopColor="var(--chart-3)" stopOpacity="0"/></linearGradient></defs>
    {[0,1,2].map(i=><line key={i} x1={pad} x2={w-pad} y1={y(max*i/3)} y2={y(max*i/3)} stroke="var(--border)"/>)}
    <path d={line+` L${x(data.length-1)} ${h-28} L${x(0)} ${h-28}Z`} fill="url(#ag)"/>
    <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    {data.map((v,i)=><g key={i}><circle cx={x(i)} cy={y(v)} r="4" fill="var(--surface)" stroke="var(--chart-1)" strokeWidth="2"/><text x={x(i)} y={h-8} textAnchor="middle" fontSize="12" fill="var(--text-2)">{labels[i]}</text></g>)}
  </svg>
}
export function Donut({parts}){
  const total=parts.reduce((a,p)=>a+p.value,0),R=52,C=2*Math.PI*R;let off=0
  return <div className={s.donutWrap}><svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={parts.map(p=>p.label+' '+p.value).join(', ')}>
    <circle cx="70" cy="70" r={R} fill="none" stroke="var(--subtle)" strokeWidth="16"/>
    {total>0&&parts.map((p,i)=>{const len=p.value/total*C,el=<circle key={p.label} cx="70" cy="70" r={R} fill="none" stroke={COL[i%4]} strokeWidth="16" strokeDasharray={`${len} ${C-len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)"/>;off+=len;return el})}
    <text x="70" y="68" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--text)">{total}</text><text x="70" y="86" textAnchor="middle" fontSize="11" fill="var(--text-2)">total</text></svg>
    <ul className={s.legend}>{parts.map((p,i)=><li key={p.label}><span className={s.dot} style={{background:COL[i%4]}}/>{p.label}: <strong>{p.value}</strong></li>)}</ul></div>
}
export function Bars({items}){
  const max=Math.max(1,...items.map(i=>i.value))
  return <div className={s.bars}>{items.map(i=><div className={s.bar} key={i.label}><span>{i.label}</span><div className={s.track}><div className={s.fill} style={{width:i.value/max*100+'%'}}/></div><strong>{i.value}</strong></div>)}</div>
}
