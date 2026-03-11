import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Glass, ProgBar, BoostPanel, CyberBot, JellyFish, computeActiveBoost, NFT_BOOSTS } from './components'
// --- JELLY SHOOTER PRO (ANTI-BLANK) ---
export const JellyShooterView = ({ theme, activeBoost: rawBoost }) => {
  const isCyber = theme === 'theme-cyber'

  // [1] 🛡️ PENGAMAN DEWA: Bypass salah kirim prop dari App.jsx
  // Kalau App.jsx salah ngirim Array, kita kalkulasi ulang paksa di sini!
  const activeBoost = Array.isArray(rawBoost) 
    ? computeActiveBoost(rawBoost) 
    : (typeof rawBoost === 'object' ? rawBoost : null)

  const sugarRate    = activeBoost ? Math.min(activeBoost.sugarRate, 4) : 1
  const pressureRate = activeBoost ? Math.min(activeBoost.pressureRate, 3) : 1
  const scoreMulti   = activeBoost ? activeBoost.scoreMulti : 1
  const shakeBonus   = activeBoost ? activeBoost.shakeBonus : 12

  const [phase, setPhase] = useState('idle'); const [sugar, setSugar] = useState(0); const [pressure, setPressure]  = useState(0)
  const [countdown, setCountdown] = useState(3); const [score, setScore] = useState(0); const [bestScore, setBest] = useState(0)
  const [particles, setParticles] = useState([]); const [shakeFlash,setShakeFlash]= useState(false)
  const [jellyPos, setJellyPos] = useState(0); const [thrusterOn,setThruster] = useState(false)

  const chargeRef = useRef(null); const countRef = useRef(null); const flyRef = useRef(null)
  const sugarRef = useRef(0); const pressRef = useRef(0); const phaseRef = useRef('idle'); const lastShake = useRef(0)

  useEffect(() => { sugarRef.current = sugar }, [sugar]); useEffect(() => { pressRef.current = pressure }, [pressure]); useEffect(() => { phaseRef.current = phase }, [phase])

  useEffect(() => {
    const handler = e => {
      const acc = e.accelerationIncludingGravity; if (!acc) return
      const f = Math.sqrt((acc.x||0)**2+(acc.y||0)**2+(acc.z||0)**2); const now = Date.now()
      if (f > 22 && now - lastShake.current > 800) {
        lastShake.current = now; setSugar(s => Math.min(s + shakeBonus, 100)); setShakeFlash(true)
        setTimeout(() => setShakeFlash(false), 700)
      }
    }
    window.addEventListener('devicemotion', handler, true); return () => window.removeEventListener('devicemotion', handler, true)
  }, [shakeBonus])

  const spawnParticle = useCallback(() => {
    const id = Date.now() + Math.random(); const angle = (Math.random()-0.5)*65; const dist = 32 + Math.random()*52
    setParticles(p => [...p, { id, px: Math.sin(angle*Math.PI/180)*dist, py: 42+Math.random()*32 }].slice(-20))
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 600)
  }, [])

  const launchNow = useCallback(() => {
    const final = Math.round((sugarRef.current*10 + pressRef.current*5) * scoreMulti)
    setPhase('flying'); let pos = 0; const target = sugarRef.current * 2.8
    flyRef.current = setInterval(() => {
      pos += (target-pos)*0.08 + 1.5; setJellyPos(pos)
      if (pos >= target-5) {
        clearInterval(flyRef.current); setScore(final); setBest(b => Math.max(b, final)); setPhase('landed')
        for (let i=0; i<14; i++) spawnParticle()
        setTimeout(() => { setJellyPos(0); setSugar(0); setPressure(0) }, 2200)
        setTimeout(() => setPhase('idle'), 2800)
      }
    }, 16)
  }, [scoreMulti, spawnParticle])

  const stopCharge = useCallback(() => {
    clearInterval(chargeRef.current); setThruster(false)
    if (sugarRef.current < 10) { setPhase('idle'); setSugar(0); setPressure(0); return }
    setPhase('countdown'); let c = 3; setCountdown(c)
    countRef.current = setInterval(() => {
      c--; if (c <= 0) { clearInterval(countRef.current); launchNow() } else setCountdown(c)
    }, 900)
  }, [launchNow])

  const startCharge = useCallback(() => {
    if (phaseRef.current !== 'idle') return
    setPhase('charging'); setThruster(true)
    chargeRef.current = setInterval(() => {
      setSugar(s => { const n = Math.min(s + 1.8*sugarRate, 100); sugarRef.current = n; return n })
      setPressure(p => { const n = Math.min(p + 1.2*pressureRate, 100); pressRef.current = n; return n })
      spawnParticle(); if (sugarRef.current >= 100) stopCharge()
    }, 50)
  }, [sugarRate, pressureRate, spawnParticle, stopCharge])

  useEffect(() => {
    const kd = e => { if (e.code==='Space') { e.preventDefault(); startCharge() } }
    const ku = e => { if (e.code==='Space') { e.preventDefault(); stopCharge()  } }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    return () => { window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku) }
  }, [startCharge, stopCharge])

  useEffect(() => () => { clearInterval(chargeRef.current); clearInterval(countRef.current); clearInterval(flyRef.current) }, [])

  const tierLabel = score>=900?'🏆 LEGENDARY':score>=600?'💜 EPIC':score>=300?'🔵 RARE':'🌱 STARTER'

  return (
    <div className="panel-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <Glass className="fup" style={{ padding:'18px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--text-primary)', marginBottom:4 }}>{isCyber ? '🤖 CYBER LAUNCHER' : '🪼 Jelly Shooter'}</h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, fontFamily:'var(--font-mono)' }}>{isCyber ? '> Hold [SPACE] or button to charge' : 'Tahan tombol / SPACE → isi gula → lepas → luncur! 🚀'}</p>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            {shakeFlash && <span style={{ fontFamily:'var(--font-hud)', fontSize:13, color:'var(--accent-4)', fontWeight:900 }}>+SHAKE {shakeBonus}⚡</span>}
            <div style={{ textAlign:'center' }}><div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>BEST</div><div style={{ fontFamily:'var(--font-hud)', fontSize:22, color:'var(--accent-2)' }}>{bestScore}</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>SCORE</div><div style={{ fontFamily:'var(--font-hud)', fontSize:28, color:'var(--accent-1)' }}>{score}</div></div>
          </div>
        </div>
      </Glass>
      <div className="game-grid" style={{ display:'grid', gridTemplateColumns:'1fr 270px', gap:14 }}>
        <Glass className="fup" style={{ position:'relative', height:430, overflow:'hidden', background:'var(--game-bg)', border:'1.5px solid var(--game-border)' }}>
          {isCyber && <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(var(--accent-1) 1px,transparent 1px),linear-gradient(90deg,var(--accent-1) 1px,transparent 1px)', backgroundSize:'30px 30px', opacity:0.05, animation:'gridPulse 3s ease-in-out infinite', pointerEvents:'none', zIndex:0 }}/>}
          {particles.map(p => <div key={p.id} style={{ position:'absolute', left:'50%', bottom:80, width:8, height:8, borderRadius:isCyber?'2px':'50%', background:'var(--particle-clr)', '--px':`${p.px}px`, '--py':`${p.py}px`, animation:'particleBurst 0.6s ease-out forwards', zIndex:2 }}/>)}
          <div style={{ position:'absolute', bottom:70, left:0, right:0, height:2, background:'var(--game-border)', opacity:0.4 }}/>
          {activeBoost && <div style={{ position:'absolute', left:'50%', bottom:66, transform:'translateX(-50%)', width:80, height:20, borderRadius:'50%', background:`radial-gradient(ellipse,${activeBoost.color}55,transparent)`, zIndex:3, animation:'boostPulse 1.8s ease-in-out infinite' }}/>}
          <div style={{ position:'absolute', left:'50%', bottom: 80 + ((phase==='flying'||phase==='landed') ? jellyPos : 0), transform:'translateX(-50%)', zIndex:5, animation: phase==='charging'?(isCyber?'cyberJitter 0.15s linear infinite':'jellyWobble 0.3s ease-in-out infinite'):phase==='flying'?'none':'floatIdle 3.5s ease-in-out infinite', transition:'bottom 0.05s linear' }}>
            {isCyber ? <CyberBot size={72}/> : <JellyFish size={72}/>}
          </div>
          {thrusterOn && [...Array(5)].map((_,i) => <div key={i} style={{ position:'absolute', left:`calc(50% + ${(i-2)*12}px)`, bottom:76, width:isCyber?6:8, height:isCyber?6:8, borderRadius:isCyber?'2px':'50%', background:isCyber?`hsl(${120+i*15},100%,60%)`:`hsl(${310+i*15},90%,${70+i*5}%)`, animation:`thrusterBubble ${0.4+i*0.08}s ease-out infinite`, animationDelay:`${i*0.06}s`, zIndex:4 }}/>)}
          {phase==='countdown' && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, backdropFilter:'blur(4px)', borderRadius:'var(--card-radius)' }}><div style={{ fontFamily:'var(--font-hud)', fontSize:96, color:'var(--accent-1)', animation:'countdownAnim 0.9s ease-in-out forwards', textShadow:'0 0 40px var(--jelly-glow)' }}>{countdown}</div></div>}
          {phase==='landed' && <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, zIndex:10, backdropFilter:'blur(6px)', borderRadius:'var(--card-radius)' }}><div style={{ fontFamily:'var(--font-hud)', fontSize:40, color:'var(--accent-1)', textShadow:'0 0 30px var(--jelly-glow)' }}>{score} pts!</div>{activeBoost && <div style={{ fontSize:13, fontWeight:900, color:activeBoost.color, fontFamily:'var(--font-mono)' }}>{activeBoost.icon} ×{activeBoost.scoreMulti.toFixed(2)} applied</div>}<div style={{ fontFamily:'var(--font-hud)', fontSize:18, color:'var(--text-muted)' }}>{tierLabel}</div></div>}
          {phase==='idle' && <div style={{ position:'absolute', bottom:14, left:0, right:0, textAlign:'center', fontSize:12, fontWeight:800, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{isCyber?'> HOLD_BUTTON or [SPACE]':'💡 Tahan tombol atau SPACE'}</div>}
        </Glass>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Glass style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:'var(--text-muted)' }}>Kadar Gula ⚡{sugarRate>1 && <span style={{ color:'var(--accent-4)', marginLeft:4 }}>×{sugarRate.toFixed(1)}</span>}</span><span style={{ fontFamily:'var(--font-hud)', fontSize:14, color:'var(--accent-1)' }}>{Math.round(sugar)}%</span></div>
            <ProgBar pct={sugar} cssVar="--fuel-bar"/>
            {sugar>=90 && <div style={{ marginTop:6, fontSize:10, fontWeight:900, color:'var(--accent-1)', fontFamily:'var(--font-mono)', textAlign:'center', animation:'jellyWobble 0.5s ease infinite' }}>{isCyber?'[!] OVERFLOW':'⚠️ Gula Penuh!'}</div>}
          </Glass>
          <Glass style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}><span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:900, color:'var(--text-muted)' }}>Tekanan 🎯{pressureRate>1 && <span style={{ color:'var(--accent-4)', marginLeft:4 }}>×{pressureRate.toFixed(1)}</span>}</span><span style={{ fontFamily:'var(--font-hud)', fontSize:14, color:'var(--accent-3)' }}>{Math.round(pressure)}%</span></div>
            <ProgBar pct={pressure} cssVar="--pressure-bar"/>
          </Glass>
          <BoostPanel boost={activeBoost} isCyber={isCyber}/>
          <button className="jbtn" onMouseDown={startCharge} onMouseUp={stopCharge} onTouchStart={e=>{e.preventDefault();startCharge()}} onTouchEnd={e=>{e.preventDefault();stopCharge()}} disabled={phase==='countdown'||phase==='flying'||phase==='landed'} style={{ background: phase==='charging'?'linear-gradient(135deg,var(--accent-4),var(--accent-3))':'linear-gradient(135deg,var(--accent-1),var(--accent-2))', padding:'18px 14px', borderRadius:18, fontFamily:'var(--font-hud)', fontWeight:900, fontSize:15, color:'#fff', boxShadow:'var(--btn-shadow),0 0 20px var(--btn-glow)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, userSelect:'none', touchAction:'none' }}>
            <span style={{ fontSize:28 }}>{phase==='charging'?'⚡':phase==='countdown'?'🔢':phase==='flying'?'🚀':'🪼'}</span>
            <span>{phase==='charging'?'Mengisi…':phase==='countdown'?'Menghitung…':phase==='flying'?'Terbang!':phase==='landed'?'Selesai!':'Tahan → Isi Gula!'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default JellyShooterView;