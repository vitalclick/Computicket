/* ===== APP SHELL · routing · tweaks ===== */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "naija",
  "density": "comfortable",
  "heroVariant": "cinematic",
  "showCopilot": true,
  "loggedIn": false
}/*EDITMODE-END*/;

const App = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState({ name: "home" });

  // Read URL hash on mount
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (!h) return { name:"home" };
      const [name, ...rest] = h.split('/');
      const q = rest[0];
      return { name, ...(q ? { q, id: q } : {}) };
    };
    setRoute(fromHash());
    const onHash = () => setRoute(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Apply theme/accent/density to root
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = t.theme;
    r.dataset.accent = t.accent;
    r.dataset.density = t.density;
  }, [t.theme, t.accent, t.density]);

  // Listen for direct DOM theme toggles & sync to tweaks
  useEffect(() => {
    const onThemeChange = (e) => setTweak('theme', e.detail);
    window.addEventListener('theme-change', onThemeChange);
    return () => window.removeEventListener('theme-change', onThemeChange);
  }, [setTweak]);

  const go = (next) => {
    setRoute(next);
    const h = next.id ? `${next.name}/${next.id}` : next.q ? `${next.name}/${next.q}` : next.name;
    window.history.pushState(null, '', `#${h}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  let page;
  switch (route.name) {
    case "event":     page = <PageEvent id={route.id}/>; break;
    case "search":    page = <PageSearch q={route.q}/>; break;
    case "checkout":  page = <PageCheckout/>; break;
    case "dashboard": page = <PageDashboard/>; break;
    case "organizer": page = <PageOrganizer/>; break;
    case "hotels":    page = <PageHotels/>; break;
    case "flights":   page = <PageFlights/>; break;
    case "buses":     page = <PageBuses/>; break;
    case "page":      page = <PageStatic id={route.id || "about"}/>; break;
    case "home":
    default:          page = <PageHome heroVariant={t.heroVariant}/>;
  }

  // Hide footer on dashboards (full-bleed)
  const hideFooter = route.name === "dashboard" || route.name === "organizer" || route.name === "checkout";

  return (
    <RouterCtx.Provider value={{ route, go, loggedIn: t.loggedIn, setLoggedIn: (v) => setTweak('loggedIn', v) }}>
      <div className="shell">
        <TopNav/>
        {page}
        {!hideFooter && <Footer/>}
        {t.showCopilot && <Copilot enabled={true}/>}

        {/* Page jump nav — quick access to all screens for review */}
        <PageJumper route={route} go={go}/>

        <TweaksPanel title="Tweaks">
          <TweakSection label="Theme"/>
          <TweakRadio label="Mode" value={t.theme} options={["dark","light"]} onChange={v => setTweak('theme', v)}/>
          <TweakColor label="Accent" value={t.accent}
            options={["naija","violet","cyan","amber","magenta"]}
            onChange={v => setTweak('accent', v)}/>

          <TweakSection label="Layout"/>
          <TweakRadio label="Density" value={t.density} options={["comfortable","compact"]} onChange={v => setTweak('density', v)}/>
          <TweakSelect label="Hero variant" value={t.heroVariant}
            options={["cinematic","editorial","search"]}
            onChange={v => setTweak('heroVariant', v)}/>

          <TweakSection label="Intelligence"/>
          <TweakToggle label="Show Compass AI" value={t.showCopilot} onChange={v => setTweak('showCopilot', v)}/>

          <TweakSection label="Account"/>
          <TweakToggle label="Signed in" value={t.loggedIn} onChange={v => setTweak('loggedIn', v)}/>
        </TweaksPanel>
      </div>
    </RouterCtx.Provider>
  );
};

/* ----- Quick page jumper for review (floats top-left when on home) ----- */
const PageJumper = ({ route, go }) => {
  const [open, setOpen] = useState(false);
  const pages = [
    { id:"home",      l:"Homepage",          k:""},
    { id:"search",    l:"Search results",    k:"q=Burna"},
    { id:"event",     l:"Event details",     k:"e3"},
    { id:"checkout",  l:"Checkout",          k:""},
    { id:"dashboard", l:"User dashboard",    k:""},
    { id:"organizer", l:"Organizer dashboard",k:""},
    { id:"hotels",    l:"Hotels",            k:""},
    { id:"flights",   l:"Flights",           k:""},
    { id:"buses",     l:"Bus travel",        k:""},
    { id:"page-about",l:"About · editorial", k:"about"},
    { id:"page-trust",l:"Trust & Safety",    k:"trust"},
  ];
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position:'fixed', left:24, bottom:24, zIndex:55,
          padding:'10px 14px', borderRadius:'var(--r-pill)',
          background:'var(--ink)', color:'var(--bg-void)',
          fontSize:12, fontFamily:'var(--font-mono)', fontWeight:600,
          letterSpacing:'.08em', textTransform:'uppercase',
          display:'flex', alignItems:'center', gap:8,
          boxShadow:'var(--shadow-md)',
        }}>
        <Icon name="grid" size={14}/> {route.name.toUpperCase()}
      </button>
      {open && (
        <div className="card" style={{
          position:'fixed', left:24, bottom:80, zIndex:55,
          padding:8, minWidth:240, boxShadow:'var(--shadow-lg)',
        }}>
          <div className="eyebrow" style={{padding:'8px 12px 6px'}}>Jump to screen</div>
          {pages.map(p => {
            const isPage = p.id.startsWith('page-');
            const target = isPage ? { name:'page', id: p.k } : { name:p.id, ...(p.k?{q:p.k.replace('q=','')}:{}) };
            const isActive = isPage
              ? (route.name === 'page' && route.id === p.k)
              : (route.name === p.id);
            return (
              <button key={p.id} onClick={() => { go(target); setOpen(false); }}
                style={{
                  width:'100%', textAlign:'left',
                  padding:'10px 12px', borderRadius:'var(--r-2)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--ink)',
                  fontSize:13, fontWeight: isActive ? 600 : 500,
                  display:'flex', alignItems:'center', gap:8,
                  cursor:'pointer',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {isActive && <Icon name="check" size={13}/>}
                <span>{p.l}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
