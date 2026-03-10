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
  setTheme(mode)
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
  if (!ownedNFTs || !Array.isArray(ownedNFTs) || ownedNFTs.length === 0) return null;
  const merged = { sugarRate: 0, pressureRate: 0, scoreMulti: 0, shakeBonus: 0 };
  const order = ['Legendary', 'Epic', 'Rare', 'Uncommon'];
  const top = order.find(r => ownedNFTs.some(n => n.rarity === r)) || 'Uncommon';
  const base = NFT_BOOSTS[top] || NFT_BOOSTS['Uncommon'];
  
  ownedNFTs.forEach(n => {
    const b = NFT_BOOSTS[n.rarity] || NFT_BOOSTS['Uncommon'];
    const isTop = n.rarity === top;
    merged.sugarRate    += b.sugarRate * (isTop ? 1 : 0.1);
    merged.pressureRate += b.pressureRate * (isTop ? 1 : 0.1);
    merged.scoreMulti   += b.scoreMulti * (isTop ? 1 : 0.1);
    merged.shakeBonus   += b.shakeBonus * (isTop ? 1 : 0.1);
  });
  
  return { ...merged, label: base.label, color: base.color, icon: base.icon, count: ownedNFTs.length, top };
}

/* ═══════════════════════════════════════════════════════════════
   DATA & CONSTANTS
═══════════════════════════════════════════════════════════════ */
export const INITIAL_RAFFLES = [
  { id:1, emoji:'🪼', name:'Jellyfish Genesis', prize:'5,000 $BGS', price:50, sold:73, max:100, ends:'2h 14m', hot:true },
  { id:2, emoji:'🍑', name:'Peach Bomb', prize:'2,500 $BGS + NFT', price:25, sold:41, max:80, ends:'5h 50m', hot:false },
  { id:3, emoji:'🫧', name:'Bubble Surge', prize:'10,000 $BGS', price:100, sold:18, max:50, ends:'23h 00m', hot:true },
]

export const ALL_NFTS = [
  { id:1, name:'Motocat #0042', rarity:'Legendary', emoji:'🐱', trait:'Gold Helmet', rc:'#f59e0b', glow:'glow-legendary', owned:true },
  { id:2, name:'Motocat #0117', rarity:'Epic', emoji:'😺', trait:'Neon Wings', rc:'#8b5cf6', glow:'glow-epic', owned:true },
  { id:3, name:'Motocat #0289', rarity:'Rare', emoji:'🐈', trait:'Cyber Visor', rc:'#0ea5e9', glow:'glow-rare', owned:false },
  { id:4, name:'Motocat #0401', rarity:'Uncommon', emoji:'🙀', trait:'Pink Bandana', rc:'#ec4899', glow:'', owned:false },
]

export const TABS = [{ id:'dashboard', label:'Dashboard', icon:'🏠' }, { id:'jellyShooter', label:'Jelly Shooter', icon:'🪼' }, { id:'inventory', label:'Inventory', icon:'🎁' }]
export const THEME_OPTS = [{ id:'theme-jelly', icon:'🍬', label:'Jelly', desc:'Pastel Candy' }, { id:'theme-light', icon:'☀️', label:'Light', desc:'Minimalist' }, { id:'theme-cyber', icon:'🤖', label:'Cyber', desc:'Neon Hacker' }]

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS (SVG & SHARED)
═══════════════════════════════════════════════════════════════ */
export const JellyFish = ({ size = 60, className = '', style: sx = {} }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 60 84" className={className} style={{ filter: 'drop-shadow(0 4px 14px var(--jelly-glow))', ...sx }}>
    <defs><radialGradient id="jbg" cx="40%" cy="35%"><stop offset="0%" stopColor="white" stopOpacity="0.7" /><stop offset="45%" stopColor="var(--jelly-body)" stopOpacity="0.95" /><stop offset="100%" stopColor="var(--jelly-body)" stopOpacity="0.65" /></radialGradient></defs>
    <ellipse cx="30" cy="28" rx="26" ry="22" fill="url(#jbg)" />
    {[6,13,20,27,34,41,48,54].map((x, i) => (<path key={i} d={`M${x} 48 Q${x - 2} ${60 + i * 2} ${x} ${67 + i * 2}`} stroke="var(--jelly-body)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75" />))}
  </svg>
)

export const CyberBot = ({ size = 60, style: sx = {} }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 60 78" style={{ filter: 'drop-shadow(0 0 12px var(--jelly-glow))', ...sx }}>
    <rect x="10" y="8" width="40" height="38" rx="4" fill="var(--jelly-body)" fillOpacity="0.4" stroke="var(--jelly-body)" strokeWidth="1.5" />
    <circle cx="22" cy="22" r="3" fill="var(--jelly-body)" /><circle cx="38" cy="22" r="3" fill="var(--jelly-body)" />
    <rect x="20" y="32" width="20" height="2" fill="var(--jelly-body)" />
  </svg>
)

export const JellyCube = ({ size = 48, style: sx = {} }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ filter: 'drop-shadow(0 4px 12px var(--jelly-glow))', ...sx }}>
    <rect x="10" y="10" width="40" height="40" rx="12" fill="var(--accent-2)" fillOpacity="0.7" />
  </svg>
)

export const Glass = ({ children, style = {}, className = '' }) => (<div className={`glass ${className}`} style={style}>{children}</div>)
export const JBtn = ({ children, grad, onClick, disabled, size='md', icon, sx={} }) => {
  const pads = { xl:'16px 36px', lg:'13px 30px', md:'10px 22px', sm:'8px 16px', xs:'5px 12px' }; const fz = { xl:17, lg:15, md:13, sm:12, xs:11 }; const s = size in pads ? size : 'md'
  return (<button className="jbtn" onClick={onClick} disabled={disabled} style={{ background: disabled?'rgba(150,150,160,0.25)':grad||'linear-gradient(135deg,var(--accent-1),var(--accent-2))', borderRadius:999, color: disabled?'var(--text-muted)':'#fff', fontWeight:900, fontSize:fz[s], padding:pads[s], display:'inline-flex', alignItems:'center', gap:6, whiteSpace:'nowrap', ...sx }}>{icon && <span>{icon}</span>}{children}</button>)
}
export const ProgBar = ({ pct, cssVar='--fuel-bar', animated=false }) => (<div style={{ background:'var(--prog-bg)', borderRadius:999, height:9, overflow:'hidden' }}><div style={{ width:`${Math.min(pct,100)}%`, height:'100%', borderRadius:999, background:`var(${cssVar})`, transition:'width 0.1s ease', position:'relative', ...(animated ? { animation:'boostPulse 1.8s ease-in-out infinite' } : {}) }} /></div>)
export const Badge = ({ label, color }) => (<span style={{ background:`${color}22`, border:`1.5px solid ${color}66`, color, fontSize:10, fontWeight:900, padding:'3px 10px', borderRadius:999, textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>{label}</span>)

export const BoostPanel = ({ boost, isCyber }) => {
  if (!boost) return <Glass style={{ padding:'14px 16px', border:'1.5px dashed var(--nav-border)', textAlign:'center', color:'var(--text-muted)', fontSize:11 }}>{isCyber ? '> NO_BOOST_DETECTED' : '🎯 No NFT Boost Active'}</Glass>
  return (
    <Glass className="boost-active" style={{ padding:'14px 16px', border:`1.5px solid ${boost.color}66` }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}><span>{boost.icon}</span><span style={{ color:boost.color, fontWeight:900, fontSize:12 }}>{boost.label}</span></div>
      <div style={{ fontSize:10, color:'var(--text-primary)' }}>Score Multi: ×{boost.scoreMulti.toFixed(2)}</div>
    </Glass>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIEWS (Dash, Shooter, Inventory)
═══════════════════════════════════════════════════════════════ */
export const JellyShooterView = ({ theme, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  const sugarRate = activeBoost ? activeBoost.sugarRate : 1
  const [sugar, setSugar] = useState(0)
  const [phase, setPhase] = useState('idle')
  // ... (Sisa logic shooter disederhanakan agar tidak lag)
  return <div className="panel-enter"><Glass style={{ padding:20 }}><h2>{isCyber ? 'CYBER_LAUNCHER' : 'Jelly Shooter'}</h2><p>Charge: {Math.round(sugar)}%</p><JBtn onClick={() => setSugar(s => Math.min(s+10, 100))}>Charge</JBtn></Glass></div>
}

export const DashView = ({ theme, connected, balance, tickets, setTickets, setBalance, addToast, activeBoost }) => {
  const isCyber = theme === 'theme-cyber'
  return (<div className="panel-enter"><Glass style={{ padding:30 }}><h1>{isCyber ? 'WIN.SYS' : 'Jelly Raffle'}</h1><p>Balance: {balance} $BGS</p></Glass></div>)
}

export const InvView = ({ theme, connected, addToast, nfts = [], setNfts, setOwnedNFTs }) => {
  const isCyber = theme === 'theme-cyber'
  const RARITY_ORDER = { Legendary:0, Epic:1, Rare:2, Uncommon:3 }
  
  const safeNfts = Array.isArray(nfts) ? nfts : []
  const sorted = [...safeNfts].sort((a, b) => (RARITY_ORDER[a.rarity] || 0) - (RARITY_ORDER[b.rarity] || 0))

  const toggleEquip = (nft) => {
    if (!nft) return
    const newNfts = safeNfts.map(n => n.id === nft.id ? { ...n, equipped: !n.equipped } : n)
    setNfts(newNfts)
    const equipped = newNfts.filter(n => n.equipped && n.owned)
    setOwnedNFTs(equipped)
  }

  const equippedNFTs = safeNfts.filter(n => n.equipped && n.owned)
  const activeBoost = computeActiveBoost(equippedNFTs)
  const ownedCount = safeNfts.filter(n => n.owned).length
  const equippedCount = equippedNFTs.length

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <Glass style={{ padding:20, display:'flex', justifyContent:'space-between' }}>
        <h2>{isCyber ? 'VAULT.SYS' : 'Inventory'}</h2>
        <div>Owned: {ownedCount} | Equipped: {equippedCount}</div>
      </Glass>
      
      {activeBoost && <BoostPanel boost={activeBoost} isCyber={isCyber} />}

      {!connected ? <Glass style={{ padding:40, textAlign:'center' }}>Connect Wallet</Glass> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
          {sorted.map(nft => (
            <Glass key={nft.id} style={{ padding:15, border: nft.equipped ? `2px solid ${nft.rc}` : '1px solid #ccc' }}>
              <div style={{ fontSize:40, textAlign:'center' }}>{nft.emoji}</div>
              <h4>{nft.name}</h4>
              <JBtn size="xs" onClick={() => toggleEquip(nft)}>{nft.equipped ? 'Unequip' : 'Equip'}</JBtn>
            </Glass>
          ))}
        </div>
      )}
    </div>
  )
}