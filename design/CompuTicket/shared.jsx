/* ----- Shared shell components ----- */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

const formatNGN = (n) => "₦" + n.toLocaleString("en-NG");

const RouterCtx = createContext({ route: { name: "home" }, go: () => {} });
const useRoute = () => useContext(RouterCtx);

const TopNav = () => {
  const { route, go, loggedIn, setLoggedIn } = useRoute();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [];

  return (
    <header style={{
      position:'sticky', top:0, zIndex:50,
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      background: scrolled ? 'oklch(var(--bg-void) / 0.78)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(140%)' : 'none',
      transition:'all .25s',
    }}>
      <div className="wrap" style={{display:'flex', alignItems:'center', gap:14, height:'var(--nav-h)'}}>
        <a onClick={() => go({ name:"home" })} style={{cursor:'pointer', flexShrink:0, marginRight:18}}>
          <Wordmark />
        </a>

        <button className="btn btn-glass btn-sm" style={{flexShrink:0, padding:'8px 14px'}}>
          <Icon name="pin" size={14}/>
          <span style={{fontSize:13, fontWeight:500}}>Lagos</span>
          <Icon name="chevronDown" size={12}/>
        </button>

        <div style={{flex:1, minWidth:0}}/>

        <button onClick={() => go({ name:"search" })}
          style={{
            flexShrink:0,
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 16px', borderRadius:'var(--r-pill)',
            background:'var(--surface)', border:'1px solid var(--line)',
            color:'var(--ink-3)', textAlign:'left',
            whiteSpace:'nowrap',
            transition:'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface)'; }}>
          <Icon name="search" size={15}/>
          <span style={{fontSize:13.5, color:'var(--ink-3)'}}>Search events, flights, stays…</span>
          <span className="mono text-xs muted-2" style={{paddingLeft:8, borderLeft:'1px solid var(--line)'}}>⌘K</span>
        </button>

        <button className="org-pill" title="Promoter Hub" style={{flexShrink:0}}
          onClick={() => go({ name:"organizer" })}>
          <span className="org-dot"/>
          <span>For Organizers</span>
        </button>

        <button className="ai-pill" title="Ask Compass AI" style={{flexShrink:0}}
          onClick={() => window.dispatchEvent(new CustomEvent('open-copilot'))}>
          <span className="ai-dot"/>
          <span>Ask Compass</span>
        </button>

        <button className="icon-btn" aria-label="Notifications" style={{flexShrink:0, display: loggedIn ? 'grid' : 'none'}}>
          <Icon name="bell" size={16}/>
        </button>

        <ThemeToggle/>

        {loggedIn ? (
          <button onClick={() => go({ name:"dashboard" })}
            style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'4px 12px 4px 4px', borderRadius:'var(--r-pill)',
              border:'1px solid var(--line)', background:'var(--surface)',
              flexShrink:0,
            }}>
            <div style={{
              width:30, height:30, borderRadius:'50%',
              background:'linear-gradient(135deg, var(--accent), oklch(0.55 0.18 180))',
              display:'grid', placeItems:'center',
              color:'white', fontWeight:600, fontSize:11,
            }}>AO</div>
            <span style={{fontSize:13, fontWeight:500}}>Adaeze</span>
          </button>
        ) : (
          <div className="row" style={{gap:6, flexShrink:0}}>
            <button onClick={() => setLoggedIn(true)} className="btn btn-ghost btn-sm" style={{padding:'10px 14px'}}>
              Sign in
            </button>
            <button onClick={() => setLoggedIn(true)} className="btn btn-accent btn-sm" style={{padding:'10px 16px'}}>
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

/* ----- Theme toggle (segmented) ----- */
const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');

  useEffect(() => {
    const sync = (e) => setTheme(e.detail || document.documentElement.dataset.theme);
    window.addEventListener('theme-change', sync);
    return () => window.removeEventListener('theme-change', sync);
  }, []);

  const set = (t) => {
    document.documentElement.dataset.theme = t;
    setTheme(t);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: t }));
  };

  return (
    <div role="group" aria-label="Theme"
      style={{
        display:'inline-flex', alignItems:'center',
        padding:3, borderRadius:'var(--r-pill)',
        background:'var(--surface)', border:'1px solid var(--line)',
        position:'relative',
      }}>
      <button
        onClick={() => set('light')}
        aria-pressed={theme === 'light'}
        aria-label="Light mode"
        title="Light mode"
        style={{
          width:30, height:30, borderRadius:'50%',
          display:'grid', placeItems:'center',
          background: theme === 'light' ? 'var(--ink)' : 'transparent',
          color: theme === 'light' ? 'var(--bg-void)' : 'var(--ink-3)',
          transition:'background .2s, color .2s',
        }}>
        <Icon name="sun" size={14}/>
      </button>
      <button
        onClick={() => set('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Dark mode"
        title="Dark mode"
        style={{
          width:30, height:30, borderRadius:'50%',
          display:'grid', placeItems:'center',
          background: theme === 'dark' ? 'var(--ink)' : 'transparent',
          color: theme === 'dark' ? 'var(--bg-void)' : 'var(--ink-3)',
          transition:'background .2s, color .2s',
        }}>
        <Icon name="moon" size={14}/>
      </button>
    </div>
  );
};

/* ----- Live activity strip ----- */
const LiveTicker = () => (
  <div style={{
    overflow:'hidden',
    borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)',
    padding:'10px 0', background:'var(--bg-deep)',
  }}>
    <div className="marquee">
      {[...DATA.liveTicker, ...DATA.liveTicker].map((t, i) => (
        <span key={i} style={{display:'inline-flex', alignItems:'center', gap:10, fontSize:12.5, color:'var(--ink-2)'}}>
          <span className="dot dot-live" style={{color:'var(--accent)'}}/>
          <span>{t}</span>
          <span className="muted-2" style={{margin:'0 12px'}}>·</span>
        </span>
      ))}
    </div>
  </div>
);

/* ----- Section header ----- */
const SectionHead = ({ eyebrow, title, sub, cta, onCta }) => (
  <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, gap:24, flexWrap:'wrap'}}>
    <div>
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h2 className="h-2 text-gradient" style={{margin:0}}>{title}</h2>
      {sub && <p style={{color:'var(--ink-3)', fontSize:15, marginTop:8, maxWidth:520}}>{sub}</p>}
    </div>
    {cta && (
      <button className="btn btn-ghost btn-sm" onClick={onCta}>
        {cta} <Icon name="arrow" size={14}/>
      </button>
    )}
  </div>
);

/* ----- Event card ----- */
const EventCard = ({ e, size = "md" }) => {
  const { go } = useRoute();
  const w = size === "lg" ? 380 : size === "sm" ? 240 : size === "full" ? "100%" : 300;
  const h = size === "lg" ? 480 : size === "sm" ? 300 : 380;
  return (
    <article className="card card-hover" style={{ width: w, cursor:'pointer' }} onClick={() => go({ name:"event", id: e.id })}>
      <div className={`ph ${e.ph} ph-noise`} style={{ height: h * 0.6, position:'relative' }}>
        <div style={{position:'absolute', top:12, left:12, display:'flex', gap:6}}>
          {e.live && <span className="badge badge-live"><span className="dot" style={{background:'white'}}/>Live</span>}
          {e.vip && <span className="badge badge-vip">VIP</span>}
          {e.almostSold && <span className="badge" style={{background:'var(--danger)', color:'white'}}>Almost sold out</span>}
          {e.soon && <span className="badge badge-soon">On sale</span>}
        </div>
        <button className="icon-btn" style={{position:'absolute', top:12, right:12, background:'oklch(1 0 0 / .15)', borderColor:'transparent', color:'white', backdropFilter:'blur(10px)'}}
          onClick={(ev) => ev.stopPropagation()}>
          <Icon name="heart" size={15}/>
        </button>
        <div style={{position:'absolute', bottom:14, left:14, right:14, display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
          <div>
            <div className="mono text-xs" style={{color:'oklch(1 0 0 / .8)', letterSpacing:'.16em', textTransform:'uppercase'}}>{e.tag}</div>
            <div className="serif" style={{color:'white', fontSize: size==='lg' ? 30 : 22, lineHeight:1.05, marginTop:4, maxWidth:280}}>{e.title}</div>
          </div>
        </div>
      </div>
      <div style={{padding:'18px 18px 20px'}}>
        <div className="between mb-3">
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--ink-2)'}}>
            <Icon name="pin" size={13}/> {e.venue} · {e.city}
          </div>
          <div className="mono text-xs muted">{e.date}</div>
        </div>
        <div className="between">
          <div>
            <div className="text-xs muted">From</div>
            <div className="h-4 tnum" style={{marginTop:2}}>{formatNGN(e.priceFrom)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="text-xs muted">Countdown</div>
            <div className="mono text-sm accent-text" style={{marginTop:2}}>{e.countdown}</div>
          </div>
        </div>
        {/* Capacity bar */}
        <div style={{marginTop:14}}>
          <div style={{height:4, background:'var(--surface-2)', borderRadius:99, overflow:'hidden'}}>
            <div style={{
              width: `${Math.min(100, (e.attending / e.capacity) * 100)}%`,
              height:'100%',
              background: e.almostSold ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent), oklch(0.65 0.18 180))',
            }}/>
          </div>
          <div className="between mt-2">
            <span className="text-xs muted">{e.attending.toLocaleString()} attending</span>
            <span className="text-xs muted-2">{Math.round((e.attending/e.capacity)*100)}% sold</span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ----- Concert card (tall, cinematic) ----- */
const ConcertCard = ({ c, size = "md" }) => {
  const { go } = useRoute();
  const w = size === "full" ? "100%" : 320;
  return (
    <article className="card card-hover" style={{ width: w, cursor:'pointer' }} onClick={() => go({ name:"event", id: c.id })}>
      <div className={`ph ${c.ph} ph-noise`} style={{ height: 420, position:'relative' }}>
        {c.vip && <span className="badge badge-vip" style={{position:'absolute', top:12, right:12}}>VIP tier</span>}
        <div style={{
          position:'absolute', inset:0,
          background:'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .85) 100%)',
        }}/>
        <div style={{position:'absolute', left:18, right:18, bottom:18, color:'white'}}>
          <div className="mono text-xs" style={{opacity:.8, letterSpacing:'.18em'}}>{c.date.toUpperCase()} · {c.city.toUpperCase()}</div>
          <div className="h-1" style={{fontSize:38, marginTop:6, letterSpacing:'-0.04em'}}>{c.artist}</div>
          <div className="serif" style={{fontSize:18, opacity:.85, marginTop:2}}>{c.tour}</div>
          <div className="between mt-4">
            <span className="text-sm" style={{opacity:.8}}>{c.venue}</span>
            <span className="h-4 tnum">{formatNGN(c.priceFrom)}+</span>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ----- Footer ----- */
const Footer = () => {
  const { go } = useRoute();
  const cols = [
    { h:"Discover", items:[
      {l:"Events",    t:{name:"search"}},
      {l:"Concerts",  t:{name:"search"}},
      {l:"Theatre",   t:{name:"search"}},
      {l:"Cinema",    t:{name:"search"}},
      {l:"Festivals", t:{name:"search"}},
      {l:"Experiences", t:{name:"search"}},
    ]},
    { h:"Travel", items:[
      {l:"Flights",          t:{name:"flights"}},
      {l:"Bus Travel",       t:{name:"buses"}},
      {l:"Hotels",           t:{name:"hotels"}},
      {l:"Weekend Getaways", t:{name:"hotels"}},
      {l:"Vouchers",         t:{name:"home"}},
      {l:"Package Deals",    t:{name:"home"}},
    ]},
    { h:"Organizers", items:[
      {l:"Sell Tickets",   t:{name:"organizer"}},
      {l:"Promoter Hub",   t:{name:"organizer"}},
      {l:"API Access",     t:{name:"page", id:"partners"}},
      {l:"Payouts",        t:{name:"organizer"}},
      {l:"Analytics",      t:{name:"organizer"}},
      {l:"Onboarding",     t:{name:"organizer"}},
    ]},
    { h:"Company", items:[
      {l:"About Us",       t:{name:"page", id:"about"}},
      {l:"Careers",        t:{name:"page", id:"careers"}},
      {l:"Press",          t:{name:"page", id:"press"}},
      {l:"Trust & Safety", t:{name:"page", id:"trust"}},
      {l:"Partners",       t:{name:"page", id:"partners"}},
      {l:"Contact",        t:{name:"page", id:"contact"}},
    ]},
    { h:"Support", items:[
      {l:"Help Centre",      t:{name:"page", id:"contact"}},
      {l:"Buyer Protection", t:{name:"page", id:"trust"}},
      {l:"Refunds",          t:{name:"page", id:"trust"}},
      {l:"Privacy",          t:{name:"page", id:"trust"}},
      {l:"Terms",            t:{name:"page", id:"trust"}},
      {l:"Cookie Policy",    t:{name:"page", id:"trust"}},
    ]},
  ];
  return (
    <footer className="footer">
      <div className="stars" style={{opacity:.4}}/>
      <div className="wrap" style={{position:'relative'}}>
        <div style={{display:'grid', gridTemplateColumns:'1.5fr repeat(5, 1fr)', gap:48, marginBottom:64}}>
          <div>
            <Wordmark size={20}/>
            <p style={{color:'var(--ink-3)', fontSize:14, marginTop:16, maxWidth:280, lineHeight:1.55}}>
              Nigeria's premium digital ecosystem for entertainment, travel and experiences.
              Trusted by 1.2M+ Nigerians across Lagos, Abuja, Port Harcourt and beyond.
            </p>
            <div className="row mt-6 gap-2">
              <span className="pill-stat"><Icon name="shield" size={13}/> PCI-DSS certified</span>
              <span className="pill-stat"><Icon name="check" size={13}/> NDPR compliant</span>
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div className="eyebrow mb-4">{c.h}</div>
              <div className="col" style={{gap:10}}>
                {c.items.map(i => (
                  <a key={i.l} onClick={() => go(i.t)}
                    style={{fontSize:13.5, color:'var(--ink-2)', cursor:'pointer'}}>{i.l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:24, borderTop:'1px solid var(--line)', flexWrap:'wrap', gap:16}}>
          <div className="row gap-4" style={{alignItems:'center'}}>
            <span className="mono text-xs muted">© 2026 Computicket Nigeria Ltd. RC 2,847,193</span>
            <span className="muted-2">·</span>
            <span className="mono text-xs muted">Plot 12B, Adeola Odeku St., Victoria Island, Lagos</span>
          </div>
          <div className="row gap-3" style={{alignItems:'center'}}>
            <span className="mono text-xs muted">Payment partners</span>
            {["Paystack","Flutterwave","Verve","Mastercard","Visa","USSD"].map(p => (
              <span key={p} className="chip" style={{padding:'4px 10px', fontSize:11}}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

window.formatNGN = formatNGN;
window.TopNav = TopNav;
window.LiveTicker = LiveTicker;
window.SectionHead = SectionHead;
window.EventCard = EventCard;
window.ConcertCard = ConcertCard;
window.Footer = Footer;
window.RouterCtx = RouterCtx;
window.useRoute = useRoute;
