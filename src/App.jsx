import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   CSS VARIABLES — 3-MODE ARCHITECTURE
   All colors bound to CSS custom properties. Zero hardcode.
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   THEME SWITCHER — apply ke <html> supaya CSS vars :root aktif
   handleThemeChange bisa di-inject ke tombol manapun di UI.
═══════════════════════════════════════════════════════════════ */
function applyThemeToDOM(mode) {
  // 1. Reset semua theme class dari <html> element
  document.documentElement.classList.remove('theme-jelly', 'theme-light', 'theme-cyber')
  // 2. Jelly = default :root, tidak perlu class tambahan
  if (mode !== 'theme-jelly') {
    document.documentElement.classList.add(mode)
  }
  // 3. Persist ke localStorage — gak reset setelah refresh
  try { localStorage.setItem('userTheme', mode) } catch (e) {}
}

// handleThemeChange — fungsi utama, inject ke tombol manapun
function handleThemeChange(mode, setTheme) {
  const valid = ['theme-jelly', 'theme-light', 'theme-cyber']
  if (!valid.includes(mode)) return
  applyThemeToDOM(mode)   // ubah DOM langsung
  setTheme(mode)           // update React state -> re-render
}

// switchTheme alias untuk backward compat
function switchTheme(mode, setTheme) { handleThemeChange(mode, setTheme) }

function getSavedTheme() {
  try { return localStorage.getItem('userTheme') || 'theme-jelly' } catch (e) { return 'theme-jelly' }
}

/* ═══════════════════════════════════════════════════════════════
   NFT BOOST DEFINITIONS
   Each NFT rarity grants specific stat bonuses in Jelly Shooter.
   Boosts stack additively if player owns multiple NFTs.
═══════════════════════════════════════════════════════════════ */
const NFT_BOOSTS = {
  Legendary: {
    sugarRate:    2.5,   // +2.5× faster sugar fill
    pressureRate: 1.8,   // +1.8× faster pressure build
    scoreMulti:   2.0,   // ×2.0 score multiplier
    shakeBonus:   20,    // +20 sugar per shake (default 12)
    label:        'LEGENDARY BOOST',
    color:        '#f59e0b',
    icon:         '👑',
    perks:        ['2.5× Sugar Rate', '2.0× Score', '+20 Shake Bonus'],
  },
  Epic: {
    sugarRate:    1.8,
    pressureRate: 1.4,
    scoreMulti:   1.5,
    shakeBonus:   16,
    label:        'EPIC BOOST',
    color:        '#8b5cf6',
    icon:         '💜',
    perks:        ['1.8× Sugar Rate', '1.5× Score', '+16 Shake Bonus'],
  },
  Rare: {
    sugarRate:    1.4,
    pressureRate: 1.2,
    scoreMulti:   1.25,
    shakeBonus:   14,
    label:        'RARE BOOST',
    color:        '#0ea5e9',
    icon:         '🔵',
    perks:        ['1.4× Sugar Rate', '1.25× Score', '+14 Shake Bonus'],
  },
  Uncommon: {
    sugarRate:    1.15,
    pressureRate: 1.05,
    scoreMulti:   1.1,
    shakeBonus:   12,
    label:        'UNCOMMON BOOST',
    color:        '#ec4899',
    icon:         '🩷',
    perks:        ['1.15× Sugar Rate', '1.1× Score', 'Base Shake'],
  },
}

// Compute merged boost from all owned NFTs
function computeActiveBoost(ownedNFTs) {
  if (!ownedNFTs.length) return null
  const merged = { sugarRate: 0, pressureRate: 0, scoreMulti: 0, shakeBonus: 0 }
  // Use highest rarity as primary, stack smaller boosts
  const order = ['Legendary', 'Epic', 'Rare', 'Uncommon']
  const top = order.find(r => ownedNFTs.some(n => n.rarity === r))
  const base = NFT_BOOSTS[top]
  // Stack 10% of lower rarity bonuses additively
  ownedNFTs.forEach(n => {
    const b = NFT_BOOSTS[n.rarity]
    merged.sugarRate    += b.sugarRate * (n.rarity === top ? 1 : 0.1)
    merged.pressureRate += b.pressureRate * (n.rarity === top ? 1 : 0.1)
    merged.scoreMulti   += b.scoreMulti * (n.rarity === top ? 1 : 0.1)
    merged.shakeBonus   += b.shakeBonus * (n.rarity === top ? 1 : 0.1)
  })
  return {
    ...merged,
    label:  base.label,
    color:  base.color,
    icon:   base.icon,
    count:  ownedNFTs.length,
    top,
  }
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const INITIAL_RAFFLES = [
  { id:1, emoji:'🪼', name:'Jellyfish Genesis', prize:'5,000 $BGS',       price:50,  sold:73, max:100, ends:'2h 14m', hot:true  },
  { id:2, emoji:'🍑', name:'Peach Bomb',        prize:'2,500 $BGS + NFT', price:25,  sold:41, max:80,  ends:'5h 50m', hot:false },
  { id:3, emoji:'🫧', name:'Bubble Surge',      prize:'10,000 $BGS',      price:100, sold:18, max:50,  ends:'23h 00m',hot:true  },
]

// All inventory NFTs — player "owns" them all for demo purposes
const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', trait:'Gold Helmet',  rc:'#f59e0b', glow:'glow-legendary', owned:true  },
  { id:2, name:'Motocat #0117', rarity:'Epic',      emoji:'😺', trait:'Neon Wings',   rc:'#8b5cf6', glow:'glow-epic',      owned:true  },
  { id:3, name:'Motocat #0289', rarity:'Rare',      emoji:'🐈', trait:'Cyber Visor',  rc:'#0ea5e9', glow:'glow-rare',      owned:false },
  { id:4, name:'Motocat #0401', rarity:'Uncommon',  emoji:'🙀', trait:'Pink Bandana', rc:'#ec4899', glow:'',               owned:false },
]

const TABS = [
  { id:'dashboard',    label:'Dashboard',    icon:'🏠' },
  { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' },
  { id:'inventory',    label:'Inventory',     icon:'🎁' },
]
const THEME_OPTS = [
  { id:'theme-jelly', icon:'🍬', label:'Jelly',  desc:'Pastel Candy'  },
  { id:'theme-light', icon:'☀️',  label:'Light',  desc:'Minimalist'    },
  { id:'theme-cyber', icon:'🤖', label:'Cyber',  desc:'Neon Hacker'   },
]
const JELLY_COLORS = ['#f472b6','#60a5fa','#34d399','#fbbf24','#c084fc','#fb923c','#6ee7b7','#f9a8d4']

/* ═══════════════════════════════════════════════════════════════
   SVG COMPONENTS
═══════════════════════════════════════════════════════════════ */
const JellyFish = ({ size = 60, className = '', style: sx = {} }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 60 84" className={className}
    style={{ filter: 'drop-shadow(0 4px 14px var(--jelly-glow))', ...sx }}>
    <defs>
      <radialGradient id="jbg" cx="40%" cy="35%">
        <stop offset="0%" stopColor="white" stopOpacity="0.7" />
        <stop offset="45%" stopColor="var(--jelly-body)" stopOpacity="0.95" />
        <stop offset="100%" stopColor="var(--jelly-body)" stopOpacity="0.65" />
      </radialGradient>
    </defs>
    <ellipse cx="30" cy="28" rx="26" ry="22" fill="url(#jbg)" />
    <ellipse cx="22" cy="18" rx="10" ry="6" fill="rgba(255,255,255,0.38)" />
    {[6,13,20,27,34,41,48,54].map((x, i) => (
      <path key={i} d={`M${x} 48 Q${x - 2} ${60 + i * 2} ${x} ${67 + i * 2}`}
        stroke="var(--jelly-body)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />
    ))}
    {[10, 22, 38, 50].map((x, i) => (
      <path key={i} d={`M${x} 50 C${x - 5} ${62} ${x + 6} ${70} ${x - 3} ${80}`}
        stroke="var(--jelly-body)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
    ))}
  </svg>
)

const CyberBot = ({ size = 60, style: sx = {} }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 60 78" style={{ filter: 'drop-shadow(0 0 12px var(--jelly-glow))', ...sx }}>
    <defs>
      <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--jelly-body)" stopOpacity="0.2" />
        <stop offset="100%" stopColor="var(--jelly-body)" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <rect x="10" y="8" width="40" height="38" rx="4" fill="url(#cbg)" stroke="var(--jelly-body)" strokeWidth="1.5" />
    <rect x="16" y="18" width="10" height="6" rx="2" fill="var(--jelly-body)" opacity="0.9" />
    <rect x="34" y="18" width="10" height="6" rx="2" fill="var(--jelly-body)" opacity="0.9" />
    <rect x="18" y="32" width="24" height="4" rx="2" fill="none" stroke="var(--jelly-body)" strokeWidth="1" opacity="0.6" />
    {[20, 24, 28, 32, 36].map(x => <line key={x} x1={x} y1="32" x2={x} y2="36" stroke="var(--jelly-body)" strokeWidth="1" opacity="0.5" />)}
    {[18, 30, 42].map((x, i) => <rect key={i} x={x - 4} y="46" width="8" height="16" rx="2" fill="var(--jelly-body)" opacity="0.7" />)}
    <line x1="30" y1="8" x2="30" y2="2" stroke="var(--jelly-body)" strokeWidth="2" />
    <circle cx="30" cy="2" r="2.5" fill="var(--jelly-body)" />
    <rect x="14" y="11" width="18" height="12" rx="2" fill="rgba(255,255,255,0.15)" />
  </svg>
)

const JellyCube = ({ size = 48, style: sx = {} }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 4px 12px var(--jelly-glow))', ...sx }}>
    <defs>
      <linearGradient id="cubeg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.6" />
        <stop offset="60%" stopColor="var(--accent-2)" stopOpacity="0.9" />
        <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="40" height="40" rx="12" fill="url(#cubeg)" />
    <ellipse cx="24" cy="22" rx="8" ry="5" fill="rgba(255,255,255,0.42)" />
  </svg>
)

/* ═══════════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════════ */
const Toaster = ({ toasts }) => (
  <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
    {toasts.map(t => (
      <div key={t.id} className="tin glass" style={{
        pointerEvents:'auto', display:'flex', alignItems:'center', gap:10,
        padding:'12px 18px', borderRadius:20,
        background: t.type==='success'?'var(--toast-ok)':t.type==='error'?'var(--toast-err)':'var(--toast-pnd)',
        color:'#fff', fontFamily:'var(--font-body)', fontWeight:800, fontSize:13, minWidth:260,
        border:'1.5px solid rgba(255,255,255,0.35)',
      }}>
        <span style={{ fontSize:18 }}>{t.type==='success'?'🎉':t.type==='error'?'😢':'⏳'}</span>
        {t.message}
      </div>
    ))}
  </div>
)

const PageBg = () => (
  <div className="page-bg">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="blob" style={{
        width:  i===1?500:i===2?420:i===3?350:290,
        height: i===1?500:i===2?420:i===3?350:290,
        background: `var(--blob-${i})`,
        filter: `blur(var(--blob-blur))`,
        top:    i===1?'-120px':i===2?'40%':i===3?'auto':'20%',
        left:   i===1?'-100px':i===2?'auto':i===3?'28%':'48%',
        right:  i===2?'-80px':'auto',
        bottom: i===3?'-80px':'auto',
        animationDelay: `${(i-1)*-4}s`,
      }} />
    ))}
  </div>
)

const Glass = ({ children, style = {}, className = '' }) => (
  <div className={`glass ${className}`} style={style}>{children}</div>
)

const JBtn = ({ children, grad, onClick, disabled, size='md', icon, sx={} }) => {
  const pads = { xl:'16px 36px', lg:'13px 30px', md:'10px 22px', sm:'8px 16px', xs:'5px 12px' }
  const fz   = { xl:17, lg:15, md:13, sm:12, xs:11 }
  const s = size in pads ? size : 'md'
  return (
    <button className="jbtn" onClick={onClick} disabled={disabled} style={{
      background: disabled?'rgba(150,150,160,0.25)':grad||'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
      borderRadius:999, color: disabled?'var(--text-muted)':'#fff',
      fontWeight:900, fontSize:fz[s], padding:pads[s],
      display:'inline-flex', alignItems:'center', gap:6, letterSpacing:'0.02em',
      boxShadow: disabled?'none':'var(--btn-shadow)',
      whiteSpace:'nowrap', ...sx,
    }}>
      {icon && <span style={{ fontSize:(fz[s])+4, lineHeight:1 }}>{icon}</span>}
      {children}
    </button>
  )
}

const ProgBar = ({ pct, cssVar='--fuel-bar', animated=false }) => (
  <div style={{ background:'var(--prog-bg)', borderRadius:999, height:9, overflow:'hidden' }}>
    <div style={{
      width:`${Math.min(pct,100)}%`, height:'100%', borderRadius:999,
      background:`var(${cssVar})`, transition:'width 0.1s ease',
      position:'relative', overflow:'hidden',
      ...(animated ? { animation:'boostPulse 1.8s ease-in-out infinite' } : {}),
    }}>
      <div style={{ position:'absolute', inset:0,
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)',
        backgroundSize:'200% 100%', animation:'shimmer 1.8s linear infinite' }} />
    </div>
  </div>
)

const Badge = ({ label, color }) => (
  <span style={{ background:`${color}22`, border:`1.5px solid ${color}66`, color,
    fontSize:10, fontWeight:900, padding:'3px 10px', borderRadius:999,
    textTransform:'uppercase', letterSpacing:'.08em', fontFamily:'var(--font-mono)' }}>
    {label}
  </span>
)

/* ═══════════════════════════════════════════════════════════════
   NFT BOOST PANEL COMPONENT
   Shows active boosts from owned NFTs — displayed in Shooter HUD
═══════════════════════════════════════════════════════════════ */
const BoostPanel = ({ boost, isCyber }) => {
  if (!boost) return (
    <Glass style={{ padding:'14px 16px', border:'1.5px dashed var(--nav-border)' }}>
      <div style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)', lineHeight:1.7 }}>
        {isCyber ? '> NO_BOOST_DETECTED\n  Equip NFT for stats' : '🎯 No NFT Boost\nWin NFTs from Raffles\nto unlock stat boosts!'}
      </div>
      <div style={{ marginTop:10, textAlign:'center' }}>
        <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
          {isCyber ? '> Go to INVENTORY tab' : '→ Check Inventory tab'}
        </span>
      </div>
    </Glass>
  )

  return (
    <Glass className="boost-active" style={{ padding:'14px 16px', border:`1.5px solid ${boost.color}66`,
      boxShadow:`0 0 20px ${boost.color}44, var(--card-shadow)` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:20 }}>{boost.icon}</span>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:900,
            textTransform:'uppercase', letterSpacing:'.08em', color:boost.color }}>
            {isCyber ? `> ${boost.label}` : boost.label}
          </div>
          <div style={{ fontSize:9, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
            {boost.count} NFT{boost.count>1?'s':''} equipped
          </div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {boost.perks.map((p, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11,
            color:'var(--text-primary)', fontFamily:'var(--font-mono)', fontWeight:700 }}>
            <span style={{ color:boost.color, fontSize:10 }}>▶</span>
            {p}
          </div>
        ))}
      </div>
      <div style={{ marginTop:10, fontSize:9, fontFamily:'var(--font-mono)', color:'var(--text-muted)', borderTop:'1px solid var(--nav-border)', paddingTop:8 }}>
        {isCyber ? `MULTI: ×${boost.scoreMulti.toFixed(2)}` : `Score ×${boost.scoreMulti.toFixed(2)} active`}
      </div>
    </Glass>
  )
}

/* ═══════════════════════════════════════════════════════════════
   JELLY SHOOTER — FULL GAME ENGINE + NFT BOOST INTEGRATION
═══════════════════════════════════════════════════════════════ */
const JellyShooterView = ({ theme, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'

  // Boost-modified stats
  const sugarRate    = activeBoost ? Math.min(activeBoost.sugarRate, 4)    : 1
  const pressureRate = activeBoost ? Math.min(activeBoost.pressureRate, 3) : 1
  const scoreMulti   = activeBoost ? activeBoost.scoreMulti                : 1
  const shakeBonus   = activeBoost ? activeBoost.shakeBonus                : 12

  const [phase,    setPhase]    = useState('idle')
  const [sugar,    setSugar]    = useState(0)
  const [pressure, setPressure] = useState(0)
  const [countdown,setCountdown]= useState(3)
  const [score,    setScore]    = useState(0)
  const [bestScore,setBest]     = useState(0)
  const [particles,setParticles]= useState([])
  const [shakeFlash,setShakeFlash] = useState(false)
  const [jellyPos, setJellyPos] = useState(0)
  const [thrusterOn,setThruster]= useState(false)

  const chargeRef  = useRef(null)
  const countRef   = useRef(null)
  const flyRef     = useRef(null)
  const sugarRef   = useRef(0)
  const pressRef   = useRef(0)
  const lastShake  = useRef(0)
  const phaseRef   = useRef('idle')

  useEffect(() => { sugarRef.current = sugar }, [sugar])
  useEffect(() => { pressRef.current = pressure }, [pressure])
  useEffect(() => { phaseRef.current = phase }, [phase])

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
    const angle = (Math.random() - 0.5) * 65
    const dist  = 32 + Math.random() * 52
    setParticles(p => [...p, {
      id,
      px: Math.sin(angle * Math.PI / 180) * dist,
      py: 42 + Math.random() * 32
    }].slice(-20))
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 600)
  }, [])

  const stopCharge = useCallback(() => {
    clearInterval(chargeRef.current)
    setThruster(false)
    if (sugarRef.current < 10) {
      setPhase('idle'); setSugar(0); setPressure(0); return
    }
    setPhase('countdown')
    let c = 3; setCountdown(c)
    countRef.current = setInterval(() => {
      c--
      if (c <= 0) { clearInterval(countRef.current); launchNow() }
      else setCountdown(c)
    }, 900)
  }, [])

  const launchNow = useCallback(() => {
    const power = sugarRef.current
    const press = pressRef.current
    const raw   = Math.round(power * 10 + press * 5)
    const final = Math.round(raw * scoreMulti)
    setPhase('flying')
    let pos = 0
    const target = power * 2.8
    flyRef.current = setInterval(() => {
      pos += (target - pos) * 0.08 + 1.5
      setJellyPos(pos)
      if (pos >= target - 5) {
        clearInterval(flyRef.current)
        setScore(final)
        setBest(b => Math.max(b, final))
        setPhase('landed')
        for (let i = 0; i < 14; i++) spawnParticle()
        setTimeout(() => { setJellyPos(0); setSugar(0); setPressure(0) }, 2200)
        setTimeout(() => setPhase('idle'), 2800)
      }
    }, 16)
  }, [scoreMulti, spawnParticle])

  const startCharge = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    setPhase('charging'); setThruster(true)
    chargeRef.current = setInterval(() => {
      setSugar(s => {
        const n = Math.min(s + 1.8 * sugarRate, 100)
        sugarRef.current = n
        return n
      })
      setPressure(p => {
        const n = Math.min(p + 1.2 * pressureRate, 100)
        pressRef.current = n
        return n
      })
      spawnParticle()
      if (sugarRef.current >= 100) stopCharge()
    }, 50)
  }, [sugarRate, pressureRate, spawnParticle, stopCharge])

  // Keyboard
  useEffect(() => {
    const kd = e => { if (e.code==='Space') { e.preventDefault(); startCharge() } }
    const ku = e => { if (e.code==='Space') { e.preventDefault(); stopCharge() } }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
  }, [startCharge, stopCharge])

  useEffect(() => () => {
    clearInterval(chargeRef.current); clearInterval(countRef.current); clearInterval(flyRef.current)
  }, [])

  const tierLabel = score>=900?'🏆 LEGENDARY':score>=600?'💜 EPIC':score>=300?'🔵 RARE':'🌱 STARTER'

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* HUD + Boost info */}
      <Glass className="fup" style={{ padding:'18px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--text-primary)', marginBottom:4 }}>
              {isCyber ? '🤖 CYBER LAUNCHER' : '🪼 Jelly Shooter'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
              {isCyber
                ? '> Hold [SPACE] or button → charge → release to LAUNCH'
                : 'Tahan tombol untuk isi gula, lepas untuk meluncur! 🚀'}
            </p>
            {activeBoost && (
              <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:6,
                background:`${activeBoost.color}18`, border:`1px solid ${activeBoost.color}44`,
                borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:900,
                color:activeBoost.color, fontFamily:'var(--font-mono)' }}>
                {activeBoost.icon} {isCyber?'NFT_BOOST_ACTIVE':''} Score ×{activeBoost.scoreMulti.toFixed(2)} active
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            {shakeFlash && (
              <span style={{ fontFamily:'var(--font-hud)', fontSize:13, color:'var(--accent-4)',
                fontWeight:900, animation:'jellyWobble 0.3s ease' }}>
                +SHAKE {shakeBonus}⚡
              </span>
            )}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em',
                color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>BEST</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--accent-2)' }}>{bestScore}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em',
                color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>SCORE</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:28, color:'var(--accent-1)' }}>{score}</div>
            </div>
          </div>
        </div>
      </Glass>

      {/* Game grid */}
      <div className="game-grid" style={{ display:'grid', gridTemplateColumns:'1fr 270px', gap:14 }}>

        {/* Arena */}
        <Glass className="fup" style={{ position:'relative', height:430, overflow:'hidden',
          background:'var(--game-bg)', border:'1.5px solid var(--game-border)' }}>
          {isCyber && (
            <div style={{ position:'absolute', inset:0,
              backgroundImage:'linear-gradient(var(--accent-1) 1px,transparent 1px),linear-gradient(90deg,var(--accent-1) 1px,transparent 1px)',
              backgroundSize:'30px 30px', opacity:0.05,
              animation:'gridPulse 3s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
          )}

          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} style={{
              position:'absolute', left:'50%', bottom:80, width:8, height:8,
              borderRadius: isCyber?'2px':'50%',
              background:'var(--particle-clr)',
              '--px':`${p.px}px`, '--py':`${p.py}px`,
              animation:'particleBurst 0.6s ease-out forwards',
              boxShadow:'0 0 6px var(--jelly-glow)', zIndex:2,
            }} />
          ))}

          {/* Ground */}
          <div style={{ position:'absolute', bottom:70, left:0, right:0, height:2,
            background:'var(--game-border)', opacity:0.4 }} />

          {/* NFT boost aura under character */}
          {activeBoost && (
            <div style={{ position:'absolute', left:'50%', bottom:66, transform:'translateX(-50%)',
              width:80, height:20, borderRadius:'50%',
              background:`radial-gradient(ellipse,${activeBoost.color}55,transparent)`,
              zIndex:3, animation:'boostPulse 1.8s ease-in-out infinite' }} />
          )}

          {/* Character */}
          <div style={{
            position:'absolute', left:'50%',
            bottom: 80 + (phase==='flying'||phase==='landed' ? jellyPos : 0),
            transform:'translateX(-50%)',
            zIndex:5,
            animation: phase==='charging'
              ? (isCyber?'cyberJitter 0.15s linear infinite':'jellyWobble 0.3s ease-in-out infinite')
              : phase==='flying' ? 'none' : 'floatIdle 3.5s ease-in-out infinite',
            transition:'bottom 0.05s linear',
          }}>
            {isCyber ? <CyberBot size={72} /> : <JellyFish size={72} />}
          </div>

          {/* Thrusters */}
          {thrusterOn && [...Array(5)].map((_, i) => (
            <div key={i} style={{
              position:'absolute', left:`calc(50% + ${(i-2)*12}px)`, bottom:76,
              width: isCyber?6:8, height: isCyber?6:8,
              borderRadius: isCyber?'2px':'50%',
              background: isCyber ? `hsl(${120+i*15},100%,60%)` : `hsl(${310+i*15},90%,${70+i*5}%)`,
              animation:`thrusterBubble ${0.4+i*0.08}s ease-out infinite`,
              animationDelay:`${i*0.06}s`, boxShadow:'0 0 8px var(--jelly-glow)', zIndex:4,
            }} />
          ))}

          {/* Countdown overlay */}
          {phase==='countdown' && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              zIndex:10, backdropFilter:'blur(4px)', borderRadius:'var(--card-radius)' }}>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:96, color:'var(--accent-1)',
                animation:'countdownAnim 0.9s ease-in-out forwards',
                textShadow:'0 0 40px var(--jelly-glow)' }}>{countdown}</div>
            </div>
          )}

          {/* Landed result */}
          {phase==='landed' && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:10, zIndex:10,
              backdropFilter:'blur(6px)', borderRadius:'var(--card-radius)' }}>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:40, color:'var(--accent-1)',
                textShadow:'0 0 30px var(--jelly-glow)' }}>{score} pts!</div>
              {activeBoost && (
                <div style={{ fontSize:13, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>
                  {activeBoost.icon} NFT BOOST ×{activeBoost.scoreMulti.toFixed(2)} applied
                </div>
              )}
              <div style={{ fontFamily:'var(--font-hud)', fontSize:18, color:'var(--text-muted)' }}>{tierLabel}</div>
            </div>
          )}

          {phase==='idle' && (
            <div style={{ position:'absolute', bottom:14, left:0, right:0, textAlign:'center',
              fontSize:12, fontWeight:800, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
              {isCyber ? '> HOLD_BUTTON or [SPACE] to init charge' : '💡 Tahan tombol atau SPACE untuk isi Kadar Gula'}
            </div>
          )}
        </Glass>

        {/* Control Panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Kadar Gula */}
          <Glass style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:'var(--text-muted)' }}>
                {isCyber ? '[ POWER.CORE ]' : 'Kadar Gula ⚡'}
                {sugarRate > 1 && <span style={{ color:'var(--accent-4)', marginLeft:4 }}>×{sugarRate.toFixed(1)}</span>}
              </span>
              <span style={{ fontFamily:'var(--font-hud)', fontSize:14, color:'var(--accent-1)', fontWeight:900 }}>
                {Math.round(sugar)}%
              </span>
            </div>
            <ProgBar pct={sugar} cssVar="--fuel-bar" />
            {sugar >= 90 && (
              <div style={{ marginTop:6, fontSize:10, fontWeight:900, color:'var(--accent-1)',
                fontFamily:'var(--font-mono)', textAlign:'center', animation:'jellyWobble 0.5s ease infinite' }}>
                {isCyber ? '[!] OVERFLOW' : '⚠️ Gula Penuh!'}
              </div>
            )}
          </Glass>

          {/* Tekanan Lontar */}
          <Glass style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:'var(--text-muted)' }}>
                {isCyber ? '[ TEKANAN.SYS ]' : 'Tekanan Lontar 🎯'}
                {pressureRate > 1 && <span style={{ color:'var(--accent-4)', marginLeft:4 }}>×{pressureRate.toFixed(1)}</span>}
              </span>
              <span style={{ fontFamily:'var(--font-hud)', fontSize:14, color:'var(--accent-3)', fontWeight:900 }}>
                {Math.round(pressure)}%
              </span>
            </div>
            <ProgBar pct={pressure} cssVar="--pressure-bar" />
          </Glass>

          {/* NFT Boost Panel */}
          <BoostPanel boost={activeBoost} isCyber={isCyber} />

          {/* Launch Button */}
          <button className="jbtn"
            onMouseDown={startCharge} onMouseUp={stopCharge}
            onTouchStart={e => { e.preventDefault(); startCharge() }}
            onTouchEnd={e => { e.preventDefault(); stopCharge() }}
            disabled={phase==='countdown'||phase==='flying'||phase==='landed'}
            style={{
              background: phase==='charging'
                ? 'linear-gradient(135deg,var(--accent-4),var(--accent-3))'
                : 'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
              padding:'18px 14px', borderRadius:18, fontFamily:'var(--font-hud)',
              fontWeight:900, fontSize:15, color:'#fff',
              boxShadow:'var(--btn-shadow), 0 0 20px var(--btn-glow)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              userSelect:'none', touchAction:'none',
            }}>
            <span style={{ fontSize:28 }}>
              {phase==='charging'?'⚡':phase==='countdown'?'🔢':phase==='flying'?'🚀':'🪼'}
            </span>
            <span>
              {phase==='charging'  ? (isCyber?'CHARGING...':'Mengisi…') :
               phase==='countdown' ? (isCyber?'LAUNCHING...':'Menghitung…') :
               phase==='flying'    ? (isCyber?'IN_FLIGHT':'Terbang!') :
               phase==='landed'    ? (isCyber?'RESET':'Selesai!') :
                                     (isCyber?'INIT_LAUNCH':'Tahan → Isi Gula!')}
            </span>
            <span style={{ fontSize:10, opacity:0.7, fontFamily:'var(--font-mono)' }}>
              {isCyber ? '[HOLD]' : 'Tahan & Lepas'}
            </span>
          </button>

          {/* Shake bonus */}
          <Glass style={{ padding:'12px 16px' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', fontFamily:'var(--font-mono)',
              textAlign:'center', lineHeight:1.6 }}>
              {isCyber ? '> SHAKE device → +ENERGY' : '📱 Kocok HP untuk bonus!'}
              {shakeFlash && (
                <div style={{ color:'var(--accent-4)', fontWeight:900, marginTop:4 }}>
                  {isCyber ? `[SHAKE_DETECTED +${shakeBonus}]` : `🔋 +${shakeBonus} Gula!`}
                </div>
              )}
            </div>
          </Glass>

          {/* Reward table */}
          <Glass style={{ padding:'12px 16px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:900,
              textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text-muted)', marginBottom:8 }}>
              {isCyber ? 'REWARD_TABLE' : 'Hadiah'}
            </div>
            {[{ pts:300, r:'1 Raffle Entry', ic:'🎟️' }, { pts:600, r:'Free Ticket', ic:'🎫' }, { pts:900, r:'NFT Bonus', ic:'🏆' }].map(r => (
              <div key={r.pts} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, opacity:score>=r.pts?1:0.45 }}>
                <span style={{ fontSize:14 }}>{r.ic}</span>
                <span style={{ fontSize:11, fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-mono)' }}>
                  {r.pts}+ → {r.r}
                </span>
                {score >= r.pts && <span style={{ marginLeft:'auto', fontSize:12, color:'var(--accent-4)' }}>✓</span>}
              </div>
            ))}
          </Glass>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD VIEW
═══════════════════════════════════════════════════════════════ */
const DashView = ({ theme, connected, balance, tickets, setTickets, setBalance, addToast, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  const [raffles, setRaffles] = useState(INITIAL_RAFFLES.map(r => ({ ...r })))
  const [buyId, setBuyId] = useState(null)
  const [revId, setRevId] = useState(null)

  const buy = async r => {
    if (!connected)        { addToast('Connect wallet first!', 'error'); return }
    if (balance < r.price) { addToast('Not enough $BGS!', 'error'); return }
    setBuyId(r.id)
    addToast(isCyber ? '> SIGNING tx on OPWallet...' : 'Signing on OPWallet…', 'pending')
    await new Promise(x => setTimeout(x, 900))
    addToast(isCyber ? '> BROADCAST to OP_NET...' : 'Broadcasting to OP_NET…', 'pending')
    await new Promise(x => setTimeout(x, 1100))
    setBalance(b => b - r.price)
    setTickets(t => ({ ...t, [r.id]: (t[r.id] || 0) + 1 }))
    setRaffles(rs => rs.map(x => x.id === r.id ? { ...x, sold: Math.min(x.sold + 1, x.max) } : x))
    addToast('🎟️ Ticket confirmed on OP_NET!', 'success')
    setBuyId(null)
  }

  const reveal = async id => {
    if (!connected) { addToast('Connect wallet first!', 'error'); return }
    setRevId(id)
    addToast(isCyber ? '> REQUESTING VRF seed...' : 'Requesting VRF entropy…', 'pending')
    await new Promise(x => setTimeout(x, 1000))
    addToast(isCyber ? '> VERIFYING proof...' : 'Verifying on-chain proof…', 'pending')
    await new Promise(x => setTimeout(x, 1200))
    const w = ['bc1p...a3f9', 'bc1p...7dk2', 'bc1p...z0q8'][Math.floor(Math.random() * 3)]
    addToast(`🏆 Winner: ${w}`, 'success')
    setRevId(null)
  }

  const totalTickets = Object.values(tickets).reduce((a, b) => a + b, 0)
  const stats = [
    { l: isCyber?'PRIZE_POOL':'Prize Pool',      v: '17,500 $BGS', e: '💎' },
    { l: isCyber?'ACTIVE_LIVE':'Active Raffles',  v: '3 Live',      e: '🔴' },
    { l: isCyber?'MY_TICKETS':'My Tickets',       v: totalTickets,  e: '🎟️' },
    { l: isCyber?'PLAYERS':'Players Online',      v: '214',          e: '🪼'  },
  ]

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Hero */}
      <Glass className="fup" style={{ padding:'26px 30px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-10, top:-10, opacity:0.8 }}>
          {isCyber ? <CyberBot size={88} style={{ animation:'floatIdle 3.5s ease-in-out infinite' }} />
                   : <JellyFish size={88} className="float-idle" />}
        </div>
        <div style={{ position:'absolute', right:100, bottom:-8, opacity:0.6 }}>
          <JellyCube size={50} style={{ animation:'floatIdle 4s ease-in-out infinite', animationDelay:'1s' }} />
        </div>
        <div style={{ maxWidth:480 }}>
          <p style={{ fontSize:11, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em',
            color:'var(--accent-1)', marginBottom:8, fontFamily:'var(--font-mono)' }}>
            {isCyber ? '> OP_NET.PROTOCOL · $BGS.TOKEN' : '🍬 OP_NET · Powered by $BGS Token'}
          </p>
          <h1 style={{ fontFamily:'var(--font-hud)', fontSize:'clamp(1.5rem,4vw,2.2rem)', lineHeight:1.15,
            color:'var(--text-primary)', marginBottom:10 }}>
            {isCyber ? 'WIN.SYS: Jelly_Raffle.exe' : 'Win Sweet Prizes with Jelly Shot Raffle 🪼'}
          </h1>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--text-muted)', marginBottom:18, fontFamily:'var(--font-mono)' }}>
            {isCyber ? '> Provably fair / on-chain lottery / $BGS / OP_NET'
                     : 'Provably fair on-chain lottery. Buy tickets with $BGS, win big every 6 hours.'}
          </p>
          {activeBoost && (
            <div style={{ marginBottom:14, display:'inline-flex', alignItems:'center', gap:8,
              background:`${activeBoost.color}18`, border:`1.5px solid ${activeBoost.color}44`,
              borderRadius:12, padding:'8px 14px' }}>
              <span style={{ fontSize:18 }}>{activeBoost.icon}</span>
              <span style={{ fontSize:12, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>
                {activeBoost.label} — Score ×{activeBoost.scoreMulti.toFixed(2)} in Jelly Shooter
              </span>
            </div>
          )}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <JBtn icon="🎰" onClick={() => addToast('Scroll down to join a raffle! 🎟️', 'success')}>
              {isCyber ? 'JOIN_RAFFLE.EXE' : 'Join Now'}
            </JBtn>
            <JBtn grad="linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))"
              sx={{ color:'var(--text-primary)', boxShadow:'0 4px 14px rgba(0,0,0,0.08),inset 0 2px 0 rgba(255,255,255,0.3)' }}
              icon="📖" onClick={() => addToast('Docs coming soon 📖', 'pending')}>
              {isCyber ? 'READ.DOC' : 'How It Works'}
            </JBtn>
          </div>
        </div>
      </Glass>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
        {stats.map((s, i) => (
          <Glass key={i} className="fup" style={{ padding:'16px 18px', animationDelay:`${i*0.07}s` }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
              <span style={{ fontSize:17 }}>{s.e}</span>
              <span style={{ fontSize:9.5, fontWeight:900, textTransform:'uppercase', letterSpacing:'.08em',
                color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{s.l}</span>
            </div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:'var(--font-hud)', color:'var(--accent-1)' }}>{s.v}</div>
          </Glass>
        ))}
      </div>

      {/* Balance */}
      {connected && (
        <Glass className="fup" style={{ padding:'20px 26px', border:'1.5px solid var(--accent-1)',
          boxShadow:'var(--card-shadow),0 0 24px var(--btn-glow)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'.12em',
                color:'var(--text-muted)', marginBottom:8, fontFamily:'var(--font-mono)' }}>
                {isCyber ? 'WALLET.BALANCE' : 'Your $BGS Balance'}
              </p>
              <p style={{ fontFamily:'var(--font-hud)', fontSize:36, lineHeight:1, color:'var(--accent-1)' }}>
                {balance.toLocaleString()}
                <span style={{ fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, color:'var(--text-muted)' }}> $BGS</span>
              </p>
            </div>
            {isCyber ? <CyberBot size={60} style={{ animation:'floatIdle 3s ease-in-out infinite' }} />
                     : <JellyFish size={60} className="float-idle" />}
          </div>
        </Glass>
      )}

      {/* Live Raffles */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          {isCyber ? <span style={{ fontFamily:'var(--font-mono)', color:'var(--accent-1)', fontSize:16 }}>{'>'}</span>
                   : <JellyFish size={28} />}
          <h2 style={{ fontFamily:'var(--font-hud)', fontSize:19, color:'var(--text-primary)' }}>
            {isCyber ? 'LIVE_RAFFLES.SYS' : 'Live Raffles'}
          </h2>
          <span style={{ background:'var(--accent-1)', borderRadius:999, padding:'3px 12px',
            fontSize:10, fontWeight:900, color: isCyber?'#000':'#fff', boxShadow:'0 0 12px var(--btn-glow)' }}>
            🔴 LIVE
          </span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {raffles.map((r, idx) => {
            const pct = Math.round((r.sold / r.max) * 100)
            const myC = tickets[r.id] || 0
            const full = r.sold >= r.max
            return (
              <Glass key={r.id} className="fup" style={{ padding:'20px 22px', position:'relative',
                overflow:'hidden', animationDelay:`${idx*0.1}s` }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
                  background:'linear-gradient(90deg,var(--accent-1),var(--accent-2),var(--accent-3))' }} />
                {r.hot && (
                  <div style={{ position:'absolute', top:14, right:14 }}>
                    <Badge label={isCyber?'HOT_ITEM':'🔥 Hot'} color="var(--accent-1)" />
                  </div>
                )}
                <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:14 }}>
                  <div style={{ width:50, height:50, borderRadius:isCyber?6:18,
                    background:'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
                    boxShadow:'0 6px 20px var(--btn-glow)', flexShrink:0 }}>{r.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <h3 style={{ fontFamily:'var(--font-hud)', fontSize:15, color:'var(--text-primary)', marginBottom:2 }}>
                        {isCyber ? r.name.toUpperCase().replace(' ', '_') : r.name}
                      </h3>
                      <div style={{ background:'linear-gradient(135deg,var(--accent-1),var(--accent-2))',
                        borderRadius:isCyber?4:12, padding:'5px 14px', color:isCyber?'#000':'#fff',
                        fontSize:12, fontWeight:900, fontFamily:'var(--font-mono)',
                        boxShadow:'0 0 14px var(--btn-glow)' }}>{r.prize}</div>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
                      ⏰ {isCyber ? 'TTL: ' : ''}{r.ends}
                    </span>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                      {isCyber ? 'TICKET.SOLD' : 'Tickets Sold'}
                    </span>
                    <span style={{ fontSize:11, fontWeight:900, color:'var(--accent-1)', fontFamily:'var(--font-mono)' }}>
                      {r.sold}/{r.max} ({pct}%)
                    </span>
                  </div>
                  <ProgBar pct={pct} cssVar="--fuel-bar" />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <JBtn grad={full?'rgba(150,150,160,0.25)':'linear-gradient(135deg,var(--accent-1),var(--accent-2))'}
                      onClick={() => buy(r)} disabled={buyId===r.id||full}
                      icon={buyId===r.id?'⏳':full?'🔒':'🎟️'} size="sm">
                      {buyId===r.id?(isCyber?'TX_PENDING':'Buying…'):full?(isCyber?'SOLD_OUT':'Sold Out'):`${r.price} $BGS`}
                    </JBtn>
                    <JBtn grad="linear-gradient(135deg,var(--accent-2),var(--accent-3))"
                      onClick={() => reveal(r.id)} disabled={revId===r.id}
                      icon={revId===r.id?'⏳':'🏆'} size="sm">
                      {revId===r.id?(isCyber?'DRAWING':'Drawing…'):(isCyber?'REVEAL.WIN':'Reveal Winner')}
                    </JBtn>
                  </div>
                  {myC > 0 && (
                    <span style={{ fontSize:12, fontWeight:900, color:'var(--accent-1)',
                      background:'rgba(255,255,255,0.08)', borderRadius:99, padding:'4px 12px',
                      border:'1px solid var(--game-border)', fontFamily:'var(--font-mono)' }}>
                      🎟️ YOU: {myC}
                    </span>
                  )}
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
   INVENTORY VIEW — NFT toggle for game boost
═══════════════════════════════════════════════════════════════ */
const InvView = ({ theme, connected, addToast, ownedNFTs, setOwnedNFTs }) => {
  const isCyber = theme === 'theme-cyber'
  const [nfts, setNfts] = useState(ALL_NFTS)
  const RARITY_ORDER = { Legendary:0, Epic:1, Rare:2, Uncommon:3 }
  const sorted = [...nfts].sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity])

  const toggleEquip = (nft) => {
    const newNfts = nfts.map(n => n.id === nft.id ? { ...n, equipped: !n.equipped } : n)
    setNfts(newNfts)
    const equipped = newNfts.filter(n => n.equipped && n.owned)
    setOwnedNFTs(equipped)
    addToast(
      nft.equipped
        ? `${nft.name} unequipped from Jelly Shooter`
        : `${nft.name} equipped! Boost active in Jelly Shooter 🚀`,
      nft.equipped ? 'error' : 'success'
    )
  }

  const activeBoost = computeActiveBoost(nfts.filter(n => n.equipped && n.owned))
  const ownedCount  = nfts.filter(n => n.owned).length
  const equippedCount = nfts.filter(n => n.equipped && n.owned).length

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Header */}
      <Glass className="fup" style={{ padding:'20px 26px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--text-primary)', marginBottom:4 }}>
              {isCyber ? 'ASSET_VAULT.SYS' : '🎁 My Motocats'}
            </h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
              {isCyber ? '> Equip NFTs to activate Shooter boost stats' : 'Equip NFTs to boost your Jelly Shooter stats! 🚀'}
            </p>
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em',
                color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>OWNED</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:24, color:'var(--text-primary)' }}>{ownedCount}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em',
                color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>EQUIPPED</div>
              <div style={{ fontFamily:'var(--font-hud)', fontSize:24, color:'var(--accent-4)' }}>{equippedCount}</div>
            </div>
          </div>
        </div>
      </Glass>

      {/* Active boost summary */}
      {activeBoost && (
        <Glass className="fup" style={{ padding:'16px 22px',
          border:`1.5px solid ${activeBoost.color}66`,
          boxShadow:`0 0 24px ${activeBoost.color}33, var(--card-shadow)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:28 }}>{activeBoost.icon}</span>
              <div>
                <div style={{ fontFamily:'var(--font-mono)', fontWeight:900, fontSize:13, color:activeBoost.color }}>
                  {isCyber ? `> ${activeBoost.label}` : activeBoost.label} ACTIVE
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                  {equippedCount} NFT{equippedCount>1?'s':''} equipped — stacked bonuses apply
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[
                { l:'Sugar', v:`×${activeBoost.sugarRate.toFixed(2)}` },
                { l:'Pressure', v:`×${activeBoost.pressureRate.toFixed(2)}` },
                { l:'Score', v:`×${activeBoost.scoreMulti.toFixed(2)}` },
                { l:'Shake', v:`+${Math.round(activeBoost.shakeBonus)}` },
              ].map(s => (
                <div key={s.l} style={{ textAlign:'center', background:`${activeBoost.color}14`,
                  border:`1px solid ${activeBoost.color}33`, borderRadius:10, padding:'6px 12px' }}>
                  <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.06em',
                    color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{s.l}</div>
                  <div style={{ fontFamily:'var(--font-hud)', fontSize:16, color:activeBoost.color }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Glass>
      )}

      {!connected ? (
        <Glass className="fup" style={{ padding:52, textAlign:'center' }}>
          {isCyber
            ? <CyberBot size={80} style={{ margin:'0 auto 16px', display:'block', animation:'floatIdle 3s ease-in-out infinite' }} />
            : <JellyFish size={80} className="float-idle" style={{ margin:'0 auto 16px', display:'block' }} />}
          <h3 style={{ fontFamily:'var(--font-hud)', fontSize:20, color:'var(--text-primary)', marginBottom:8 }}>
            {isCyber ? 'CONNECT_WALLET_REQUIRED' : 'Connect Wallet to View'}
          </h3>
          <p style={{ fontSize:13, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
            {isCyber ? '> Wallet auth required to access asset vault' : 'Your won Motocat NFTs will appear here'}
          </p>
        </Glass>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
          {sorted.map((nft, i) => {
            const boostDef = NFT_BOOSTS[nft.rarity]
            return (
              <div key={nft.id}
                className={`glass fup ${nft.glow}`}
                style={{
                  padding:18, overflow:'hidden', position:'relative',
                  animationDelay:`${i*0.08}s`,
                  border: nft.equipped
                    ? `2.5px solid ${nft.rc}`
                    : `1.5px solid ${nft.rc}44`,
                  borderRadius:'var(--card-radius)',
                  opacity: nft.owned ? 1 : 0.45,
                  transition:'transform 0.4s cubic-bezier(0.68,-0.55,0.265,1.55), opacity 0.3s',
                  boxShadow: nft.equipped ? `0 0 24px ${nft.rc}55, var(--card-shadow)` : undefined,
                }}
                onMouseEnter={e => { if(nft.owned) e.currentTarget.style.transform='translateY(-7px) scale(1.03)' }}
                onMouseLeave={e => e.currentTarget.style.transform='none'}
              >
                {/* Stripe */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4,
                  background:`linear-gradient(90deg,${nft.rc},${nft.rc}88)`,
                  borderRadius:'24px 24px 0 0' }} />

                {/* Equipped badge */}
                {nft.equipped && (
                  <div style={{ position:'absolute', top:12, right:12,
                    background:`linear-gradient(135deg,${nft.rc},${nft.rc}aa)`,
                    borderRadius:999, padding:'3px 10px', fontSize:9, fontWeight:900, color:'#fff',
                    fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'.06em' }}>
                    {isCyber ? 'EQUIPPED' : '⚡ Equipped'}
                  </div>
                )}

                {/* NFT art */}
                <div style={{ width:'100%', aspectRatio:'1', borderRadius:18,
                  background:`linear-gradient(135deg,${nft.rc}44,${nft.rc}aa)`,
                  border:`1.5px solid ${nft.rc}66`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:52, marginBottom:14, boxShadow:`0 8px 28px ${nft.rc}44` }}>
                  {nft.emoji}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <h4 style={{ fontFamily:'var(--font-hud)', fontSize:13, color:'var(--text-primary)', marginBottom:3 }}>
                      {nft.name}
                    </h4>
                    <p style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>
                      {nft.trait}
                    </p>
                  </div>
                  <Badge label={nft.rarity} color={nft.rc} />
                </div>

                {/* Boost stats preview */}
                {nft.owned && (
                  <div style={{ marginBottom:10, padding:'8px 10px', borderRadius:10,
                    background:`${nft.rc}10`, border:`1px solid ${nft.rc}22` }}>
                    <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.06em',
                      color:nft.rc, fontFamily:'var(--font-mono)', marginBottom:5 }}>
                      {isCyber ? 'BOOST_STATS' : '⚡ Boost Stats'}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
                      {[
                        { k:'Sugar', v:`×${boostDef.sugarRate}` },
                        { k:'Score', v:`×${boostDef.scoreMulti}` },
                      ].map(s => (
                        <div key={s.k} style={{ fontSize:10, fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-mono)' }}>
                          <span style={{ color:'var(--text-muted)' }}>{s.k}: </span>{s.v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:'flex', gap:7 }}>
                  {nft.owned ? (
                    <JBtn
                      grad={nft.equipped
                        ? 'linear-gradient(135deg,rgba(200,180,220,0.2),rgba(200,180,220,0.05))'
                        : `linear-gradient(135deg,${nft.rc},${nft.rc}bb)`}
                      onClick={() => toggleEquip(nft)} size="xs"
                      sx={nft.equipped ? { color:'var(--text-primary)' } : {}}>
                      {nft.equipped ? (isCyber?'UNEQUIP':'Unequip') : (isCyber?'EQUIP':'⚡ Equip')}
                    </JBtn>
                  ) : (
                    <JBtn grad="rgba(150,150,160,0.15)" size="xs" disabled
                      sx={{ color:'var(--text-muted)', fontSize:10 }}>
                      {isCyber ? 'WIN_TO_UNLOCK' : 'Win in Raffle'}
                    </JBtn>
                  )}
                  {nft.owned && (
                    <JBtn grad="rgba(200,180,220,0.15)" onClick={() => addToast(`Listed ${nft.name}! 🏷️`, 'success')} size="xs"
                      sx={{ color:'var(--text-primary)', boxShadow:'0 4px 12px rgba(0,0,0,0.08),inset 0 2px 0 rgba(255,255,255,0.3)' }}>
                      {isCyber ? 'LIST' : 'List'}
                    </JBtn>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Help tip */}
      <Glass className="fup" style={{ padding:'14px 20px' }}>
        <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)', textAlign:'center' }}>
          {isCyber
            ? '> Tip: Stack multiple NFTs for additive bonus | Legendary > Epic > Rare > Uncommon'
            : '💡 Equip multiple NFTs for stacked bonuses! Higher rarity = bigger boost in Jelly Shooter'}
        </p>
      </Glass>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme,    setTheme]    = useState(getSavedTheme)
  const [tab,      setTab]      = useState('dashboard')
  const [conn,     setConn]     = useState(false)
  const [wallet,   setWallet]   = useState('')
  const [balance,  setBalance]  = useState(0)
  const [tickets,  setTickets]  = useState({})
  const [toasts,   setToasts]   = useState([])
  const [tmOpen,   setTmOpen]   = useState(false)
  const [mMenu,    setMMenu]    = useState(false)
  const [ownedNFTs, setOwnedNFTs] = useState([])   // NFTs equipped for boost

  const isCyber = theme === 'theme-cyber'

  // Apply saved theme on mount + whenever theme changes
  useEffect(() => { applyThemeToDOM(theme) }, [theme])
  useEffect(() => { applyThemeToDOM(getSavedTheme()) }, [])

  // Compute active boost from equipped NFTs
  const activeBoost = computeActiveBoost(ownedNFTs)

  const addToast = useCallback((msg, type='success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, message:msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800)
  }, [])

  const connect = async () => {
    addToast(isCyber ? '> INIT OPWallet connection...' : 'Opening OPWallet…', 'pending')
    await new Promise(r => setTimeout(r, 1200))
    setWallet('bc1p...x7j4'); setBalance(1250); setConn(true)
    addToast(isCyber ? '> AUTH_SUCCESS: OPWallet connected' : 'OPWallet connected! 🎉', 'success')
  }
  const disconnect = () => {
    setConn(false); setWallet(''); setBalance(0); setTickets({})
    addToast(isCyber ? '> SESSION_TERMINATED' : 'Wallet disconnected', 'error')
  }

  const changeTheme = (mode) => { handleThemeChange(mode, setTheme); setTmOpen(false) }

  return (
    <>
      <div className="app-root">
        <PageBg />
        <Toaster toasts={toasts} />

        {/* Mobile drawer */}
        {mMenu && (
          <div style={{ position:'fixed', inset:0, zIndex:80 }}>
            <div onClick={() => setMMenu(false)} style={{ position:'absolute', inset:0,
              background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)' }} />
            <div className="glass" style={{ position:'absolute', top:0, left:0, right:0, zIndex:1,
              padding:'20px 20px 28px', background:'var(--header-bg)',
              borderBottom:'1px solid var(--header-border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontFamily:'var(--font-hud)', fontSize:18, color:'var(--text-accent)' }}>
                  {isCyber ? '🤖 JELLY_SHOT.SYS' : '🍬 Jelly Shot'}
                </span>
                <button onClick={() => setMMenu(false)} style={{ background:'none', border:'none',
                  fontSize:22, cursor:'pointer', color:'var(--text-primary)' }}>✕</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setMMenu(false) }} style={{
                    background: tab===t.id ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))' : 'var(--nav-inactive)',
                    border:`1.5px solid ${tab===t.id?'transparent':'var(--nav-border)'}`,
                    borderRadius:14, padding:'12px 18px', display:'flex', alignItems:'center', gap:10,
                    cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:900, fontSize:14,
                    color: tab===t.id?(isCyber?'#000':'#fff'):'var(--text-primary)',
                  }}>
                    <span style={{ fontSize:20 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>

          {/* HEADER */}
          <header style={{
            position:'sticky', top:0, zIndex:40,
            background:'var(--header-bg)', backdropFilter:'blur(24px)',
            borderBottom:'1px solid var(--header-border)',
            padding:'10px 20px', display:'flex', alignItems:'center', gap:12,
          }}>
            <button onClick={() => setMMenu(true)} className="mob-burger" style={{
              display:'none', background:'none', border:'none', fontSize:22,
              cursor:'pointer', color:'var(--text-primary)', flexShrink:0,
            }}>☰</button>

            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginRight:6 }}>
              {isCyber ? <CyberBot size={28} style={{ animation:'floatIdle 3s ease-in-out infinite' }} />
                       : <JellyFish size={28} className="float-idle" />}
              <span style={{ fontFamily:'var(--font-hud)', fontSize:16, color:'var(--text-accent)', lineHeight:1 }}>
                {isCyber ? 'JELLY_SHOT' : 'Jelly Shot'}
              </span>
            </div>

            {/* Nav — desktop */}
            <nav className="desk-nav" style={{ display:'flex', gap:6, flex:1, justifyContent:'center' }}>
              {TABS.map(t => {
                const active = tab === t.id
                return (
                  <button key={t.id} className="nav-pill" onClick={() => setTab(t.id)} style={{
                    background: active ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))' : 'var(--nav-inactive)',
                    border:`1.5px solid ${active?'transparent':'var(--nav-border)'}`,
                    borderRadius:999, padding:'8px 18px',
                    fontFamily:'var(--font-body)', fontWeight:900, fontSize:13,
                    color: active?(isCyber?'#000':'#fff'):'var(--text-primary)',
                    boxShadow: active ? `0 6px 20px rgba(0,0,0,0.14),inset 0 2px 0 rgba(255,255,255,0.25),0 0 14px var(--btn-glow)` : 'none',
                    display:'flex', alignItems:'center', gap:7,
                  }}>
                    <span style={{ fontSize:16 }}>{t.icon}</span>
                    {isCyber ? t.label.toUpperCase().replace(' ', '_') : t.label}
                    {active && <span style={{ width:5, height:5, borderRadius:'50%', background:isCyber?'#000':'rgba(255,255,255,0.8)' }} />}
                  </button>
                )
              })}
            </nav>

            {/* Right controls */}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, marginLeft:'auto' }}>

              {/* Active boost badge */}
              {activeBoost && (
                <div style={{ display:'flex', alignItems:'center', gap:5,
                  background:`${activeBoost.color}18`, border:`1.5px solid ${activeBoost.color}44`,
                  borderRadius:999, padding:'5px 12px',
                  boxShadow:`0 0 12px ${activeBoost.color}33` }} className="ticker-w">
                  <span style={{ fontSize:14 }}>{activeBoost.icon}</span>
                  <span style={{ fontSize:10, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>
                    ×{activeBoost.scoreMulti.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Ticker */}
              <div className="ticker-w" style={{ overflow:'hidden', maxWidth:160, fontSize:10,
                fontWeight:700, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                <div className="ticker">
                  {isCyber
                    ? '> bc1p...3x9 +5000 $BGS | 340 TX | OP_NET_LIVE'
                    : '🎉 bc1p...3x9 won 5,000 $BGS · 340 tickets · OP_NET'}
                </div>
              </div>

              {/* 3-Mode Switcher */}
              <div style={{ position:'relative' }}>
                <JBtn
                  grad={theme==='theme-jelly'?'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                      :theme==='theme-light'?'linear-gradient(135deg,var(--accent-3),var(--accent-2))'
                      :'linear-gradient(135deg,var(--accent-1),var(--accent-2))'}
                  onClick={() => setTmOpen(o => !o)} size="sm"
                  icon={theme==='theme-jelly'?'🍬':theme==='theme-light'?'☀️':'🤖'}
                  sx={{ color: isCyber?'#000':'#fff' }}>
                  {THEME_OPTS.find(o => o.id===theme)?.label}
                </JBtn>
                {tmOpen && (
                  <div className="glass" style={{ position:'absolute', top:'calc(100% + 10px)', right:0, zIndex:200,
                    padding:8, minWidth:185, boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'.1em',
                      color:'var(--text-muted)', fontFamily:'var(--font-mono)', padding:'4px 8px 8px' }}>
                      {isCyber ? '> SELECT_THEME' : 'Mode'}
                    </div>
                    {THEME_OPTS.map(o => (
                      /* switchTheme logic per spec */
                      <button key={o.id} onClick={() => changeTheme(o.id)} className="jbtn" style={{
                        display:'flex', alignItems:'center', gap:10, width:'100%',
                        padding:'10px 12px', borderRadius:12, marginBottom:4,
                        background: theme===o.id
                          ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                          : 'rgba(255,255,255,0.06)',
                        color: (theme===o.id&&isCyber)?'#000':'var(--text-primary)',
                        fontFamily:'var(--font-body)', fontWeight:800, fontSize:13,
                      }}>
                        <span style={{ fontSize:18 }}>{o.icon}</span>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontWeight:900, fontSize:12 }}>{o.label}</div>
                          <div style={{ fontSize:10, opacity:0.6, fontFamily:'var(--font-mono)' }}>{o.desc}</div>
                        </div>
                        {theme===o.id && <span style={{ marginLeft:'auto', fontSize:14 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Connect Wallet */}
              {conn ? (
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div className="glass" style={{ borderRadius:999, padding:'6px 14px',
                    fontSize:11, fontWeight:900, color:'var(--text-primary)', fontFamily:'var(--font-mono)' }}>
                    {wallet}&nbsp;<span style={{ color:'var(--accent-1)' }}>{balance.toLocaleString()} $BGS</span>
                  </div>
                  <JBtn grad="linear-gradient(135deg,#f87171,#ef4444)" onClick={disconnect} size="xs">✕</JBtn>
                </div>
              ) : (
                <JBtn onClick={connect} icon="🔗" size="sm"
                  sx={{ boxShadow:'var(--btn-shadow),0 0 18px var(--btn-glow)' }}>
                  {isCyber ? 'CONNECT_WALLET' : 'Connect OPWallet'}
                </JBtn>
              )}
            </div>
          </header>

          {/* MAIN */}
          <main style={{ flex:1, padding:'24px 20px 60px', maxWidth:960, width:'100%', margin:'0 auto' }}>
            {tab==='dashboard'    && <DashView theme={theme} connected={conn} balance={balance}
              tickets={tickets} setTickets={setTickets} setBalance={setBalance}
              addToast={addToast} activeBoost={activeBoost} />}
            {tab==='jellyShooter' && <JellyShooterView theme={theme} activeBoost={activeBoost} />}
            {tab==='inventory'    && <InvView theme={theme} connected={conn} addToast={addToast}
              ownedNFTs={ownedNFTs} setOwnedNFTs={setOwnedNFTs} />}
          </main>

          <footer style={{ textAlign:'center', padding:'14px 20px',
            borderTop:'1px solid var(--header-border)',
            fontSize:11, fontWeight:700, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
            {isCyber
              ? '> JELLY_SHOT_RAFFLE.v3 | OP_NET | $BGS_TOKEN | GitHub_Pages'
              : '🍬 Jelly Shot Raffle v3 · Powered by OP_NET · $BGS Token'}
          </footer>
        </div>

        {tmOpen && <div onClick={() => setTmOpen(false)} style={{ position:'fixed', inset:0, zIndex:100 }} />}
      </div>
    </>
  )
