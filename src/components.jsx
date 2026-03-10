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

/* ═══════════════════════════════════════════════════════════════
   2. BOOST LOGIC & DATA (THE CORE)
═══════════════════════════════════════════════════════════════ */
export const NFT_BOOSTS = {
  Legendary: { sugarRate: 2.5, scoreMulti: 2.0, shakeBonus: 20, label: 'LEGENDARY BOOST', color: '#f59e0b', icon: '👑', perks: ['2.5× Sugar Rate', '2.0× Score', '+20 Shake Bonus'] },
  Epic:      { sugarRate: 1.8, scoreMulti: 1.5, shakeBonus: 16, label: 'EPIC BOOST',      color: '#8b5cf6', icon: '💜', perks: ['1.8× Sugar Rate', '1.5× Score', '+16 Shake Bonus'] },
  Rare:      { sugarRate: 1.4, scoreMulti: 1.25,shakeBonus: 14, label: 'RARE BOOST',      color: '#0ea5e9', icon: '🔵', perks: ['1.4× Sugar Rate', '1.25× Score', '+14 Shake Bonus'] },
  Uncommon:  { sugarRate: 1.15,scoreMulti: 1.1, shakeBonus: 12, label: 'UNCOMMON BOOST',  color: '#ec4899', icon: '🩷', perks: ['1.15× Sugar Rate', '1.1× Score', 'Base Shake'] },
}

export function computeActiveBoost(ownedNFTs) {
  const safeOwned = Array.isArray(ownedNFTs) ? ownedNFTs : []
  if (safeOwned.length === 0) return null
  const order = ['Legendary', 'Epic', 'Rare', 'Uncommon']
  const top = order.find(r => safeOwned.some(n => n.rarity === r)) || 'Uncommon'
  const base = NFT_BOOSTS[top] || NFT_BOOSTS['Uncommon']
  const merged = { sugarRate: 0, scoreMulti: 0, shakeBonus: 0 }
  safeOwned.forEach(n => {
    const b = NFT_BOOSTS[n.rarity] || NFT_BOOSTS['Uncommon']
    const isTop = n.rarity === top
    merged.sugarRate += b.sugarRate * (isTop ? 1 : 0.1)
    merged.scoreMulti += b.scoreMulti * (isTop ? 1 : 0.1)
    merged.shakeBonus += b.shakeBonus * (isTop ? 1 : 0.1)
  })
  return { ...merged, label: base.label, color: base.color, icon: base.icon, count: safeOwned.length, top }
}

export const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', trait:'Gold Helmet',  rc:'#f59e0b', glow:'glow-legendary', owned:true,  equipped:false },
  { id:2, name:'Motocat #0117', rarity:'Epic',      emoji:'😺', trait:'Neon Wings',   rc:'#8b5cf6', glow:'glow-epic',      owned:true,  equipped:false },
  { id:3, name:'Motocat #0289', rarity:'Rare',      emoji:'🐈', trait:'Cyber Visor',  rc:'#0ea5e9', glow:'glow-rare',      owned:false, equipped:false },
  { id:4, name:'Motocat #0401', rarity:'Uncommon',  emoji:'🙀', trait:'Pink Bandana', rc:'#ec4899', glow:'',               owned:false, equipped:false },
]
export const TABS = [{ id:'dashboard', label:'Dashboard', icon:'🏠' }, { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' }, { id:'inventory', label:'Inventory', icon:'🎁' }]
export const THEME_OPTS = [{ id:'theme-jelly', icon:'🍬', label:'Jelly', desc:'Pastel Candy' }, { id:'theme-light', icon:'☀️', label:'Light', desc:'Minimalist' }, { id:'theme-cyber', icon:'🤖', label:'Cyber', desc:'Neon Hacker' }]

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
   4. VIEWS
═══════════════════════════════════════════════════════════════ */
export const DashView = ({ balance, connected, activeBoost, theme }) => (
  <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:20 }}>
    <Glass style={{ padding:30 }}>
      <h2 style={{ fontFamily:'var(--font-hud)' }}>{theme==='theme-cyber'?'DASHBOARD.EXE':'Dashboard'}</h2>
      <div style={{ fontSize:32, fontWeight:900, color:'var(--accent-1)' }}>{balance.toLocaleString()} $BGS</div>
      <p style={{ fontSize:12, opacity:0.7 }}>{connected ? '● Wallet Linked' : '○ Connect Wallet'}</p>
    </Glass>
    {activeBoost && <BoostPanel boost={activeBoost} isCyber={theme==='theme-cyber'} />}
  </div>
)

export const JellyShooterView = ({ theme, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  const sugarRate    = activeBoost ? Math.min(activeBoost.sugarRate, 4) : 1
  const scoreMulti   = activeBoost ? activeBoost.scoreMulti : 1
  const shakeBonus   = activeBoost ? activeBoost.shakeBonus : 12

  const [phase, setPhase] = useState('idle')
  const [sugar, setSugar] = useState(0)
  const [score, setScore] = useState(0)
  const [jellyPos, setJellyPos] = useState(0)
  
  const launchRef = useRef(null)

  const stopCharge = () => {
    if (phase !== 'charging') return
    setPhase('flying')
    let pos = 0
    const target = sugar * 3.5 // Semakin penuh gula, semakin tinggi terbangnya
    
    launchRef.current = setInterval(() => {
      pos += 12
      setJellyPos(pos)
      if (pos >= target) {
        clearInterval(launchRef.current)
        setScore(Math.round(sugar * scoreMulti))
        setPhase('landed')
        setTimeout(() => {
          setPhase('idle')
          setJellyPos(0)
          setSugar(0)
        }, 3000)
      }
    }, 16)
  }

  const startCharge = () => {
    if (phase !== 'idle') return
    setPhase('charging')
  }

  useEffect(() => {
    let timer;
    if (phase === 'charging') {
      timer = setInterval(() => {
        setSugar(s => Math.min(s + (1.5 * sugarRate), 100))
      }, 50)
    }
    return () => clearInterval(timer)
  }, [phase, sugarRate])

  return (
    <div className="panel-enter">
      <Glass style={{ padding:40, textAlign:'center', minHeight:450, position:'relative', overflow:'hidden' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontFamily:'var(--font-hud)', fontSize:18, color:'var(--accent-1)', marginBottom:10 }}>
            {phase === 'landed' ? `LAST SCORE: ${score}` : isCyber ? 'READY_TO_LAUNCH' : 'Jelly Power'}
          </div>
          <ProgBar pct={sugar} />
        </div>

        <div style={{ position:'relative', height:220, display:'flex', alignItems:'flex-end', justifyContent:'center', marginBottom:30 }}>
           <div style={{ 
             position:'absolute', 
             bottom: jellyPos, 
             transition: phase==='flying' ? 'none' : 'bottom 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
           }}>
              {isCyber ? <CyberBot size={85} /> : <JellyFish size={85} className={phase==='charging'?'float-idle':''} />}
           </div>
        </div>

        <button 
          className="jbtn"
          onMouseDown={startCharge}
          onMouseUp={stopCharge}
          onTouchStart={e => { e.preventDefault(); startCharge(); }}
          onTouchEnd={e => { e.preventDefault(); stopCharge(); }}
          style={{ width:'100%', maxWidth:280, padding:20, fontSize:18, fontFamily:'var(--font-hud)' }}
        >
          {phase === 'charging' ? (isCyber ? 'CHARGING...' : 'MENGISI GULA...') : 
           phase === 'flying' ? (isCyber ? 'IN_FLIGHT' : 'MELUNCUR!') : 
           (isCyber ? 'HOLD_TO_START' : 'TAHAN UNTUK ISI')}
        </button>
        
        {phase === 'landed' && (
          <div className="fup" style={{ marginTop:15, fontFamily:'var(--font-hud)', color:'var(--accent-4)', fontSize:20 }}>
            +{score} PTS
          </div>
        )}
      </Glass>
    </div>
  )
}

export const InvView = ({ theme, connected, nfts = [], setNfts, setOwnedNFTs, addToast }) => {
  const isCyber = theme === 'theme-cyber'
  const safeNfts = Array.isArray(nfts) ? nfts : []
  const equipped = safeNfts.filter(n => n.equipped && n.owned)
  const activeBoost = computeActiveBoost(equipped)

  const toggleEquip = (nft) => {
    const newNfts = safeNfts.map(n => n.id === nft.id ? { ...n, equipped: !n.equipped } : n)
    setNfts(newNfts)
    setOwnedNFTs(newNfts.filter(n => n.equipped && n.owned))
    addToast(`${nft.name} Updated!`, 'success')
  }

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <Glass style={{ padding:'20px 26px' }}>
        <h2 style={{ fontFamily:'var(--font-hud)', fontSize:22 }}>{isCyber ? 'VAULT.SYS' : '🎁 My Motocats'}</h2>
      </Glass>
      {activeBoost && <BoostPanel boost={activeBoost} isCyber={isCyber} />}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
        {safeNfts.map((nft, i) => (
          <Glass key={nft.id} style={{ padding:18, border:nft.equipped?`2px solid ${nft.rc}`:`1.5px solid ${nft.rc}44`, position:'relative' }}>
            <div style={{ width:'100%', aspectRatio:'1', background:`${nft.rc}22`, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, marginBottom:14 }}>{nft.emoji}</div>
            <div style={{ fontWeight:800, textAlign:'center', marginBottom:10 }}>{nft.name}</div>
            <JBtn onClick={() => toggleEquip(nft)} sx={{ width:'100%' }}>{nft.equipped?'UNEQUIP':'EQUIP'}</JBtn>
          </Glass>
        ))}
      </div>
    </div>
  )
}