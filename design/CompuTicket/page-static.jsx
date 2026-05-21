/* ===== EDITORIAL INNER PAGE TEMPLATE =====
   Used for: About Us, Trust & Safety, Careers, Press, etc.
   Each editorial page composes these primitives in order. */

/* ---------- Section primitives ---------- */
const ContentHero = ({ eyebrow, title, lede }) => (
  <section className="nebula" style={{position:'relative', overflow:'hidden'}}>
    <div className="stars"/>
    <div style={{
      position:'absolute', top:-200, right:-150, width:600, height:600,
      background:'radial-gradient(circle, var(--accent-glow), transparent 60%)',
      filter:'blur(40px)', pointerEvents:'none',
    }}/>
    <div className="wrap" style={{paddingTop:80, paddingBottom:72, position:'relative'}}>
      <div style={{maxWidth: 880}}>
        <div className="eyebrow mb-4">{eyebrow}</div>
        <h1 className="h-1" style={{margin:0, fontSize:72, letterSpacing:'-0.04em', textWrap:'balance'}}>
          {title}
        </h1>
        {lede && (
          <p className="mt-6 serif" style={{
            fontSize:24, lineHeight:1.5, color:'var(--ink-2)',
            maxWidth: 700, textWrap:'pretty',
          }}>
            {lede}
          </p>
        )}
      </div>
    </div>
  </section>
);

const ContentBlock = ({ eyebrow, title, body, image, imagePosition = "right", imageCaption }) => (
  <section className="wrap section">
    <div style={{
      display:'grid',
      gridTemplateColumns: image ? (imagePosition === "left" ? 'minmax(0, 1fr) minmax(0, 1.2fr)' : 'minmax(0, 1.2fr) minmax(0, 1fr)') : 'minmax(0, 1fr)',
      gap: 64, alignItems:'center',
    }}>
      {image && imagePosition === "left" && <ImageCard ph={image} caption={imageCaption}/>}
      <div style={{maxWidth: image ? 'none' : 760}}>
        {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
        <h2 className="h-2 mb-4" style={{textWrap:'pretty'}}>{title}</h2>
        <div style={{fontSize:16, lineHeight:1.7, color:'var(--ink-2)', textWrap:'pretty'}}>
          {body}
        </div>
      </div>
      {image && imagePosition === "right" && <ImageCard ph={image} caption={imageCaption}/>}
    </div>
  </section>
);

const ImageCard = ({ ph, caption, aspect = "4/5" }) => (
  <div>
    <div className={`ph ${ph} ph-noise`} style={{aspectRatio: aspect, borderRadius:'var(--r-5)', position:'relative'}}>
      <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, transparent 50%, oklch(0 0 0 / .4))'}}/>
    </div>
    {caption && (
      <p className="text-xs muted mt-3 mono" style={{letterSpacing:'.06em', textTransform:'uppercase'}}>
        {caption}
      </p>
    )}
  </div>
);

const PillarsBlock = ({ eyebrow, title, sub, pillars, cols = null }) => (
  <section className="wrap section">
    <SectionHead eyebrow={eyebrow} title={title} sub={sub}/>
    <div style={{display:'grid', gridTemplateColumns:`repeat(${cols || pillars.length}, minmax(0, 1fr))`, gap:20}}>
      {pillars.map((p, i) => (
        <div key={i} className="card" style={{padding:28, position:'relative', overflow:'hidden'}}>
          <div style={{
            position:'absolute', top:-30, right:-30,
            width:120, height:120, borderRadius:'50%',
            background: p.color, opacity:.18, filter:'blur(28px)',
            pointerEvents:'none',
          }}/>
          <div style={{
            width:48, height:48, borderRadius:14,
            background: p.color, color:'white',
            display:'grid', placeItems:'center',
            boxShadow: `0 10px 24px -10px ${p.color}, inset 0 1px 0 oklch(1 0 0 / .25)`,
            marginBottom: 20, position:'relative',
          }}>
            <Icon name={p.icon} size={22} stroke={1.8}/>
          </div>
          <h3 className="h-3 mb-2">{p.title}</h3>
          <p className="text-sm" style={{color:'var(--ink-2)', lineHeight:1.6, textWrap:'pretty'}}>{p.body}</p>
        </div>
      ))}
    </div>
  </section>
);

const StatsStrip = ({ stats }) => (
  <section className="wrap" style={{padding: '32px 0'}}>
    <div className="card" style={{padding:'40px 32px', borderRadius:'var(--r-4)'}}>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${stats.length}, minmax(0, 1fr))`, gap:32}}>
        {stats.map((s, i) => (
          <div key={i} style={{borderLeft: i ? '1px solid var(--line)' : 'none', paddingLeft: i ? 32 : 0}}>
            <div className="h-display tnum" style={{fontSize:52, lineHeight:1, letterSpacing:'-0.04em'}}>{s.n}</div>
            <div className="text-sm muted mt-2" style={{textWrap:'pretty'}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TimelineBlock = ({ eyebrow, title, sub, items }) => (
  <section className="wrap section">
    <SectionHead eyebrow={eyebrow} title={title} sub={sub}/>
    <div style={{display:'grid', gridTemplateColumns:'200px minmax(0, 1fr)', gap:48}}>
      <div className="muted text-sm mono" style={{position:'sticky', top:96, alignSelf:'flex-start', letterSpacing:'.08em'}}>
        {items.length} milestones<br/>
        {items[0].year}—{items[items.length-1].year}
      </div>
      <div className="col gap-3">
        {items.map((it, i) => (
          <div key={i} className="card" style={{padding:28, display:'grid', gridTemplateColumns:'auto minmax(0, 1fr)', gap:32, alignItems:'flex-start'}}>
            <div className="h-display tnum accent-text" style={{fontSize:44, lineHeight:1, letterSpacing:'-0.04em'}}>{it.year}</div>
            <div>
              <h4 className="h-3">{it.title}</h4>
              <p className="text-sm muted mt-2" style={{lineHeight:1.65, textWrap:'pretty'}}>{it.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TeamBlock = ({ eyebrow, title, sub, people }) => (
  <section className="wrap section">
    <SectionHead eyebrow={eyebrow} title={title} sub={sub}/>
    <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:20}}>
      {people.map((p, i) => (
        <div key={i}>
          <div className={`ph ${p.ph} ph-noise`} style={{aspectRatio:'1', borderRadius:'var(--r-4)', position:'relative'}}/>
          <h4 className="h-4 mt-4">{p.name}</h4>
          <div className="text-sm muted mt-1">{p.role}</div>
          {p.from && <div className="text-xs muted-2 mt-1">Previously · {p.from}</div>}
        </div>
      ))}
    </div>
  </section>
);

const FAQBlock = ({ eyebrow, title, items }) => {
  const [open, setOpen] = useState(0);
  return (
    <section className="wrap section">
      <SectionHead eyebrow={eyebrow} title={title}/>
      <div style={{maxWidth: 820}}>
        <div className="col gap-2">
          {items.map((q, i) => (
            <div key={i} className="card" style={{padding:0, overflow:'hidden'}}>
              <button onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width:'100%', padding:'20px 24px',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  textAlign:'left', cursor:'pointer', gap:16,
                }}>
                <span className="h-4">{q.q}</span>
                <Icon name={open === i ? "minus" : "plus"} size={18} stroke={2}/>
              </button>
              {open === i && (
                <div style={{padding:'0 24px 24px', color:'var(--ink-2)', fontSize:15, lineHeight:1.7, textWrap:'pretty'}}>
                  {q.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContentCTA = ({ eyebrow, title, sub, primary, secondary, onPrimary, onSecondary }) => (
  <section className="wrap section">
    <div className="card" style={{
      position:'relative', overflow:'hidden',
      background:'linear-gradient(135deg, oklch(0.16 0.10 152), oklch(0.14 0.10 180))',
      border:'1px solid oklch(1 0 0 / .08)',
      padding:'72px 56px',
      textAlign:'center',
    }}>
      <div className="stars" style={{opacity:.6}}/>
      <div style={{position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:600,
        background:'radial-gradient(circle, var(--accent-glow), transparent 60%)', filter:'blur(40px)', pointerEvents:'none',
      }}/>
      <div style={{position:'relative', maxWidth:680, margin:'0 auto'}}>
        {eyebrow && <div className="eyebrow mb-4" style={{color:'var(--accent)'}}>{eyebrow}</div>}
        <h2 className="h-1" style={{color:'white', fontSize:56, margin:0, textWrap:'balance'}}>{title}</h2>
        {sub && <p className="mt-6" style={{color:'oklch(1 0 0 / .75)', fontSize:18, maxWidth:520, margin:'24px auto 0', lineHeight:1.6, textWrap:'pretty'}}>{sub}</p>}
        <div className="row mt-8 gap-3" style={{justifyContent:'center'}}>
          {primary && <button className="btn btn-accent btn-lg" onClick={onPrimary}>{primary} <Icon name="arrow" size={14}/></button>}
          {secondary && <button className="btn btn-glass btn-lg" style={{color:'white'}} onClick={onSecondary}>{secondary}</button>}
        </div>
      </div>
    </div>
  </section>
);

/* ---------- Sub-nav for editorial pages ---------- */
const ContentSubNav = ({ pageId }) => {
  const { go } = useRoute();
  const tabs = [
    { id:"about",    l:"About" },
    { id:"trust",    l:"Trust & Safety" },
    { id:"careers",  l:"Careers" },
    { id:"press",    l:"Press" },
    { id:"partners", l:"Partners" },
    { id:"contact",  l:"Contact" },
  ];
  return (
    <div style={{
      borderBottom:'1px solid var(--line)',
      background:'var(--bg-deep)',
      position:'sticky', top:'var(--nav-h)', zIndex:30,
      backdropFilter:'blur(20px) saturate(140%)',
    }}>
      <div className="wrap">
        <div style={{display:'flex', alignItems:'center', gap:0, overflowX:'auto'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => go({ name:"page", id: t.id })}
              style={{
                padding:'18px 4px',
                marginRight:28,
                borderBottom: pageId === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                color: pageId === t.id ? 'var(--ink)' : 'var(--ink-3)',
                fontSize:14, fontWeight: pageId === t.id ? 600 : 500,
                whiteSpace:'nowrap',
                transition: 'color .15s',
              }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   PAGES
   ========================================================= */

const AboutPage = () => {
  const { go } = useRoute();
  return (
    <div className="page-enter">
      <ContentSubNav pageId="about"/>

      <ContentHero
        eyebrow="About Computicket NG"
        title="Built in Lagos. For everywhere you'd rather be."
        lede="We are Nigeria's premium digital ecosystem for entertainment, travel and experiences — designed to make every booking feel as good as the moment it unlocks."
      />

      <StatsStrip stats={[
        {n:"1.2M+",   l:"Tickets sold this year"},
        {n:"2,400+",  l:"Events on-platform"},
        {n:"38",      l:"Airlines & operators"},
        {n:"99.97%",  l:"Booking success rate"},
      ]}/>

      <ContentBlock
        eyebrow="Our story"
        title="The Apple, Airbnb and Ticketmaster of Africa — built by Nigerians for the world."
        image="ph-1"
        imageCaption="Lagos, May 2026 · Headquarters at Adeola Odeku"
        body={
          <>
            <p>Computicket NG started in a Yaba co-working space in 2021 with a stubborn belief: Nigerians deserve a booking experience that doesn't just <em>work</em> — it should feel like a luxury.</p>
            <p className="mt-4">Five years later, we power ticketing for the country's biggest concerts, the largest organizer hubs in West Africa, and a flight-and-stay marketplace that 1.2 million Nigerians trust every year.</p>
            <p className="mt-4">We are still a Lagos company — and still stubborn.</p>
          </>
        }
      />

      <PillarsBlock
        eyebrow="What we stand for"
        title="Four principles that shape every product decision."
        pillars={[
          { icon:"shield",  title:"Trust by default",     body:"Every transaction is insured, every QR is verified, every refund is processed in 48 hours. Trust is not a feature.", color:"oklch(0.62 0.18 152)" },
          { icon:"sparkle", title:"Intelligent, not noisy", body:"Compass AI personalises without surveilling. Suggestions you'd actually take — never spam, never sold.", color:"oklch(0.60 0.16 230)" },
          { icon:"bolt",    title:"Naija-fast",           body:"Optimised for 2G. Cached offline. USSD-friendly. Built for real Nigerian network realities — not Silicon Valley fiber.", color:"oklch(0.65 0.20 25)" },
          { icon:"heart",   title:"Built with culture",   body:"From Afrobeats to Owambe to Detty December — we are not just a platform for Nigerian life; we're built inside it.", color:"oklch(0.55 0.18 305)" },
        ]}
      />

      <ContentBlock
        eyebrow="The team"
        title="A small group of Nigerians obsessed with how this country has fun."
        imagePosition="left"
        image="ph-5"
        imageCaption="Engineering offsite · Lekki Conservation Centre"
        body={
          <>
            <p>We are 84 people across Lagos, Abuja, Port Harcourt and Cape Town. About a third of us were customers first.</p>
            <p className="mt-4">Our investors include Africa-focused venture funds like Future Africa and TLcom, plus a handful of operators from Paystack, Flutterwave, and Spotify.</p>
            <p className="mt-4">We are hiring — engineers, designers, organizer success, and a few very specific roles in fraud and AI safety.</p>
          </>
        }
      />

      <TimelineBlock
        eyebrow="Milestones"
        title="Five years, one country, a few rooftops."
        items={[
          { year:"2021", title:"Founded in a co-working space",     body:"Three founders, two laptops, one stubborn thesis. Sold 47 tickets in our first month — to a comedy show at Terra Kulture." },
          { year:"2022", title:"₦1B GMV. First Lagos sell-out.",   body:"Powered the entire ticketing for Asake's debut Lagos show. Crashed our servers twice. Learned a lot." },
          { year:"2023", title:"Compass AI · early access",         body:"Quietly launched our personalisation engine. Conversion went up 38%. The team realised we had built something rare." },
          { year:"2024", title:"Flights, stays and Detty December", body:"Expanded into travel. Powered 22% of Detty December bookings in Lagos. Hit 1M downloads on Android." },
          { year:"2026", title:"The premium booking layer of Africa", body:"Now operating across 6 Nigerian states. Pilots launching in Accra, Nairobi and Johannesburg by Q4." },
        ]}
      />

      <TeamBlock
        eyebrow="Leadership"
        title="The team behind the platform."
        people={[
          { name:"Adaeze Okafor",    role:"Co-founder, CEO",     from:"Paystack", ph:"ph-2" },
          { name:"Tobi Adesanya",    role:"Co-founder, CTO",     from:"Flutterwave", ph:"ph-7" },
          { name:"Chika Nwankwo",    role:"VP Product",          from:"Spotify", ph:"ph-3" },
          { name:"Emeka Balogun",    role:"Head of Trust & Safety", from:"Interpol Cyber", ph:"ph-4" },
        ]}
      />

      <ContentCTA
        eyebrow="Join us"
        title="We're hiring — across product, engineering and creative."
        sub="84 people. 12 open roles. One mission to make Nigerian booking feel like Apple, Airbnb and Ticketmaster combined."
        primary="See open roles"
        secondary="Read engineering blog"
        onPrimary={() => go({ name:"page", id:"careers" })}
      />
    </div>
  );
};

const TrustPage = () => {
  const { go } = useRoute();
  return (
    <div className="page-enter">
      <ContentSubNav pageId="trust"/>

      <ContentHero
        eyebrow="Trust & Safety"
        title="Your booking is protected end-to-end."
        lede="Every payment is insured, every ticket is QR-verified, every refund is guaranteed. Here's exactly how we keep your money, your data, and your night out safe."
      />

      <StatsStrip stats={[
        {n:"₦0",       l:"Lost to fraud in 2025"},
        {n:"<48h",     l:"Median refund time"},
        {n:"AES-256",  l:"Encryption at rest & transit"},
        {n:"24/7",     l:"WhatsApp support response"},
      ]}/>

      <PillarsBlock
        eyebrow="Six layers of protection"
        title="Defence in depth — from your phone to the venue gate."
        cols={3}
        pillars={[
          { icon:"shield",  title:"Buyer Protection",       body:"100% refund if an event is cancelled or significantly changed. No questions asked, no forms to fill — just one tap in your wallet.", color:"oklch(0.62 0.18 152)" },
          { icon:"qr",      title:"Verified QR tickets",    body:"Each ticket carries a rotating, device-bound QR. Scalpers can't duplicate it. Bots can't farm it. Every scan is logged in real time.", color:"oklch(0.60 0.16 230)" },
          { icon:"lock",    title:"Bank-grade payments",    body:"PCI-DSS Level 1 certified. 3-D Secure on every card. OTP and biometric verification. Nothing leaves your phone unencrypted.", color:"oklch(0.65 0.15 75)" },
          { icon:"wallet",  title:"Escrow & NDIC cover",    body:"Organizer payouts sit in NDIC-insured escrow until the event delivers. Your money is never co-mingled with anyone's runway.", color:"oklch(0.55 0.18 305)" },
          { icon:"check",   title:"NDPR compliant",         body:"We are registered with the Nigerian Data Protection Bureau. Your data is yours — we never sell it, and you can export or delete it anytime.", color:"oklch(0.62 0.14 200)" },
          { icon:"sparkle", title:"AI fraud sentinel",      body:"Compass watches every transaction in real time. Suspicious patterns are flagged in under 200ms — without slowing legitimate buyers.", color:"oklch(0.65 0.20 25)" },
        ]}
      />

      <ContentBlock
        eyebrow="Buyer Protection"
        title="If your event cancels, we refund — instantly."
        image="ph-3"
        imageCaption="QR ticket vault · Compass app"
        body={
          <>
            <p>You should never have to chase a refund. When an organizer cancels or significantly changes an event, we automatically credit your Computicket wallet within 48 hours — usually within minutes.</p>
            <p className="mt-4"><strong>What's covered:</strong> Full ticket value, including service fees and VAT. Travel and hotel bookings purchased through Computicket bundles are covered up to ₦500,000.</p>
            <p className="mt-4"><strong>What's not:</strong> Personal change-of-mind. Acts of God impacting individual ticket use (we recommend the optional ₦600 travel insurance add-on at checkout).</p>
          </>
        }
      />

      <ContentBlock
        eyebrow="Reporting & response"
        title="A real human responds in under 5 minutes — on WhatsApp."
        imagePosition="left"
        image="ph-4"
        imageCaption="Trust & Safety operations · Lagos"
        body={
          <>
            <p>We staff our Trust & Safety operations 24/7 across Lagos and Abuja. Report a problem via the in-app shield icon, WhatsApp <span className="mono">+234 802 COMPASS</span>, or email <span className="mono">trust@computicket.ng</span>.</p>
            <p className="mt-4">Our median first-response time on WhatsApp is 4 minutes 20 seconds. Median resolution time is 12 hours for ticket issues, 48 hours for refund cases.</p>
            <p className="mt-4">If we cannot resolve your issue, the Lagos State Consumer Protection Council and the FCCPC have escalation paths we proactively support.</p>
          </>
        }
      />

      <FAQBlock
        eyebrow="Frequently asked"
        title="Common questions about safety."
        items={[
          { q:"How do I know a ticket is real?",
            a:<>Every Computicket ticket has a rotating QR that only validates against our server in real time. If you bought outside Computicket, look for the green verification badge in the wallet — if it's missing, the ticket is not legitimate. We'll never charge you to "verify" a ticket.</> },
          { q:"What happens if my QR doesn't scan at the gate?",
            a:<>Open your ticket in the app — the QR auto-refreshes every 30 seconds. If it still won't scan, the gate staff have a backup lookup via your phone number. Worst case, our 24/7 WhatsApp line will release a one-time bypass code in under 60 seconds.</> },
          { q:"Are organizer payouts safe?",
            a:<>Yes. All organizer revenue sits in NDIC-insured escrow with Wema Bank until the event delivers. Payouts release automatically 24 hours after gates close, after we reconcile scan counts. This protects buyers from fly-by-night operators.</> },
          { q:"How is my personal data used?",
            a:<>We use your data only to power your bookings and personalisation. We never sell it. You can export everything we hold on you from Settings → Privacy → Export, and delete your account permanently from the same screen. We are registered with the NDPB (registration #NDPB-2023-04812).</> },
          { q:"What if I'm scammed off-platform?",
            a:<>If someone sells you a ticket via DM, WhatsApp or social media claiming it's a Computicket ticket — it almost certainly isn't. Send us a screenshot via the in-app shield and we'll investigate. Note: tickets bought off-platform aren't covered by Buyer Protection.</> },
        ]}
      />

      <ContentCTA
        eyebrow="Report something"
        title="See something off? Tell us in one tap."
        sub="Suspicious organizer, fake ticket on social media, account compromise — we move fast and we keep you informed every step."
        primary="Report on WhatsApp"
        secondary="Email Trust & Safety"
      />
    </div>
  );
};

const PageNotReady = ({ pageId }) => {
  const titles = {
    careers: "Careers", press: "Press", partners: "Partners", contact: "Contact",
  };
  return (
    <div className="page-enter">
      <ContentSubNav pageId={pageId}/>
      <ContentHero
        eyebrow={titles[pageId] || "Page"}
        title={`${titles[pageId] || 'This page'} — coming next.`}
        lede="This editorial template applies to every static inner page. About and Trust & Safety are live. The rest will use this same template."
      />
    </div>
  );
};

const PageStatic = ({ id }) => {
  switch (id) {
    case "trust":   return <TrustPage/>;
    case "about":
    default:        if (["careers","press","partners","contact"].includes(id)) return <PageNotReady pageId={id}/>;
                    return <AboutPage/>;
  }
};

window.PageStatic = PageStatic;
