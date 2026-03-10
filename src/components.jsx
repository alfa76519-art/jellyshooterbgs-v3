import { useState, useEffect, useCallback, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
   1. THEME ENGINE: Menghubungkan React State ke CSS Variables
═══════════════════════════════════════════════════════════════ */
export function applyThemeToDOM(mode) {
  // Reset semua class lama biar gak tumpuk-tumpuk
  document.documentElement.classList.remove('theme-jelly', 'theme-light', 'theme-cyber')
  if (mode !== 'theme-jelly') {
    document.documentElement.classList.add(mode)
  }
  try { localStorage.setItem('userTheme', mode) } catch (e) {}
}

export function handleThemeChange(mode, setTheme) {
  const valid = ['theme-jelly', 'theme-light', 'theme-cyber']
  if (!valid.includes(mode)) return
  
  console.log("🎨 System: Switching to", mode) 
  applyThemeToDOM(mode)
  if (typeof setTheme === 'function') setTheme(mode)
}

/* ═══════════════════════════════════════════════════════════════
   2. BOOST LOGIC: Jantung Anti-Blank Putih
═══════════════════════════════════════════════════════════════ */
export const NFT_BOOSTS = {
  Legendary: { sugarRate: 2.5, pressureRate: 1.8, scoreMulti: 2.0, shakeBonus: 20, label: 'LEGENDARY BOOST', color: '#f59e0b', icon: '👑' },
  Epic:      { sugarRate: 1.8, pressureRate: 1.4, scoreMulti: 1.5, shakeBonus: 16, label: 'EPIC BOOST',      color: '#8b5cf6', icon: '💜' },
  Rare:      { sugarRate: 1.4, pressureRate: 1.2, scoreMulti: 1.25, shakeBonus: 14, label: 'RARE BOOST',      color: '#0ea5e9', icon: '🔵' },
  Uncommon:  { sugarRate: 1.15, pressureRate: 1.05, scoreMulti: 1.1, shakeBonus: 12, label: 'UNCOMMON BOOST',  color: '#ec4899', icon: '🩷' },
}

export function computeActiveBoost(ownedNFTs) {
  // GUARD: Mencegah error 'filter' of undefined
  const safeOwned = Array.isArray(ownedNFTs) ? ownedNFTs : []
  if (safeOwned.length === 0) return null;
  
  const order = ['Legendary', 'Epic', 'Rare', 'Uncommon'];
  // GUARD: Fallback ke 'Uncommon' kalau rarity gak dikenal (The Bob Fix)
  const top = order.find(r => safeOwned.some(n => n.rarity === r)) || 'Uncommon';
  const base = NFT_BOOSTS[top] || NFT_BOOSTS['Uncommon'];
  
  const merged = { sugarRate: 0, pressureRate: 0, scoreMulti: 0, shakeBonus: 0 };
  
  safeOwned.forEach(n => {
    const b = NFT_BOOSTS[n.rarity] || NFT_BOOSTS['Uncommon'];
    const isTop = n.rarity === top;
    // Stacking logic: 100% top boost + 10% secondary boosts
    merged.sugarRate    += b.sugarRate * (isTop ? 1 : 0.1);
    merged.pressureRate += b.pressureRate * (isTop ? 1 : 0.1);
    merged.scoreMulti   += b.scoreMulti * (isTop ? 1 : 0.1);
    merged.shakeBonus   += b.shakeBonus * (isTop ? 1 : 0.1);
  });
  
  return { ...merged, label: base.label, color: base.color, icon: base.icon, count: safeOwned.length, top };
}

/* ═══════════════════════════════════════════════════════════════
   3. VISUAL ASSETS: SVG & Animations
═══════════════════════════════════════════════════════════════ */
export const JellyFish = ({ size = 60, className = '' }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 60 84" className={className} style={{ filter: 'drop-shadow(0 4px 14px var(--jelly-glow))' }}>
    <ellipse cx="30" cy="28" rx="26" ry="22" fill="var(--jelly-body)" fillOpacity="0.85" />
    <path d="M10 48 Q10 65 15 75 M22 50 Q22 70 20 80 M38 50 Q38 70 40 80 M50 48 Q50 65 45 75" stroke="var(--jelly-body)" strokeWidth="2.5" fill="none" opacity="0.7" />
  </svg>
)

/* ═══════════════════════════════════════════════════════════════
   4. INVENTORY VIEW: UI Interaksi NFT
═══════════════════════════════════════════════════════════════ */
export const InvView = ({ theme, connected, nfts = [], setNfts, setOwnedNFTs, addToast }) => {
  const isCyber = theme === 'theme-cyber'
  const safeNfts = Array.isArray(nfts) ? nfts : []
  
  const toggleEquip = (nft) => {
    // Logic update array NFT
    const newNfts = safeNfts.map(n => n.id === nft.id ? { ...n, equipped: !n.equipped } : n)
    setNfts(newNfts)
    // Update state global buat shooter
    setOwnedNFTs(newNfts.filter(n => n.equipped && n.owned))
    addToast(`${nft.name} Updated!`, 'success')
  }

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <Glass style={{ padding:20 }}>
        <h2>{isCyber ? 'VAULT.SYS' : 'Your Inventory'}</h2>
      </Glass>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:15 }}>
        {safeNfts.map(nft => (
          <Glass key={nft.id} style={{ padding:20, border: nft.equipped ? `2px solid ${nft.rc}` : 'none' }}>
            <div style={{ fontSize:50, textAlign:'center', marginBottom:10 }}>{nft.emoji}</div>
            <div style={{ fontWeight:900, textAlign:'center' }}>{nft.name}</div>
            <div style={{ textAlign:'center', marginTop:10 }}>
               <JBtn size="sm" onClick={() => toggleEquip(nft)}>{nft.equipped ? 'UNEQUIP' : 'EQUIP'}</JBtn>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  )
}