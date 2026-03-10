import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   THEME & UTILITY
═══════════════════════════════════════════════════════════════ */
export function applyThemeToDOM(mode) {
  document.documentElement.classList.remove('theme-jelly', 'theme-light', 'theme-cyber')
  if (mode !== 'theme-jelly') { document.documentElement.classList.add(mode) }
  try { localStorage.setItem('userTheme', mode) } catch (e) {}
}

export function handleThemeChange(mode, setTheme) {
  const valid = ['theme-jelly', 'theme-light', 'theme-cyber']
  if (!valid.includes(mode)) return
  
  console.log("Switching theme to:", mode) // Cek di F12 Console
  applyThemeToDOM(mode)
  
  if (typeof setTheme === 'function') {
    setTheme(mode)
  }
}

export function switchTheme(mode, setTheme) { handleThemeChange(mode, setTheme) }

export function getSavedTheme() {
  try { return localStorage.getItem('userTheme') || 'theme-jelly' } catch (e) { return 'theme-jelly' }
}

/* ═══════════════════════════════════════════════════════════════
   NFT BOOST LOGIC
═══════════════════════════════════════════════════════════════ */
export const NFT_BOOSTS = {
  Legendary: { sugarRate: 2.5, pressureRate: 1.8, scoreMulti: 2.0, shakeBonus: 20, label: 'LEGENDARY BOOST', color: '#f59e0b', icon: '👑', perks: ['2.5× Sugar Rate', '2.0× Score', '+20 Shake Bonus'] },
  Epic: { sugarRate: 1.8, pressureRate: 1.4, scoreMulti: 1.5, shakeBonus: 16, label: 'EPIC BOOST', color: '#8b5cf6', icon: '💜', perks: ['1.8× Sugar Rate', '1.5× Score', '+16 Shake Bonus'] },
  Rare: { sugarRate: 1.4, pressureRate: 1.2, scoreMulti: 1.25, shakeBonus: 14, label: 'RARE BOOST', color: '#0ea5e9', icon: '🔵', perks: ['1.4× Sugar Rate', '1.25× Score', '+14 Shake Bonus'] },
  Uncommon: { sugarRate: 1.15, pressureRate: 1.05, scoreMulti: 1.1, shakeBonus: 12, label: 'UNCOMMON BOOST', color: '#ec4899', icon: '🩷', perks: ['1.15× Sugar Rate', '1.1× Score', 'Base Shake'] },
}

export function computeActiveBoost(ownedNFTs) {
  const safeOwned = Array.isArray(ownedNFTs) ? ownedNFTs : []
  if (safeOwned.length === 0) return null;
  const merged = { sugarRate: 0, pressureRate: 0, scoreMulti: 0, shakeBonus: 0 };
  const order = ['Legendary', 'Epic', 'Rare', 'Uncommon'];
  const top = order.find(r => safeOwned.some(n => n.rarity === r)) || 'Uncommon';
  const base = NFT_BOOSTS[top] || NFT_BOOSTS['Uncommon'];
  
  safeOwned.forEach(n => {
    const b = NFT_BOOSTS[n.rarity] || NFT_BOOSTS['Uncommon'];
    const isTop = n.rarity === top;
    merged.sugarRate    += b.sugarRate * (isTop ? 1 : 0.1);
    merged.pressureRate += b.pressureRate * (isTop ? 1 : 0.1);
    merged.scoreMulti   += b.scoreMulti * (isTop ? 1 : 0.1);
    merged.shakeBonus   += b.shakeBonus * (isTop ? 1 : 0.1);
  });
  
  return { ...merged, label: base.label, color: base.color, icon: base.icon, count: safeOwned.length, top };
}

/* ═══════════════════════════════════════════════════════════════
   SVGS & UI ATOMS
═══════════════════════════════════════════════════════════════ */
export const JellyFish = ({ size = 60, className = '' }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 60 84" className={className}>
    <ellipse cx="30" cy="28" rx="26" ry="22" fill="var(--jelly-body)" fillOpacity="0.8" />
    <path d="M20 50 Q15 65 20 75 M30 50 Q30 70 30 80 M40 50 Q45 65 40 75" stroke="var(--jelly-body)" strokeWidth="3" fill="none" />
  </svg>
)

export const CyberBot = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <rect x="10" y="10" width="40" height="40" rx="4" fill="var(--jelly-body)" fillOpacity="0.3" stroke="var(--jelly-body)" strokeWidth="2" />
    <rect x="18" y="22" width="8" height="4" fill="var(--jelly-body)" />
    <rect x="34" y="22" width="8" height="4" fill="var(--jelly-body)" />
  </svg>
)

export const JellyCube = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <rect x="10" y="10" width="40" height="40" rx="12" fill="var(--accent-2)" fillOpacity="0.6" />
  </svg>
)

export const Glass = ({ children, style = {}, className = '' }) => (<div className={`glass ${className}`} style={style}>{children}</div>)
export const JBtn = ({ children, grad, onClick, disabled, size='md', icon, sx={} }) => (
  <button className="jbtn" onClick={onClick} disabled={disabled} style={{ background: grad || 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', padding: size==='sm'?'8px 16px':'12px 24px', borderRadius:20, color:'#fff', fontWeight:900, ...sx }}>{icon} {children}</button>
)
export const ProgBar = ({ pct, cssVar='--fuel-bar' }) => (<div style={{ background:'var(--prog-bg)', borderRadius:999, height:10, overflow:'hidden' }}><div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:`var(${cssVar})`, transition:'width 0.2s' }} /></div>)
export const Badge = ({ label, color }) => (<span style={{ background:`${color}22`, border:`1px solid ${color}66`, color, fontSize:10, padding:'3px 10px', borderRadius:999, fontWeight:800 }}>{label}</span>)

export const Toaster = ({ toasts = [] }) => (
  <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
    {toasts.map(t => <div key={t.id} className="glass" style={{ padding:'12px 20px', borderRadius:15, background: t.type==='success'?'#10b981':'#ef4444', color:'#fff' }}>{t.message}</div>)}
  </div>
)

export const PageBg = () => (
  <div className="page-bg">
    {[1, 2, 3, 4].map(i => <div key={i} className="blob" style={{ background: `var(--blob-${i})`, animationDelay: `${(i-1)*-4}s` }} />)}
  </div>
)

export const BoostPanel = ({ boost, isCyber }) => {
  if (!boost) return <Glass style={{ padding:12, opacity:0.5, textAlign:'center', fontSize:11 }}>{isCyber ? '> NO_BOOST' : 'No Boost Active'}</Glass>
  return <Glass style={{ padding:12, border:`1.5px solid ${boost.color}66`, color:boost.color }}>{boost.icon} {boost.label} ×{boost.scoreMulti}</Glass>
}

/* ═══════════════════════════════════════════════════════════════
   VIEWS
═══════════════════════════════════════════════════════════════ */
export const DashView = ({ balance, connected, activeBoost, theme }) => {
  const isCyber = theme === 'theme-cyber'
  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <Glass style={{ padding:30 }}>
        <h1 style={{ fontFamily:'var(--font-hud)' }}>{isCyber ? 'JELLY_DASH.EXE' : 'Jelly Dashboard'}</h1>
        <p>Wallet: {connected ? 'Connected' : 'Disconnected'}</p>
        <div style={{ fontSize:32, fontWeight:900, color:'var(--accent-1)' }}>{balance.toLocaleString()} $BGS</div>
      </Glass>
      {activeBoost && <BoostPanel boost={activeBoost} isCyber={isCyber} />}
    </div>
  )
}

export const JellyShooterView = ({ theme, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  const [sugar, setSugar] = useState(0)
  const [phase, setPhase] = useState('idle')

  return (
    <div className="panel-enter" style={{ textAlign:'center' }}>
      <Glass style={{ padding:40, minHeight:300, position:'relative' }}>
        <div style={{ marginBottom:20 }}>
          {isCyber ? <CyberBot size={80} /> : <JellyFish size={80} className="float-idle" />}
        </div>
        <h3>{isCyber ? 'ENGINE_STATUS: READY' : 'Ready to Shoot!'}</h3>
        <div style={{ width:200, margin:'20px auto' }}>
          <ProgBar pct={sugar} />
        </div>
        <JBtn onClick={() => setSugar(s => s >= 100 ? 0 : s + 20)}>
          {sugar >= 100 ? 'RESET' : 'CHARGE SUGAR'}
        </JBtn>
      </Glass>
    </div>
  )
}

export const InvView = ({ theme, connected, nfts = [], setNfts, setOwnedNFTs, addToast }) => {
  const isCyber = theme === 'theme-cyber'
  const safeNfts = Array.isArray(nfts) ? nfts : []
  
  const toggleEquip = (nft) => {
    const newNfts = safeNfts.map(n => n.id === nft.id ? { ...n, equipped: !n.equipped } : n)
    setNfts(newNfts)
    setOwnedNFTs(newNfts.filter(n => n.equipped && n.owned))
    addToast(`${nft.name} Updated!`, 'success')
  }

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:15 }}>
      <Glass style={{ padding:20 }}><h2>{isCyber ? 'INVENTORY.SYS' : 'Your Inventory'}</h2></Glass>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:15 }}>
        {safeNfts.map(nft => (
          <Glass key={nft.id} style={{ padding:15, border: nft.equipped ? `2px solid ${nft.rc}` : 'none' }}>
            <div style={{ fontSize:40 }}>{nft.emoji}</div>
            <div style={{ fontWeight:800 }}>{nft.name}</div>
            <JBtn size="sm" onClick={() => toggleEquip(nft)} sx={{ marginTop:10 }}>{nft.equipped ? 'Unequip' : 'Equip'}</JBtn>
          </Glass>
        ))}
      </div>
    </div>
  )
}

// DATA EXPORTS
export const TABS = [{ id:'dashboard', label:'Dashboard', icon:'🏠' }, { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' }, { id:'inventory', label:'Inventory', icon:'🎁' }]
export const THEME_OPTS = [{ id:'theme-jelly', label:'Jelly' }, { id:'theme-light', label:'Light' }, { id:'theme-cyber', label:'Cyber' }]
export const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', rc:'#f59e0b', owned:true, equipped:false },
  { id:2, name:'Motocat #0117', rarity:'Epic', emoji:'😺', rc:'#8b5cf6', owned:true, equipped:false }
]
export const INITIAL_RAFFLES = []