import { useState, useEffect, useCallback } from 'react'
import {
  applyThemeToDOM, handleThemeChange, getSavedTheme,
  TABS, THEME_OPTS, ALL_NFTS,
  Toaster, PageBg, JBtn,
  DashView, JellyShooterView, InvView,
  computeActiveBoost,
} from './components.jsx'

export default function App() {
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

  useEffect(() => { applyThemeToDOM(theme) }, [theme])
  useEffect(() => { applyThemeToDOM(getSavedTheme()) }, [])

  const activeBoost = computeActiveBoost(ownedNFTs)

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, message: msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800)
  }, [])

  // --- MESIN BARU: INITIA L2 INTERWOVEN ---
  // --- MESIN BARU: DIRECT KEPLR BYPASS (SULTAN BRANGAS) ---
  const connect = async () => {
    if (!window.keplr) {
      addToast(isCyber ? '> ERR: KEPLR_NOT_FOUND' : 'Pasang Keplr dulu Juragan! 🦊', 'error');
      window.open("https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap", "_blank");
      return;
    }

    try {
      const chainId = "initiation-2";
      await window.keplr.enable(chainId);

      const offlineSigner = window.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;

      setWallet(address);
      setConn(true);
      setBalance(0);

      addToast(isCyber ? '> SESSION_ESTABLISHED' : 'Gacor! Connected to Initia! 🚀', 'success');
    } catch (e) {
      console.error(e);
      addToast(isCyber ? '> ERR_CONNECTION_REJECTED' : 'Koneksi gagal/dibatalkan ❌', 'error');
    }
  };
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

        {mMenu && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
            <div onClick={() => setMMenu(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} />
            <div className="glass" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, padding: '20px 20px 28px', background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: 18, color: 'var(--text-accent)' }}>{isCyber ? '🤖 JELLY_SHOT.SYS' : '🍬 Jelly Shot'}</span>
                <button onClick={() => setMMenu(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-primary)' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setMMenu(false) }} style={{ background: tab === t.id ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))' : 'var(--nav-inactive)', border: `1.5px solid ${tab === t.id ? 'transparent' : 'var(--nav-border)'}`, borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 900, fontSize: 14, color: tab === t.id ? (isCyber ? '#000' : '#fff') : 'var(--text-primary)' }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--header-bg)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--header-border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMMenu(true)} className="mob-burger" style={{ display: 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-primary)', flexShrink: 0 }}>☰</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 6 }}>{isCyber ? '🤖' : '🍬'}<span style={{ fontFamily: 'var(--font-hud)', fontSize: 16, color: 'var(--text-accent)', lineHeight: 1 }}>{isCyber ? 'JELLY_SHOT' : 'Jelly Shot'}</span></div>
            <nav className="desk-nav" style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'center' }}>
              {TABS.map(t => {
                const active = tab === t.id
                return (
                  <button key={t.id} className="nav-pill" onClick={() => setTab(t.id)} style={{ background: active ? 'linear-gradient(135deg,var(--accent-1),var(--accent-2))' : 'var(--nav-inactive)', border: `1.5px solid ${active ? 'transparent' : 'var(--nav-border)'}`, borderRadius: 999, padding: '8px 18px', fontFamily: 'var(--font-body)', fontWeight: 900, fontSize: 13, color: active ? (isCyber ? '#000' : '#fff') : 'var(--text-primary)', boxShadow: active ? `0 6px 20px rgba(0,0,0,0.14),inset 0 2px 0 rgba(255,255,255,0.25),0 0 14px var(--btn-glow)` : 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 16 }}>{t.icon}</span>{isCyber ? t.label.toUpperCase().replace(' ', '_') : t.label}
                  </button>
                )
              })}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
              <div className="ticker-w" style={{ overflow: 'hidden', maxWidth: 160, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div className="ticker">{isCyber ? '> JELLY_CHAIN_L2_LIVE | $JLY_TOKEN' : '🎉 Welcome to Jelly-Chain L2 · $JLY Token'}</div>
              </div>

              {conn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div className="glass" style={{ borderRadius: 999, padding: '6px 14px', fontSize: 11, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {wallet.slice(0, 6)}...{wallet.slice(-4)}&nbsp;<span style={{ color: 'var(--accent-1)' }}>{balance} $JLY</span>
                  </div>
                  <JBtn grad="linear-gradient(135deg,#f87171,#ef4444)" onClick={disconnect} size="xs">✕</JBtn>
                </div>
              ) : (
                <JBtn onClick={connect} icon="🔗" size="sm" sx={{ boxShadow: 'var(--btn-shadow),0 0 18px var(--btn-glow)' }}>
                  {isCyber ? 'CONNECT_INITIA' : 'Connect Initia'}
                </JBtn>
              )}
            </div>
          </header>

          <main style={{ flex: 1, padding: '24px 20px 60px', maxWidth: 960, width: '100%', margin: '0 auto' }}>
            {/* INI KUNCI SAKTI: KIRIM WALLET ADDRESS KE VIEW! */}
            {tab === 'dashboard' && <DashView theme={theme} connected={conn} balance={balance} tickets={tickets} setTickets={setTickets} setBalance={setBalance} addToast={addToast} activeBoost={activeBoost} walletAddress={wallet} />}
            {tab === 'jellyShooter' && <JellyShooterView theme={theme} activeBoost={activeBoost} walletAddress={wallet} />}
            {tab === 'inventory' && <InvView theme={theme} connected={conn} addToast={addToast} nfts={nfts} setNfts={setNfts} setOwnedNFTs={setOwnedNFTs} />}
          </main>

          <footer style={{ textAlign: 'center', padding: '14px 20px', borderTop: '1px solid var(--header-border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {isCyber ? '> JELLY_SHOT_RAFFLE.v3 | INITIA_L2 | $JLY_TOKEN' : '🍬 Jelly Shot Raffle v3 · Powered by Initia · $JLY Token'}
          </footer>
        </div>
      </div>
    </>
  )
}