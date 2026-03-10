import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   THEME LOGIC
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
  if (setTheme) setTheme(mode)
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
   UI COMPONENTS (Fixing the "Missing Export" error)
═══════════════════════════════════════════════════════════════ */
export const Toaster = ({ toasts = [] }) => (
  <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
    {toasts.map(t => (
      <div key={t.id} className="glass" style={{ pointerEvents:'auto', padding:'12px 18px', borderRadius:20, background: t.type==='success'?'var(--toast-ok)':'var(--toast-err)', color:'#fff', fontWeight:800 }}>
        {t.message}
      </div>
    ))}
  </div>
)

export const PageBg = () => (
  <div className="page-bg">
    {[1, 2, 3, 4].map(i => <div key={i} className="blob" style={{ background: `var(--blob-${i})`, animationDelay: `${(i-1)*-4}s` }} />)}
  </div>
)

export const Glass = ({ children, style = {}, className = '' }) => (<div className={`glass ${className}`} style={style}>{children}</div>)

export const JBtn = ({ children, grad, onClick, disabled, size='md', icon, sx={} }) => (
  <button className="jbtn" onClick={onClick} disabled={disabled} style={{ background: grad || 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', ...sx }}>{icon && icon} {children}</button>
)

export const ProgBar = ({ pct, cssVar='--fuel-bar' }) => (
  <div style={{ background:'var(--prog-bg)', borderRadius:999, height:9, overflow:'hidden' }}><div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:`var(${cssVar})` }} /></div>
)

export const Badge = ({ label, color }) => (<span style={{ background:`${color}22`, border:`1px solid ${color}66`, color, fontSize:10, padding:'3px 10px', borderRadius:999 }}>{label}</span>)

export const BoostPanel = ({ boost, isCyber }) => {
  if (!boost) return null;
  return <Glass style={{ padding:14, border:`1.5px solid ${boost.color}66` }}>{boost.icon} {boost.label}</Glass>
}

/* ═══════════════════════════════════════════════════════════════
   SVGS
═══════════════════════════════════════════════════════════════ */
export const JellyFish = ({ size = 60 }) => (<svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/3} fill="var(--jelly-body)" /></svg>)
export const CyberBot = ({ size = 60 }) => (<svg width={size} height={size}><rect x={size/4} y={size/4} width={size/2} height={size/2} fill="var(--jelly-body)" /></svg>)
export const JellyCube = ({ size = 48 }) => (<svg width={size} height={size}><rect x={size/4} y={size/4} width={size/2} height={size/2} rx="8" fill="var(--accent-2)" /></svg>)

/* ═══════════════════════════════════════════════════════════════
   VIEWS
═══════════════════════════════════════════════════════════════ */
export const DashView = ({ balance, connected }) => (<Glass style={{ padding:20 }}>Balance: {balance} $BGS</Glass>)
export const JellyShooterView = ({ activeBoost }) => (<Glass style={{ padding:20 }}>Game Engine Ready</Glass>)

export const InvView = ({ theme, connected, addToast, nfts = [], setNfts, setOwnedNFTs }) => {
  const isCyber = theme === 'theme-cyber'
  const safeNfts = Array.isArray(nfts) ? nfts : []
  const equippedNFTs = safeNfts.filter(n => n.equipped && n.owned)
  const activeBoost = computeActiveBoost(equippedNFTs)

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:15 }}>
      <Glass style={{ padding:20 }}><h2>{isCyber ? 'VAULT.SYS' : 'Inventory'}</h2></Glass>
      {activeBoost && <BoostPanel boost={activeBoost} isCyber={isCyber} />}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
        {safeNfts.map(nft => (
          <Glass key={nft.id} style={{ padding:10, opacity: nft.owned ? 1 : 0.5 }}>
            {nft.emoji} {nft.name}
          </Glass>
        ))}
      </div>
    </div>
  )
}

// Data Exports
export const TABS = [{ id:'dashboard', label:'Dashboard', icon:'🏠' }, { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' }, { id:'inventory', label:'Inventory', icon:'🎁' }]
export const THEME_OPTS = [{ id:'theme-jelly', icon:'🍬', label:'Jelly' }, { id:'theme-light', icon:'☀️', label:'Light' }, { id:'theme-cyber', icon:'🤖', label:'Cyber' }]
export const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', rc:'#f59e0b', owned:true },
  { id:2, name:'Motocat #0117', rarity:'Epic', emoji:'😺', rc:'#8b5cf6', owned:true }
]
export const INITIAL_RAFFLES = []