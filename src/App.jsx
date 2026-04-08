import { useState, useCallback } from 'react'
import {
  applyThemeToDOM, handleThemeChange, getSavedTheme,
  TABS, THEME_OPTS, ALL_NFTS,
  Toaster, PageBg, Glass, JBtn,
  DashView, JellyShooterView, InvView,
  computeActiveBoost,
} from './components.jsx'

export default function App() {
  // ── STATE ──────────────────────────────────────────────
  const [theme, setTheme] = useState(getSavedTheme)
  const [tab, setTab] = useState('dashboard')
  const [conn, setConn] = useState(false)
  const [wallet, setWallet] = useState('')
  const [balance, setBalance] = useState(0)
  const [tickets, setTickets] = useState({})
  const [toasts, setToasts] = useState([])
  const [tmOpen, setTmOpen] = useState(false)
  const [mMenu, setMMenu] = useState(false)
  const [ownedNFTs, setOwnedNFTs] = useState([])
  const [nfts, setNfts] = useState(ALL_NFTS)

  const isCyber = theme === 'theme-cyber'
  const activeBoost = computeActiveBoost(ownedNFTs)

  // ── TOAST ──────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, message: msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800)
  }, [])

  // ── CONNECT (InterwovenKit) ────────────────────────────
  const connect = async () => {
    try {
      const ik = new window.InterwovenKit({
        chainId: 'jelly-chain',
        rpcUrl: 'http://localhost:26657',
        restUrl: 'http://localhost:1317',
        appName: 'Jelly Shooter BGS v3',
      })
      const address = await ik.connect()
      setWallet(address)
      setConn(true)

      const balances = await ik.getBalances(address)
      const jellyBal = balances.find(b => b.denom === 'ujelly')
      setBalance(jellyBal ? (parseInt(jellyBal.amount) / 1_000_000).toFixed(2) : 0)

      addToast(isCyber ? '> SESSION_ESTABLISHED' : 'Connected to Jelly-Chain! 🎉', 'success')
    } catch (e) {
      console.error(e)
      addToast(isCyber ? '> ERR_CONNECTION_REJECTED' : 'Connection failed 😢', 'error')
    }
  }

  // ── DISCONNECT ────────────────────────────────────────
  const disconnect = () => {
    setConn(false); setWallet(''); setBalance(0); setTickets({})
    addToast(isCyber ? '> SESSION_TERMINATED' : 'Wallet disconnected', 'error')
  }

  // ── THEME ─────────────────────────────────────────────
  const changeTheme = (mode) => { handleThemeChange(mode, setTheme); setTmOpen(false) }

  // ── RENDER ────────────────────────────────────────────
  return (
    <div className="app-root">
      <PageBg />
      <Toaster toasts={toasts} />

      {/* ── Mobile drawer ── */}
      {mMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
          <div onClick={() => setMMenu(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          }} />
          <div className="glass" style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1,
            padding: '20px 20px 28px',
            background: 'var(--header-bg)',
            borderBottom: '1px solid var(--header-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: 18, color: 'var(--text-accent)' }}>
                {isCyber ? '🤖 JELLY_SHOT.SYS' : '🍬 Jelly Shot'}
              </span>
              <button onClick={() => setMMenu(false)} style={{
                background: 'none', border: 'none',
                fontSize: 22, cursor: 'pointer', color: 'var(--text-primary)',
              }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setMMenu(false) }} style={{
                  background: tab === t.id
                    ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                    : 'var(--nav-inactive)',
                  border: `1.5px solid ${tab === t.id ? 'transparent' : 'var(--nav-border)'}`,
                  borderRadius: 14, padding: '12px 18px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontWeight: 900, fontSize: 14,
                  color: tab === t.id ? (isCyber ? '#000' : '#fff') : 'var(--text-primary)',
                }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── HEADER ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'var(--header-bg)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--header-border)',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Burger (mobile) */}
          <button onClick={() => setMMenu(true)} className="mob-burger" style={{
            display: 'none', background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer', color: 'var(--text-primary)', flexShrink: 0,
          }}>☰</button>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 6 }}>
            <span>{isCyber ? '🤖' : '🍬'}</span>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 16, color: 'var(--text-accent)', lineHeight: 1 }}>
              {isCyber ? 'JELLY_SHOT' : 'Jelly Shot'}
            </span>
          </div>

          {/* Nav — desktop */}
          <nav className="desk-nav" style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'center' }}>
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button key={t.id} className="nav-pill" onClick={() => setTab(t.id)} style={{
                  background: active
                    ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                    : 'var(--nav-inactive)',
                  border: `1.5px solid ${active ? 'transparent' : 'var(--nav-border)'}`,
                  borderRadius: 999, padding: '8px 18px',
                  fontFamily: 'var(--font-body)', fontWeight: 900, fontSize: 13,
                  color: active ? (isCyber ? '#000' : '#fff') : 'var(--text-primary)',
                  boxShadow: active
                    ? '0 6px 20px rgba(0,0,0,0.14),inset 0 2px 0 rgba(255,255,255,0.25),0 0 14px var(--btn-glow)'
                    : 'none',
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  {isCyber ? t.label.toUpperCase().replace(' ', '_') : t.label}
                  {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: isCyber ? '#000' : 'rgba(255,255,255,0.8)' }} />}
                </button>
              )
            })}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>

            {/* Active boost badge */}
            {activeBoost && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: `${activeBoost.color}18`,
                border: `1.5px solid ${activeBoost.color}44`,
                borderRadius: 999, padding: '5px 12px',
                boxShadow: `0 0 12px ${activeBoost.color}33`,
              }} className="ticker-w">
                <span style={{ fontSize: 14 }}>{activeBoost.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: activeBoost.color, fontFamily: 'var(--font-mono)' }}>
                  ×{activeBoost.scoreMulti.toFixed(2)}
                </span>
              </div>
            )}

            {/* Ticker */}
            <div className="ticker-w" style={{
              overflow: 'hidden', maxWidth: 160, fontSize: 10,
              fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            }}>
              <div className="ticker">
                {isCyber
                  ? '> init1...3x9 +5000 $JLY | 340 TX | JELLY_CHAIN_LIVE'
                  : '🎉 init1...3x9 won 5,000 $JLY · 340 tickets · Jelly-Chain'}
              </div>
            </div>

            {/* Theme switcher */}
            <div style={{ position: 'relative' }}>
              <JBtn
                grad={
                  theme === 'theme-jelly' ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                    : theme === 'theme-light' ? 'linear-gradient(135deg,var(--accent-3),var(--accent-2))'
                      : 'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                }
                onClick={() => setTmOpen(o => !o)}
                size="sm"
                icon={theme === 'theme-jelly' ? '🍬' : theme === 'theme-light' ? '☀️' : '🤖'}
                sx={{ color: isCyber ? '#000' : '#fff' }}>
                {THEME_OPTS.find(o => o.id === theme)?.label}
              </JBtn>
              {tmOpen && (
                <div className="glass" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 200,
                  padding: 8, minWidth: 185, boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 900, textTransform: 'uppercase',
                    letterSpacing: '.1em', color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)', padding: '4px 8px 8px',
                  }}>
                    {isCyber ? '> SELECT_THEME' : 'Mode'}
                  </div>
                  {THEME_OPTS.map(o => (
                    <button key={o.id} onClick={() => changeTheme(o.id)} className="jbtn" style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 12px', borderRadius: 12, marginBottom: 4,
                      background: theme === o.id
                        ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))'
                        : 'rgba(255,255,255,0.06)',
                      color: (theme === o.id && isCyber) ? '#000' : 'var(--text-primary)',
                      fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13,
                    }}>
                      <span style={{ fontSize: 18 }}>{o.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 900, fontSize: 12 }}>{o.label}</div>
                        <div style={{ fontSize: 10, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>{o.desc}</div>
                      </div>
                      {theme === o.id && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Connect / Disconnect */}
            {conn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className="glass" style={{
                  borderRadius: 999, padding: '6px 14px',
                  fontSize: 11, fontWeight: 900,
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                }}>
                  {wallet}&nbsp;
                  <span style={{ color: 'var(--accent-1)' }}>
                    {balance != null ? balance.toString() : '0'} $JLY
                  </span>
                </div>
                <JBtn grad="linear-gradient(135deg,#f87171,#ef4444)" onClick={disconnect} size="xs">✕</JBtn>
              </div>
            ) : (
              <JBtn onClick={connect} icon="🔗" size="sm"
                sx={{ boxShadow: 'var(--btn-shadow),0 0 18px var(--btn-glow)' }}>
                {isCyber ? 'CONNECT_WALLET' : 'Connect Initia Wallet'}
              </JBtn>
            )}
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, padding: '24px 20px 60px', maxWidth: 960, width: '100%', margin: '0 auto' }}>

          {tab === 'dashboard' && (
            <DashView
              theme={theme}
              connected={conn}
              balance={balance}
              tickets={tickets}
              setTickets={setTickets}
              setBalance={setBalance}
              addToast={addToast}
              activeBoost={activeBoost}
              walletAddress={wallet}        {/* ← KRUSIAL */}
            />
          )}

          {tab === 'jellyShooter' && (
            <JellyShooterView
              theme={theme}
              activeBoost={activeBoost}
              walletAddress={wallet}        {/* ← KRUSIAL */}
            />
          )}

          {tab === 'inventory' && (
            <InvView
              theme={theme}
              connected={conn}
              addToast={addToast}
              nfts={nfts}
              setNfts={setNfts}
              setOwnedNFTs={setOwnedNFTs}
            />
          )}

        </main>

        {/* ── FOOTER ── */}
        <footer style={{
          textAlign: 'center', padding: '14px 20px',
          borderTop: '1px solid var(--header-border)',
          fontSize: 11, fontWeight: 700,
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
        }}>
          {isCyber
            ? '> JELLY_SHOT_RAFFLE.v3 | INITIA_L2 | $JLY_TOKEN | GitHub_Pages'
            : '🍬 Jelly Shot Raffle v3 · Powered by Initia L2 · $JLY Token'}
        </footer>
      </div>

      {/* Close theme dropdown on outside click */}
      {tmOpen && (
        <div onClick={() => setTmOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
      )}
    </div>
  )
}