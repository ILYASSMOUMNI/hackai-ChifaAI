// Landing screen — hero, primary actions, quick action grid, accessibility note.

const LandingScreen = ({ go }) => {
  const { t, lang } = useI18n();

  const quickActions = [
    { id: 'helpNow',      icon: 'life-buoy',    tone: 'sky',   key: 'helpNow' },
    { id: 'findDept',     icon: 'map-pin',      tone: 'mint',  key: 'findDept' },
    { id: 'prepDocs',     icon: 'file-text',    tone: 'navy',  key: 'prepDocs' },
    { id: 'understandRx', icon: 'pill',         tone: 'sky',   key: 'understandRx' },
    { id: 'bookAppt',     icon: 'calendar-clock', tone: 'mint',key: 'bookAppt' },
    { id: 'emergencyHelp',icon: 'siren',        tone: 'alert', key: 'emergencyHelp' },
  ];

  return (
    <>
      <TopBar />
      <ScrollArea className="px-4 pb-4">
        {/* HERO */}
        <section className="mt-4 mb-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-[#163E6E] text-white p-5 shadow-card">
            {/* decorative blobs */}
            <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-sky-500/30 blur-2xl" />
            <div className="absolute -bottom-12 -start-10 w-44 h-44 rounded-full bg-mint-500/20 blur-2xl" />
            <div className="relative">
              <Pill tone="sky" icon="badge-check">{t.appName} · v1.0</Pill>
              <h1 className={`mt-3 text-[26px] leading-[1.15] font-bold ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {t.tagline}
              </h1>
              <p className="mt-2 text-[14px] text-white/80 leading-snug">
                {t.heroSub}
              </p>

              <div className="mt-5 space-y-2.5">
                <BigButton tone="sky" icon="mic" onClick={() => go('voice')}>{t.startVoice}</BigButton>
              </div>
            </div>
          </div>
        </section>

        {/* THREE PILLAR CARDS */}
        <section className="grid grid-cols-2 gap-2.5 mb-5">
          {[
            { icon: 'mic', label: t.speak,     sub: t.speakDesc,     tone: 'sky'  },
            { icon: 'route', label: t.getGuided, sub: t.guidedDesc, tone: 'navy' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-paper-200 shadow-soft p-3 text-center">
              <div className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center mb-2
                ${c.tone === 'sky' ? 'bg-sky-50 text-sky-600' : c.tone === 'mint' ? 'bg-mint-50 text-mint-600' : 'bg-ink-900/5 text-ink-900'}`}>
                <Icon name={c.icon} size={22} stroke={2.2} />
              </div>
              <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">{c.label}</div>
              <div className="text-[10.5px] text-ink-400 mt-1 leading-tight">{c.sub}</div>
            </div>
          ))}
        </section>

        {/* QUICK ACTIONS */}
        <SectionTitle action={<button className="text-[12px] font-semibold text-sky-600 inline-flex items-center gap-1" onClick={() => go('voice')}>{t.askVoice} <Icon name="arrow-right" size={14} /></button>}>
          {t.quickActions}
        </SectionTitle>

        <div className="space-y-2 mb-5">
          {quickActions.map(a => (
            <ActionTile
              key={a.id}
              icon={a.icon}
              tone={a.tone}
              title={t[a.key]}
              onClick={() => {
                if (a.id === 'emergencyHelp') go('emergency');
                else if (a.id === 'prepDocs' || a.id === 'understandRx') go('checklist');
                else if (a.id === 'bookAppt' || a.id === 'findDept' || a.id === 'helpNow') go('checklist');
                else go('voice');
              }}
            />
          ))}
        </div>

        {/* ACCESSIBILITY */}
        <section className="mb-4">
          <div className="rounded-3xl bg-mint-50 border border-mint-100 p-4 flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-mint-500 text-white flex items-center justify-center shrink-0">
              <Icon name="accessibility" size={22} stroke={2.2} />
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold text-ink-900">{t.forEveryone}</div>
              <div className="text-[12.5px] text-ink-500 mt-0.5">{t.forEveryoneSub}</div>
            </div>
          </div>
        </section>

        <Disclaimer />

        <div className="h-2" />
      </ScrollArea>
    </>
  );
};

window.LandingScreen = LandingScreen;
