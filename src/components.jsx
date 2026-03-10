import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   1. THEME ENGINE: Fixed & Reliable
═══════════════════════════════════════════════════════════════ */
export function applyThemeToDOM(mode) {
  document.documentElement.classList.remove('theme-jelly', 'theme-light', 'theme-cyber')
  if (mode !== 'theme-jelly') { document.documentElement.classList.add(mode) }
  try { localStorage.setItem('userTheme', mode) } catch (e) {}
}

export function handleThemeChange(mode, setTheme) {
  const valid = ['theme-jelly', 'theme-light', 'theme-cyber']
  if (!valid.includes(mode)) return
  console.log("🎨 System: Switching to", mode) 
  applyThemeToDOM(mode)
  if (typeof setTheme === 'function') setTheme(mode)
}

export function switchTheme(mode, setTheme) { handleThemeChange(mode, setTheme) }

export function getSavedTheme() {
  try { return localStorage.getItem('userTheme') || 'theme-jelly' } catch (e) { return 'theme-jelly' }
}

/* ═══════════════════════════════════════════════════════════════
   2. DATA GUDANG: JANGAN KEHAPUS LAGI!
═══════════════════════════════════════════════════════════════ */
export const INITIAL_RAFFLES = [
  { id:1, emoji:'🪼', name:'Jellyfish Genesis', prize:'5,000 $BGS', price:50, sold:73, max:100, ends:'2h 14m', hot:true },
  { id:2, emoji:'🍑', name:'Peach Bomb', prize:'2,500 $BGS + NFT', price:25, sold:41, max:80, ends:'5h 50m', hot:false },
  { id:3, emoji:'🫧', name:'Bubble Surge', prize:'10,000 $BGS', price:100, sold:18, max:50, ends:'23h 00m', hot:true },
]

export const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', trait:'Gold Helmet',  rc:'#f59e0b', glow:'glow-legendary', owned:true,  equipped:false },
  { id:2, name:'Motocat #0117', rarity:'Epic',      emoji:'😺', trait:'Neon Wings',   rc:'#8b5cf6', glow:'glow-epic',      owned:true,  equipped:false },
  { id:3, name:'Motocat #0289', rarity:'Rare',      emoji:'🐈', trait:'Cyber Visor',  rc:'#0ea5e9', glow:'glow-rare',      owned:false, equipped:false },
  { id:4, name:'Motocat #0401', rarity:'Uncommon',  emoji:'🙀', trait:'Pink Bandana', rc:'#ec4899', glow:'',               owned:false, equipped:false },
]

export const TABS = [{ id:'dashboard', label:'Dashboard', icon:'🏠' }, { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' }, { id:'inventory', label:'Inventory', icon:'🎁' }]
export const THEME_OPTS = [{ id:'theme-jelly', icon:'🍬', label:'Jelly', desc:'Pastel Candy' }, { id:'theme-light', icon:'☀️', label:'Light', desc:'Minimalist' }, { id:'theme-cyber', icon:'🤖', label:'Cyber', desc:'Neon Hacker' }]

/* ═══════════════════════════════════════════════════════════════
   3. BOOST LOGIC: Anti-Blank Guard
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

/* ═══════════════════════════════════════════════════════════════
   4. UI ATOMS: Visual Components
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
      <div key={t.id} className="glass tin" style={{ pointerEvents:'auto', padding:'12px 18px', borderRadius:20, background: t.type==='success'?'var(--toast-ok)':'var(--toast-err)', color:'#fff', fontWeight:800 }}>
        {t.message}
      </div>
    ))}
  </div>
)

export const JBtn = ({ children, grad, onClick, disabled, size='md', icon, sx={} }) => (
  <button className="jbtn" onClick={onClick} disabled={disabled} style={{ background: grad || 'linear-gradient(135deg,var(--accent-1),var(--accent-2))', borderRadius:999, color:'#fff', fontWeight:900, padding:'10px 22px', border:'none', ...sx }}>{icon} {children}</button>
)

export const ProgBar = ({ pct, cssVar='--fuel-bar' }) => (
  <div style={{ background:'var(--prog-bg)', borderRadius:999, height:10, overflow:'hidden' }}>
    <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:`var(${cssVar})`, transition:'width 0.2s' }} />
  </div>
)

/* ═══════════════════════════════════════════════════════════════
   5. VIEWS: Dash, Shooter, Inv
═══════════════════════════════════════════════════════════════ */
export const DashView = ({ balance, connected, activeBoost, theme }) => (
  <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:20 }}>
    <Glass style={{ padding:30 }}>
      <h2 style={{ fontFamily:'var(--font-hud)' }}>{theme==='theme-cyber'?'DASHBOARD.EXE':'Dashboard'}</h2>
      <div style={{ fontSize:32, fontWeight:900, color:'var(--accent-1)' }}>{balance.toLocaleString()} $BGS</div>
    </Glass>
  </div>
)

export const JellyShooterView = ({ theme, activeBoost }) => (
  <div className="panel-enter" style={{ textAlign:'center' }}>
    <Glass style={{ padding:40, minHeight:300 }}>
      <h3>{theme==='theme-cyber'?'> ENGINE_READY':'Ready to Shoot!'}</h3>
    </Glass>
  </div>
)

export const InvView = ({ theme, connected, nfts = [], setNfts, setOwnedNFTs, addToast }) => {
  const safeNfts = Array.isArray(nfts) ? nfts : []
  const toggleEquip = (nft) => {
    const newNfts = safeNfts.map(n => n.id === nft.id ? { ...n, equipped: !n.equipped } : n)
    setNfts(newNfts)
    setOwnedNFTs(newNfts.filter(n => n.equipped && n.owned))
    addToast(`${nft.name} Updated!`, 'success')
  }

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:15 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:15 }}>
        {safeNfts.map(nft => (
          <Glass key={nft.id} style={{ padding:15, border: nft.equipped ? `2px solid ${nft.rc}` : 'none' }}>
            <div style={{ fontSize:40, textAlign:'center' }}>{nft.emoji}</div>
            <div style={{ fontWeight:800, textAlign:'center' }}>{nft.name}</div>
            <JBtn size="sm" onClick={() => toggleEquip(nft)} sx={{marginTop:10, width:'100%'}}>{nft.equipped ? 'Unequip' : 'Equip'}</JBtn>
          </Glass>
        ))}
      </div>
    </div>
  )
}