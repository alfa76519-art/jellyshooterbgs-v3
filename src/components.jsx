import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   1. THEME ENGINE
═══════════════════════════════════════════════════════════════ */
export function applyThemeToDOM(mode) {
  document.documentElement.classList.remove('theme-jelly', 'theme-light', 'theme-cyber')
  if (mode !== 'theme-jelly') { document.documentElement.classList.add(mode) }
  try { localStorage.setItem('userTheme', mode) } catch (e) {}
}
export function handleThemeChange(mode, setTheme) {
  const valid = ['theme-jelly', 'theme-light', 'theme-cyber']
  if (!valid.includes(mode)) return
  applyThemeToDOM(mode)
  if (typeof setTheme === 'function') setTheme(mode)
}
export function switchTheme(mode, setTheme) { handleThemeChange(mode, setTheme) }
export function getSavedTheme() {
  try { return localStorage.getItem('userTheme') || 'theme-jelly' } catch (e) { return 'theme-jelly' }
}
export function computeActiveBoost(ownedNFTs) {
  const safeOwned = Array.isArray(ownedNFTs) ? ownedNFTs : []
  if (safeOwned.length === 0) return null
  const merged = { sugarRate: 0, pressureRate: 0, scoreMulti: 0, shakeBonus: 0 }
  const order = ['Legendary', 'Epic', 'Rare', 'Uncommon']
  const top = order.find(r => safeOwned.some(n => n.rarity === r)) || 'Uncommon'
  const base = NFT_BOOSTS[top] || NFT_BOOSTS['Uncommon']
  safeOwned.forEach(n => {
    const b = NFT_BOOSTS[n.rarity] || NFT_BOOSTS['Uncommon']
    const isTop = n.rarity === top
    merged.sugarRate    += b.sugarRate    * (isTop ? 1 : 0.1)
    merged.pressureRate += b.pressureRate * (isTop ? 1 : 0.1)
    merged.scoreMulti   += b.scoreMulti   * (isTop ? 1 : 0.1)
    merged.shakeBonus   += b.shakeBonus   * (isTop ? 1 : 0.1)
  })
  return { ...merged, label: base.label, color: base.color, icon: base.icon, count: safeOwned.length, top }
}

/* ═══════════════════════════════════════════════════════════════
   INI DATA <--- JANGAN UBAH, ENTE UBAH ANE PUKUL!
═══════════════════════════════════════════════════════════════ */
export const INITIAL_RAFFLES = [
  { id:1, emoji:'🪼', name:'Jellyfish Genesis', prize:'5,000 $BGS',       price:50,  sold:73, max:100, ends:'2h 14m',  hot:true  },
  { id:2, emoji:'🍑', name:'Peach Bomb',        prize:'2,500 $BGS + NFT', price:25,  sold:41, max:80,  ends:'5h 50m',  hot:false },
  { id:3, emoji:'🫧', name:'Bubble Surge',      prize:'10,000 $BGS',      price:100, sold:18, max:50,  ends:'23h 00m', hot:true  },
]
export const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', trait:'Gold Helmet',  rc:'#f59e0b', glow:'glow-legendary', owned:true,  equipped:false },
  { id:2, name:'Motocat #0117', rarity:'Epic',      emoji:'😺', trait:'Neon Wings',   rc:'#8b5cf6', glow:'glow-epic',      owned:true,  equipped:false },
  { id:3, name:'Motocat #0289', rarity:'Rare',      emoji:'🐈', trait:'Cyber Visor',  rc:'#0ea5e9', glow:'glow-rare',      owned:false, equipped:false },
  { id:4, name:'Motocat #0401', rarity:'Uncommon',  emoji:'🙀', trait:'Pink Bandana', rc:'#ec4899', glow:'',               owned:false, equipped:false },
]
export const TABS        = [{ id:'dashboard', label:'Dashboard', icon:'🏠' }, { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' }, { id:'inventory', label:'Inventory', icon:'🎁' }]
export const THEME_OPTS  = [{ id:'theme-jelly', icon:'🍬', label:'Jelly', desc:'Pastel Candy' }, { id:'theme-light', icon:'☀️', label:'Light', desc:'Minimalist' }, { id:'theme-cyber', icon:'🤖', label:'Cyber', desc:'Neon Hacker' }]

/* ═══════════════════════════════════════════════════════════════
   NFT BOOST LOGIC
═══════════════════════════════════════════════════════════════ */
export const NFT_BOOSTS = {
  Legendary: { sugarRate: 2.5, pressureRate: 1.8, scoreMulti: 2.0, shakeBonus: 20, label: 'LEGENDARY BOOST', color: '#f59e0b', icon: '👑', perks: ['2.5× Sugar Rate', '2.0× Score', '+20 Shake Bonus'] },
  Epic:      { sugarRate: 1.8, pressureRate: 1.4, scoreMulti: 1.5, shakeBonus: 16, label: 'EPIC BOOST',      color: '#8b5cf6', icon: '💜', perks: ['1.8× Sugar Rate', '1.5× Score', '+16 Shake Bonus'] },
  Rare:      { sugarRate: 1.4, pressureRate: 1.2, scoreMulti: 1.25,shakeBonus: 14, label: 'RARE BOOST',      color: '#0ea5e9', icon: '🔵', perks: ['1.4× Sugar Rate', '1.25× Score', '+14 Shake Bonus'] },
  Uncommon:  { sugarRate: 1.15,pressureRate: 1.05,scoreMulti: 1.1, shakeBonus: 12, label: 'UNCOMMON BOOST',  color: '#ec4899', icon: '🩷', perks: ['1.15× Sugar Rate', '1.1× Score', 'Base Shake'] },
}

/* ═══════════════════════════════════════════════════════════════
   3. VISUAL COMPONENTS & ATOMS
═══════════════════════════════════════════════════════════════ */
export const Glass = ({ children, style = {}, className = '' }) => (<div className={`glass ${className}`} style={style}>{children}</div>)
export const PageBg = () => (
  <div className="page-bg">
    {[1, 2, 3, 4].map(i => <div key={i} className="blob" style={{ background: `var(--blob-${i})`, animationDelay: `${(i-1)*-4}s` }} />)}
  </div>
)
export const Toaster = ({ toasts = [] }) => (
  <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
    {toasts.map(t => (
      <div key={t.id} className="glass tin" style={{ pointerEvents:'auto', padding:'12px 18px', borderRadius:20, background: t.type==='success'?'var(--toast-ok)':'var(--toast-err)', color:'#fff', fontWeight:800 }}>{t.message}</div>
    ))}
  </div>
)
export const JBtn = ({ children, grad, onClick, disabled, size='md', icon, sx={} }) => (
  <button className="jbtn" onClick={onClick} disabled={disabled} style={{ background: grad || 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', borderRadius:999, color:'#fff', fontWeight:900, padding:'10px 22px', border:'none', display:'inline-flex', alignItems:'center', gap:6, ...sx }}>{icon} {children}</button>
)
export const ProgBar = ({ pct, cssVar='--fuel-bar' }) => (
  <div style={{ background:'var(--prog-bg)', borderRadius:999, height:10, overflow:'hidden' }}>
    <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:`var(${cssVar})`, transition:'width 0.2s' }} />
  </div>
)

// SVGs
export const JellyFish = ({ size = 60, className = '' }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 60 84" className={className} style={{ filter: 'drop-shadow(0 4px 14px var(--jelly-glow))' }}>
    <ellipse cx="30" cy="28" rx="26" ry="22" fill="var(--jelly-body)" fillOpacity="0.85" />
    <path d="M10 48 Q10 65 15 75 M22 50 Q22 70 20 80 M38 50 Q38 70 40 80 M50 48 Q50 65 45 75" stroke="var(--jelly-body)" strokeWidth="2.5" fill="none" opacity="0.7" />
  </svg>
)
export const CyberBot = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 0 12px var(--jelly-glow))' }}>
    <rect x="10" y="10" width="40" height="40" rx="4" fill="var(--jelly-body)" fillOpacity="0.2" stroke="var(--jelly-body)" strokeWidth="1.5" />
    <rect x="18" y="22" width="10" height="4" fill="var(--jelly-body)" /><rect x="32" y="22" width="10" height="4" fill="var(--jelly-body)" />
  </svg>
)
export const JellyCube = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60"><rect x="10" y="10" width="40" height="40" rx="12" fill="var(--accent-2)" fillOpacity="0.6" /></svg>
)

// THE MISSING COMPONENT!
export const BoostPanel = ({ boost, isCyber }) => {
  if (!boost) return null;
  return (
    <Glass className="boost-active" style={{ padding:'14px 16px', border:`1.5px solid ${boost.color}66`, boxShadow:`0 0 20px ${boost.color}33` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>{boost.icon}</span>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:boost.color }}>{boost.label} ACTIVE</div>
          <div style={{ fontSize:10, color:'var(--text-muted)' }}>×{boost.scoreMulti.toFixed(2)} Score Multiplier</div>
        </div>
      </div>
    </Glass>
  )
}

/* ═══════════════════════════════════════════════════════════════
   [6] DASHBOARD VIEW — raffles, buy ticket, reveal winner, stats
═══════════════════════════════════════════════════════════════ */
export const DashView = ({ theme, connected, balance, tickets, setTickets, setBalance, addToast, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  const [raffles, setRaffles] = useState(INITIAL_RAFFLES.map(r => ({...r})))
  const [buyId, setBuyId] = useState(null)
  const [revId, setRevId] = useState(null)

  const buy = async r => {
    if (!connected)        { addToast('Connect wallet first!', 'error'); return }
    if (balance < r.price) { addToast('Not enough $BGS!', 'error'); return }
    setBuyId(r.id)
    addToast(isCyber ? '> SIGNING tx...' : 'Signing on OPWallet…', 'pending')
    await new Promise(x => setTimeout(x, 900))
    addToast(isCyber ? '> BROADCASTING...' : 'Broadcasting to OP_NET…', 'pending')
    await new Promise(x => setTimeout(x, 1100))
    setBalance(b => b - r.price)
    setTickets(t => ({ ...t, [r.id]: (t[r.id]||0)+1 }))
    setRaffles(rs => rs.map(x => x.id===r.id ? {...x, sold:Math.min(x.sold+1,x.max)} : x))
    addToast('🎟️ Ticket confirmed!', 'success')
    setBuyId(null)
  }

  const reveal = async id => {
    if (!connected) { addToast('Connect wallet first!', 'error'); return }
    setRevId(id)
    addToast(isCyber ? '> REQUESTING VRF...' : 'Requesting VRF entropy…', 'pending')
    await new Promise(x => setTimeout(x, 2200))
    const w = ['bc1p...a3f9','bc1p...7dk2','bc1p...z0q8'][Math.floor(Math.random()*3)]
    addToast(`🏆 Winner: ${w}`, 'success')
    setRevId(null)
  }

  const totalTickets = Object.values(tickets).reduce((a,b) => a+b, 0)
  const stats = [
    { l: isCyber?'PRIZE_POOL':'Prize Pool',      v:'17,500 $BGS', e:'💎' },
    { l: isCyber?'ACTIVE_LIVE':'Active Raffles',  v:'3 Live',      e:'🔴' },
    { l: isCyber?'MY_TICKETS':'My Tickets',       v: totalTickets, e:'🎟️' },
    { l: isCyber?'PLAYERS':'Players Online',      v:'214',          e:'🪼' },
  ]

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Hero */}
      <Glass className="fup" style={{ padding:'26px 30px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-10, top:-10, opacity:0.8 }}>
          {isCyber ? <CyberBot size={88} style={{ animation:'floatIdle 3.5s ease-in-out infinite' }}/> : <JellyFish size={88} className="float-idle"/>}
        </div>
        <div style={{ position:'absolute', right:100, bottom:-8, opacity:0.6 }}>
          <JellyCube size={50} style={{ animation:'floatIdle 4s ease-in-out infinite', animationDelay:'1s' }}/>
        </div>
        <div style={{ maxWidth:480 }}>
          <p style={{ fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--accent-1)', marginBottom:8, fontFamily:'var(--font-mono)' }}>
            {isCyber ? '> OP_NET.PROTOCOL · $BGS.TOKEN' : '🍬 OP_NET · Powered by $BGS Token'}
          </p>
          <h1 style={{ fontFamily:'var(--font-hud)', fontSize:'clamp(1.4rem,3.5vw,2rem)', lineHeight:1.2, color:'var(--text-primary)', marginBottom:10 }}>
            {isCyber ? 'WIN.SYS: Jelly_Raffle.exe' : 'Win Sweet Prizes with Jelly Shot Raffle 🪼'}
          </h1>
          {activeBoost && (
            <div style={{ marginBottom:12, display:'inline-flex', alignItems:'center', gap:8, background:`${activeBoost.color}18`, border:`1.5px solid ${activeBoost.color}44`, borderRadius:12, padding:'6px 14px' }}>
              <span>{activeBoost.icon}</span>
              <span style={{ fontSize:11, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>
                {activeBoost.label} — Score ×{activeBoost.scoreMulti.toFixed(2)}
              </span>
            </div>
          )}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <JBtn icon="🎰" onClick={() => addToast('Scroll down to join! 🎟️','success')}>
              {isCyber ? 'JOIN_RAFFLE.EXE' : 'Join Now'}
            </JBtn>
          </div>
        </div>
      </Glass>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
        {stats.map((s,i) => (
          <Glass key={i} className="fup" style={{ padding:'16px 18px', animationDelay:`${i*0.07}s` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
              <span style={{ fontSize:17 }}>{s.e}</span>
              <span style={{ fontSize:9.5, fontWeight:900, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{s.l}</span>
            </div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:'var(--font-hud)', color:'var(--accent-1)' }}>{s.v}</div>
          </Glass>
        ))}
      </div>

      {/* Balance */}
      {connected && (
        <Glass className="fup" style={{ padding:'20px 26px', border:'1.5px solid var(--accent-1)', boxShadow:'var(--card-shadow),0 0 24px var(--btn-glow)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'.12em', color:'var(--text-muted)', marginBottom:8, fontFamily:'var(--font-mono)' }}>
                {isCyber ? 'WALLET.BALANCE' : 'Your $BGS Balance'}
              </p>
              <p style={{ fontFamily:'var(--font-hud)', fontSize:36, lineHeight:1, color:'var(--accent-1)' }}>
                {balance.toLocaleString()}
                <span style={{ fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, color:'var(--text-muted)' }}> $BGS</span>
              </p>
            </div>
            {isCyber ? <CyberBot size={60} style={{ animation:'floatIdle 3s ease-in-out infinite' }}/> : <JellyFish size={60} className="float-idle"/>}
          </div>
        </Glass>
      )}

      {/* Raffles */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <h2 style={{ fontFamily:'var(--font-hud)', fontSize:19, color:'var(--text-primary)' }}>
            {isCyber ? 'LIVE_RAFFLES.SYS' : 'Live Raffles'}
          </h2>
          <span style={{ background:'var(--accent-1)', borderRadius:999, padding:'3px 12px', fontSize:10, fontWeight:900, color: isCyber?'#000':'#fff' }}>🔴 LIVE</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {raffles.map((r,idx) => {
            const pct = Math.round((r.sold/r.max)*100)
            const myC = tickets[r.id]||0
            const full = r.sold >= r.max
            return (
              <Glass key={r.id} className="fup" style={{ padding:'20px 22px', position:'relative', overflow:'hidden', animationDelay:`${idx*0.1}s` }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--accent-1),var(--accent-2),var(--accent-3))' }}/>
                {r.hot && <div style={{ position:'absolute', top:14, right:14 }}><Badge label={isCyber?'HOT_ITEM':'🔥 Hot'} color="var(--accent-1)"/></div>}
                <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:14 }}>
                  <div style={{ width:50, height:50, borderRadius:isCyber?6:18, background:'linear-gradient(135deg,var(--accent-1),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{r.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <h3 style={{ fontFamily:'var(--font-hud)', fontSize:15, color:'var(--text-primary)', marginBottom:2 }}>
                        {isCyber ? r.name.toUpperCase().replace(' ','_') : r.name}
                      </h3>
                      <div style={{ background:'linear-gradient(135deg,var(--accent-1),var(--accent-2))', borderRadius:isCyber?4:12, padding:'5px 14px', color:isCyber?'#000':'#fff', fontSize:12, fontWeight:900 }}>{r.prize}</div>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>⏰ {r.ends}</span>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{isCyber?'TICKET.SOLD':'Tickets Sold'}</span>
                    <span style={{ fontSize:11, fontWeight:900, color:'var(--accent-1)', fontFamily:'var(--font-mono)' }}>{r.sold}/{r.max} ({pct}%)</span>
                  </div>
                  <ProgBar pct={pct}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <JBtn onClick={() => buy(r)} disabled={buyId===r.id||full} icon={buyId===r.id?'⏳':full?'🔒':'🎟️'} size="sm">
                      {buyId===r.id?(isCyber?'TX_PENDING':'Buying…'):full?(isCyber?'SOLD_OUT':'Sold Out'):`${r.price} $BGS`}
                    </JBtn>
                    <JBtn grad="linear-gradient(135deg,var(--accent-2),var(--accent-3))" onClick={() => reveal(r.id)} disabled={revId===r.id} icon={revId===r.id?'⏳':'🏆'} size="sm">
                      {revId===r.id?(isCyber?'DRAWING':'Drawing…'):(isCyber?'REVEAL.WIN':'Reveal Winner')}
                    </JBtn>
                  </div>
                  {myC>0 && <span style={{ fontSize:12, fontWeight:900, color:'var(--accent-1)', fontFamily:'var(--font-mono)', background:'rgba(255,255,255,0.08)', borderRadius:99, padding:'4px 12px', border:'1px solid var(--game-border)' }}>🎟️ YOU: {myC}</span>}
                </div>
              </Glass>
            )
          })}
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   JELLY SHOOTER VIEW — Full Game Engine
═══════════════════════════════════════════════════════════════ */
export const JellyShooterView = ({ theme, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  const sugarRate    = activeBoost ? Math.min(activeBoost.sugarRate,    4) : 1
  const pressureRate = activeBoost ? Math.min(activeBoost.pressureRate, 3) : 1
  const scoreMulti   = activeBoost ? activeBoost.scoreMulti               : 1
  const shakeBonus   = activeBoost ? activeBoost.shakeBonus               : 12

  const [phase,     setPhase]     = useState('idle')
  const [sugar,     setSugar]     = useState(0)
  const [pressure,  setPressure]  = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [score,     setScore]     = useState(0)
  const [bestScore, setBest]      = useState(0)
  const [particles, setParticles] = useState([])
  const [shakeFlash,setShakeFlash]= useState(false)
  const [jellyPos,  setJellyPos]  = useState(0)
  const [thrusterOn,setThruster]  = useState(false)

  const chargeRef = useRef(null)
  const countRef  = useRef(null)
  const flyRef    = useRef(null)
  const sugarRef  = useRef(0)
  const pressRef  = useRef(0)
  const phaseRef  = useRef('idle')
  const lastShake = useRef(0)

  useEffect(() => { sugarRef.current = sugar },   [sugar])
  useEffect(() => { pressRef.current = pressure }, [pressure])
  useEffect(() => { phaseRef.current = phase },    [phase])

  // Shake sensor
  useEffect(() => {
    const handler = e => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const f = Math.sqrt((acc.x||0)**2+(acc.y||0)**2+(acc.z||0)**2)
      const now = Date.now()
      if (f > 22 && now - lastShake.current > 800) {
        lastShake.current = now
        setSugar(s => Math.min(s + shakeBonus, 100))
        setShakeFlash(true)
        setTimeout(() => setShakeFlash(false), 700)
      }
    }
    window.addEventListener('devicemotion', handler, true)
    return () => window.removeEventListener('devicemotion', handler, true)
  }, [shakeBonus])

  const spawnParticle = useCallback(() => {
    const id = Date.now() + Math.random()
    const angle = (Math.random()-0.5)*65
    const dist  = 32 + Math.random()*52
    setParticles(p => [...p, { id, px: Math.sin(angle*Math.PI/180)*dist, py: 42+Math.random()*32 }].slice(-20))
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 600)
  }, [])

  const launchNow = useCallback(() => {
    const power = sugarRef.current
    const press = pressRef.current
    const final = Math.round((power*10 + press*5) * scoreMulti)
    setPhase('flying')
    let pos = 0
    const target = power * 2.8
    flyRef.current = setInterval(() => {
      pos += (target-pos)*0.08 + 1.5
      setJellyPos(pos)
      if (pos >= target-5) {
        clearInterval(flyRef.current)
        setScore(final)
        setBest(b => Math.max(b, final))
        setPhase('landed')
        for (let i=0; i<14; i++) spawnParticle()
        setTimeout(() => { setJellyPos(0); setSugar(0); setPressure(0) }, 2200)
        setTimeout(() => setPhase('idle'), 2800)
      }
    }, 16)
  }, [scoreMulti, spawnParticle])

  const stopCharge = useCallback(() => {
    clearInterval(chargeRef.current)
    setThruster(false)
    if (sugarRef.current < 10) { setPhase('idle'); setSugar(0); setPressure(0); return }
    setPhase('countdown')
    let c = 3; setCountdown(c)
    countRef.current = setInterval(() => {
      c--
      if (c <= 0) { clearInterval(countRef.current); launchNow() }
      else setCountdown(c)
    }, 900)
  }, [launchNow])

  const startCharge = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    setPhase('charging'); setThruster(true)
    chargeRef.current = setInterval(() => {
      setSugar(s => { const n = Math.min(s + 1.8*sugarRate, 100); sugarRef.current = n; return n })
      setPressure(p => { const n = Math.min(p + 1.2*pressureRate, 100); pressRef.current = n; return n })
      spawnParticle()
      if (sugarRef.current >= 100) stopCharge()
    }, 50)
  }, [sugarRate, pressureRate, spawnParticle, stopCharge])

  useEffect(() => {
    const kd = e => { if (e.code==='Space') { e.preventDefault(); startCharge() } }
    const ku = e => { if (e.code==='Space') { e.preventDefault(); stopCharge()  } }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup',   ku)
    return () => { window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku) }
  }, [startCharge, stopCharge])

  useEffect(() => () => {
    clearInterval(chargeRef.current); clearInterval(countRef.current); clearInterval(flyRef.current)
  }, [])

  const tierLabel = score>=900?'🏆 LEGENDARY':score>=600?'💜 EPIC':score>=300?'🔵 RARE':'🌱 STARTER'

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* HUD */}
      <Glass className="fup" style={{ padding:'18px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--text-primary)', marginBottom:4 }}>
              {isCyber ? '🤖 CYBER LAUNCHER' : '🪼 Jelly Shooter'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
              {isCyber ? '> Hold [SPACE] or button to charge' : 'Tahan tombol / SPACE → isi gula → lepas → luncur! 🚀'}
            </p>
            {activeBoost && (
              <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:6, background:`${activeBoost.color}18`, border:`1px solid ${activeBoost.color}44`, borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>
                {activeBoost.icon} Score ×{activeBoost.scoreMulti.toFixed(2)} active
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            {shakeFlash && <span style={{ fontFamily:'var(--font-hud)', fontSize:13, color:'var(--accent-4)', fontWeight:900 }}>+SHAKE {shakeBonus}⚡</span>}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>BEST</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--accent-2)' }}>{bestScore}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>SCORE</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:28, color:'var(--accent-1)' }}>{score}</div>
            </div>
          </div>
        </div>
      </Glass>

      {/* Game Grid */}
      <div className="game-grid" style={{ display:'grid', gridTemplateColumns:'1fr 270px', gap:14 }}>
        {/* Arena */}
        <Glass className="fup" style={{ position:'relative', height:430, overflow:'hidden', background:'var(--game-bg)', border:'1.5px solid var(--game-border)' }}>
          {isCyber && (
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--accent-1) 1px,transparent 1px),linear-gradient(90deg,var(--accent-1) 1px,transparent 1px)', backgroundSize:'30px 30px', opacity:0.05, animation:'gridPulse 3s ease-in-out infinite', pointerEvents:'none', zIndex:0 }}/>
          )}
          {particles.map(p => (
            <div key={p.id} style={{ position:'absolute', left:'50%', bottom:80, width:8, height:8, borderRadius:isCyber?'2px':'50%', background:'var(--particle-clr)', '--px':`${p.px}px`, '--py':`${p.py}px`, animation:'particleBurst 0.6s ease-out forwards', zIndex:2 }}/>
          ))}
          <div style={{ position:'absolute', bottom:70, left:0, right:0, height:2, background:'var(--game-border)', opacity:0.4 }}/>
          {activeBoost && (
            <div style={{ position:'absolute', left:'50%', bottom:66, transform:'translateX(-50%)', width:80, height:20, borderRadius:'50%', background:`radial-gradient(ellipse,${activeBoost.color}55,transparent)`, zIndex:3, animation:'boostPulse 1.8s ease-in-out infinite' }}/>
          )}
          {/* Character */}
          <div style={{ position:'absolute', left:'50%', bottom: 80 + ((phase==='flying'||phase==='landed') ? jellyPos : 0), transform:'translateX(-50%)', zIndex:5, animation: phase==='charging'?(isCyber?'cyberJitter 0.15s linear infinite':'jellyWobble 0.3s ease-in-out infinite'):phase==='flying'?'none':'floatIdle 3.5s ease-in-out infinite', transition:'bottom 0.05s linear' }}>
            {isCyber ? <CyberBot size={72}/> : <JellyFish size={72}/>}
          </div>
          {/* Thrusters */}
          {thrusterOn && [...Array(5)].map((_,i) => (
            <div key={i} style={{ position:'absolute', left:`calc(50% + ${(i-2)*12}px)`, bottom:76, width:isCyber?6:8, height:isCyber?6:8, borderRadius:isCyber?'2px':'50%', background:isCyber?`hsl(${120+i*15},100%,60%)`:`hsl(${310+i*15},90%,${70+i*5}%)`, animation:`thrusterBubble ${0.4+i*0.08}s ease-out infinite`, animationDelay:`${i*0.06}s`, zIndex:4 }}/>
          ))}
          {/* Countdown */}
          {phase==='countdown' && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, backdropFilter:'blur(4px)', borderRadius:'var(--card-radius)' }}>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:96, color:'var(--accent-1)', animation:'countdownAnim 0.9s ease-in-out forwards', textShadow:'0 0 40px var(--jelly-glow)' }}>{countdown}</div>
            </div>
          )}
          {/* Landed */}
          {phase==='landed' && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, zIndex:10, backdropFilter:'blur(6px)', borderRadius:'var(--card-radius)' }}>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:40, color:'var(--accent-1)', textShadow:'0 0 30px var(--jelly-glow)' }}>{score} pts!</div>
              {activeBoost && <div style={{ fontSize:13, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>{activeBoost.icon} ×{activeBoost.scoreMulti.toFixed(2)} applied</div>}
              <div style={{ fontFamily:'var(--font-hud)', fontSize:18, color:'var(--text-muted)' }}>{tierLabel}</div>
            </div>
          )}
          {phase==='idle' && <div style={{ position:'absolute', bottom:14, left:0, right:0, textAlign:'center', fontSize:12, fontWeight:800, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{isCyber?'> HOLD_BUTTON or [SPACE]':'💡 Tahan tombol atau SPACE'}</div>}
        </Glass>

        {/* Controls */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Glass style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:'var(--text-muted)' }}>
                {isCyber?'[ POWER.CORE ]':'Kadar Gula ⚡'}
                {sugarRate>1 && <span style={{ color:'var(--accent-4)', marginLeft:4 }}>×{sugarRate.toFixed(1)}</span>}
              </span>
              <span style={{ fontFamily:'var(--font-hud)', fontSize:14, color:'var(--accent-1)', fontWeight:900 }}>{Math.round(sugar)}%</span>
            </div>
            <ProgBar pct={sugar} cssVar="--fuel-bar"/>
            {sugar>=90 && <div style={{ marginTop:6, fontSize:10, fontWeight:900, color:'var(--accent-1)', fontFamily:'var(--font-mono)', textAlign:'center', animation:'jellyWobble 0.5s ease infinite' }}>{isCyber?'[!] OVERFLOW':'⚠️ Gula Penuh!'}</div>}
          </Glass>

          <Glass style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:'var(--text-muted)' }}>
                {isCyber?'[ TEKANAN.SYS ]':'Tekanan Lontar 🎯'}
                {pressureRate>1 && <span style={{ color:'var(--accent-4)', marginLeft:4 }}>×{pressureRate.toFixed(1)}</span>}
              </span>
              <span style={{ fontFamily:'var(--font-hud)', fontSize:14, color:'var(--accent-3)', fontWeight:900 }}>{Math.round(pressure)}%</span>
            </div>
            <ProgBar pct={pressure} cssVar="--pressure-bar"/>
          </Glass>

          <BoostPanel boost={activeBoost} isCyber={isCyber}/>

          {/* Launch Button */}
          <button className="jbtn"
            onMouseDown={startCharge} onMouseUp={stopCharge}
            onTouchStart={e=>{e.preventDefault();startCharge()}} onTouchEnd={e=>{e.preventDefault();stopCharge()}}
            disabled={phase==='countdown'||phase==='flying'||phase==='landed'}
            style={{ background: phase==='charging'?'linear-gradient(135deg,var(--accent-4),var(--accent-3))':'linear-gradient(135deg,var(--accent-1),var(--accent-2))', padding:'18px 14px', borderRadius:18, fontFamily:'var(--font-hud)', fontWeight:900, fontSize:15, color:'#fff', boxShadow:'var(--btn-shadow),0 0 20px var(--btn-glow)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, userSelect:'none', touchAction:'none' }}>
            <span style={{ fontSize:28 }}>{phase==='charging'?'⚡':phase==='countdown'?'🔢':phase==='flying'?'🚀':'🪼'}</span>
            <span>{phase==='charging'?(isCyber?'CHARGING...':'Mengisi…'):phase==='countdown'?(isCyber?'LAUNCHING...':'Menghitung…'):phase==='flying'?(isCyber?'IN_FLIGHT':'Terbang!'):phase==='landed'?(isCyber?'RESET':'Selesai!'):(isCyber?'INIT_LAUNCH':'Tahan → Isi Gula!')}</span>
            <span style={{ fontSize:10, opacity:0.7, fontFamily:'var(--font-mono)' }}>{isCyber?'[HOLD]':'Tahan & Lepas'}</span>
          </button>

          <Glass style={{ padding:'12px 16px', textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
              {isCyber?'> SHAKE device → +ENERGY':'📱 Kocok HP untuk bonus!'}
            </div>
            {shakeFlash && <div style={{ color:'var(--accent-4)', fontWeight:900, marginTop:4 }}>{isCyber?`[SHAKE +${shakeBonus}]`:`🔋 +${shakeBonus} Gula!`}</div>}
          </Glass>

          <Glass style={{ padding:'12px 16px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text-muted)', marginBottom:8 }}>{isCyber?'REWARD_TABLE':'Hadiah'}</div>
            {[{pts:300,r:'1 Raffle Entry',ic:'🎟️'},{pts:600,r:'Free Ticket',ic:'🎫'},{pts:900,r:'NFT Bonus',ic:'🏆'}].map(r => (
              <div key={r.pts} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, opacity:score>=r.pts?1:0.45 }}>
                <span style={{ fontSize:14 }}>{r.ic}</span>
                <span style={{ fontSize:11, fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-mono)' }}>{r.pts}+ → {r.r}</span>
                {score>=r.pts && <span style={{ marginLeft:'auto', fontSize:12, color:'var(--accent-4)' }}>✓</span>}
              </div>
            ))}
          </Glass>
        </div>
      </div>
    </div>
  )
}
/* ═══════════════════════════════════════════════════════════════
   [8] INVENTORY VIEW — NFT list, equip toggle, boost panel, list/transfer demo
═══════════════════════════════════════════════════════════════ */
export const InvView = ({ theme, connected, nfts = [], setNfts, setOwnedNFTs, addToast }) => {
  const isCyber   = theme === 'theme-cyber'
  const safeNfts  = Array.isArray(nfts) ? nfts : []
  const RARITY_ORDER = { Legendary:0, Epic:1, Rare:2, Uncommon:3 }
  const sorted    = [...safeNfts].sort((a,b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity])
  const equipped  = safeNfts.filter(n => n.equipped && n.owned)
  const activeBoost = computeActiveBoost(equipped)

  const toggleEquip = (nft) => {
    if (!nft.owned) return
    const newNfts = safeNfts.map(n => n.id===nft.id ? {...n, equipped:!n.equipped} : n)
    setNfts(newNfts)
    setOwnedNFTs(newNfts.filter(n => n.equipped && n.owned))
    addToast(nft.equipped ? `${nft.name} unequipped` : `${nft.name} equipped! 🚀`, nft.equipped?'error':'success')
  }

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <Glass className="fup" style={{ padding:'20px 26px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--text-primary)', marginBottom:4 }}>
              {isCyber ? 'ASSET_VAULT.SYS' : '🎁 My Motocats'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
              {isCyber ? '> Equip NFTs → activate Shooter boost' : 'Equip NFTs untuk boost Jelly Shooter! 🚀'}
            </p>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>OWNED</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:24, color:'var(--text-primary)' }}>{safeNfts.filter(n=>n.owned).length}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>EQUIPPED</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:24, color:'var(--accent-4)' }}>{equipped.length}</div>
            </div>
          </div>
        </div>
      </Glass>

      {activeBoost && (
        <Glass className="fup" style={{ padding:'16px 22px', border:`1.5px solid ${activeBoost.color}66`, boxShadow:`0 0 24px ${activeBoost.color}33,var(--card-shadow)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:28 }}>{activeBoost.icon}</span>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontWeight:900, fontSize:13, color:activeBoost.color }}>{activeBoost.label} ACTIVE</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{equipped.length} NFT{equipped.length>1?'s':''} equipped</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[{l:'Sugar',v:`×${activeBoost.sugarRate.toFixed(2)}`},{l:'Score',v:`×${activeBoost.scoreMulti.toFixed(2)}`},{l:'Shake',v:`+${Math.round(activeBoost.shakeBonus)}`}].map(s => (
                <div key={s.l} style={{ textAlign:'center', background:`${activeBoost.color}14`, border:`1px solid ${activeBoost.color}33`, borderRadius:10, padding:'6px 12px' }}>
                  <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{s.l}</div>
                  <div style={{ fontFamily:'var(--font-hud)', fontSize:16, color:activeBoost.color }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Glass>
      )}

      {!connected ? (
        <Glass className="fup" style={{ padding:52, textAlign:'center' }}>
          {isCyber ? <CyberBot size={80} style={{ margin:'0 auto 16px', display:'block' }}/> : <JellyFish size={80} className="float-idle" style={{ margin:'0 auto 16px', display:'block' }}/>}
          <h3 style={{ fontFamily:'var(--font-hud)', fontSize:20, color:'var(--text-primary)', marginBottom:8 }}>
            {isCyber ? 'CONNECT_WALLET_REQUIRED' : 'Connect Wallet to View'}
          </h3>
        </Glass>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
          {sorted.map((nft,i) => {
            const boostDef = NFT_BOOSTS[nft.rarity]
            return (
              <div key={nft.id} className={`glass fup ${nft.glow}`} style={{ padding:18, overflow:'hidden', position:'relative', animationDelay:`${i*0.08}s`, border:nft.equipped?`2.5px solid ${nft.rc}`:`1.5px solid ${nft.rc}44`, borderRadius:'var(--card-radius)', opacity:nft.owned?1:0.45, transition:'transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55)', boxShadow:nft.equipped?`0 0 24px ${nft.rc}55,var(--card-shadow)`:undefined }}
                onMouseEnter={e => { if(nft.owned) e.currentTarget.style.transform='translateY(-7px) scale(1.03)' }}
                onMouseLeave={e => e.currentTarget.style.transform='none'}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${nft.rc},${nft.rc}88)`, borderRadius:'24px 24px 0 0' }}/>
                {nft.equipped && (
                  <div style={{ position:'absolute', top:12, right:12, background:`linear-gradient(135deg,${nft.rc},${nft.rc}aa)`, borderRadius:999, padding:'3px 10px', fontSize:9, fontWeight:900, color:'#fff', fontFamily:'var(--font-mono)', textTransform:'uppercase' }}>
                    {isCyber?'EQUIPPED':'⚡ Equipped'}
                  </div>
                )}
                <div style={{ width:'100%', aspectRatio:'1', borderRadius:18, background:`linear-gradient(135deg,${nft.rc}44,${nft.rc}aa)`, border:`1.5px solid ${nft.rc}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, marginBottom:14 }}>{nft.emoji}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <h4 style={{ fontFamily:'var(--font-hud)', fontSize:13, color:'var(--text-primary)', marginBottom:3 }}>{nft.name}</h4>
                    <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>{nft.trait}</p>
                  </div>
                  <Badge label={nft.rarity} color={nft.rc}/>
                </div>
                {nft.owned && (
                  <div style={{ marginBottom:10, padding:'8px 10px', borderRadius:10, background:`${nft.rc}10`, border:`1px solid ${nft.rc}22` }}>
                    <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:nft.rc, fontFamily:'var(--font-mono)', marginBottom:5 }}>{isCyber?'BOOST_STATS':'⚡ Boost Stats'}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
                      {[{k:'Sugar',v:`×${boostDef.sugarRate}`},{k:'Score',v:`×${boostDef.scoreMulti}`}].map(s => (
                        <div key={s.k} style={{ fontSize:10, fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-mono)' }}>
                          <span style={{ color:'var(--text-muted)' }}>{s.k}: </span>{s.v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* ── NFT ACTION BUTTONS ── */}
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {/* Row 1: Equip / Win */}
                  <div style={{ display:'flex', gap:6 }}>
                    {nft.owned ? (
                      <JBtn grad={nft.equipped?'linear-gradient(135deg,rgba(200,180,220,0.2),rgba(200,180,220,0.05))':`linear-gradient(135deg,${nft.rc},${nft.rc}bb)`} onClick={() => toggleEquip(nft)} size="xs" sx={nft.equipped?{color:'var(--text-primary)'}:{}}>
                        {nft.equipped?(isCyber?'UNEQUIP':'Unequip'):(isCyber?'EQUIP':'⚡ Equip')}
                      </JBtn>
                    ) : (
                      <JBtn grad="rgba(150,150,160,0.15)" size="xs" disabled sx={{ color:'var(--text-muted)', fontSize:10 }}>
                        {isCyber?'WIN_TO_UNLOCK':'Win in Raffle'}
                      </JBtn>
                    )}
                  </div>
                  {/* Row 2: List & Transfer (Demo Only) */}
                  {nft.owned && (
                    <div style={{ display:'flex', gap:6 }}>
                      <JBtn
                        grad="rgba(150,150,160,0.12)"
                        size="xs" disabled
                        sx={{ color:'var(--text-muted)', fontSize:9, flex:1, justifyContent:'center' }}
                        icon="📋">
                        {isCyber?'LIST.EXE':'List'} <span style={{fontSize:8,opacity:0.6}}>demo</span>
                      </JBtn>
                      <JBtn
                        grad="rgba(150,150,160,0.12)"
                        size="xs" disabled
                        sx={{ color:'var(--text-muted)', fontSize:9, flex:1, justifyContent:'center' }}
                        icon="↗">
                        {isCyber?'TRANSFER.EXE':'Transfer'} <span style={{fontSize:8,opacity:0.6}}>demo</span>
                      </JBtn>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Glass className="fup" style={{ padding:'14px 20px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
          {isCyber?'> Stack multiple NFTs for additive bonus':'💡 Equip multiple NFTs untuk stacked bonuses!'}
        </p>
      </Glass>
    </div>
  )
}