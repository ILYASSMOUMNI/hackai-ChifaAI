// Patient guidance result screen — step-by-step in-hospital journey.

const GuidanceScreen = ({ go }) => {
  const { t, lang } = useI18n();
  const [active, setActive] = React.useState(1); // 0..N

  const steps = [
    { icon: 'door-open',    title: { fr: 'Entrée principale',         ar: 'المدخل الرئيسي',     dr: 'Bab l-kbir' },         body: { fr: 'Présentez‑vous au guichet d’accueil.', ar: 'توجه إلى مكتب الاستقبال.', dr: 'Sir l guichet d\'accueil.' } },
    { icon: 'ticket',       title: { fr: 'Ticket d’admission',         ar: 'تذكرة القبول',        dr: 'Ticket d\'admission' }, body: { fr: 'Donnez votre nom + CNSS. Récupérez un ticket.', ar: 'أعطِ اسمك + CNSS وخذ التذكرة.', dr: '3tihom l-isem dyalek + CNSS, w khoud ticket.' } },
    { icon: 'arrow-up',     title: { fr: 'Cardiologie — Étage 2',      ar: 'أمراض القلب — الطابق ٢', dr: 'Cardiologie — Etage 2' }, body: { fr: 'Ascenseur B, salle 204.', ar: 'المصعد B، غرفة ٢٠٤.', dr: 'Asanseur B, qaa 204.' } },
    { icon: 'armchair',     title: { fr: 'Salle d’attente',            ar: 'قاعة الانتظار',       dr: 'Qa3a l-intidar' },     body: { fr: 'Attendez que votre numéro s’affiche.', ar: 'انتظر حتى يظهر رقمك.', dr: 'Tsenna hetta y3ber numéro dyalek.' } },
    { icon: 'stethoscope',  title: { fr: 'Consultation',               ar: 'الاستشارة',           dr: 'Consultation' },        body: { fr: 'Le médecin vous appellera.', ar: 'سيناديك الطبيب.', dr: 'Tbib ghadi y3ayyet 3lik.' } },
    { icon: 'pill',         title: { fr: 'Pharmacie (si ordonnance)',  ar: 'الصيدلية (إن وُجدت)', dr: 'Fermassian (ila kan)' },body: { fr: 'Rez-de-chaussée, à droite.', ar: 'الطابق الأرضي، يمين.', dr: 'Rez-de-chaussée, lyamen.' } },
  ];

  const pick = (o) => o[lang] || o.fr;

  return (
    <>
      <TopBar onBack={() => go('checklist')} title={lang === 'fr' ? 'Mon parcours' : lang === 'ar' ? 'مساري' : 'L-parcours dyali'} />
      <ScrollArea className="px-4">
        {/* Top context strip */}
        <Card className="mt-4 p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ink-900 text-white flex items-center justify-center">
            <Icon name="hospital" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-semibold text-ink-900 leading-tight">CHU Ibn Rochd · Casablanca</div>
            <div className="text-[12px] text-ink-500 mt-0.5">{lang === 'fr' ? 'Cardiologie · Mer. 20 mai · 09:30' : lang === 'ar' ? 'أمراض القلب · الأربعاء ٢٠ ماي · 09:30' : 'Cardiologie · Larba3 20 may · 09:30'}</div>
          </div>
          <ReadAloud label="" />
        </Card>

        {/* Current step large card */}
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-sky-500 to-sky-700 text-white p-5 shadow-pop relative overflow-hidden fade-up" key={active}>
          <div className="absolute -top-12 -end-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Pill tone="paper">{t.step} {active + 1} / {steps.length}</Pill>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
                <Icon name={steps[active].icon} size={32} stroke={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[20px] font-bold leading-tight">{pick(steps[active].title)}</div>
                <div className="text-[13px] text-white/85 mt-1">{pick(steps[active].body)}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}
                className="h-11 rounded-xl bg-white/20 text-white font-semibold text-[13.5px] inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
                <Icon name="chevron-left" size={16} /> {lang === 'fr' ? 'Précédent' : lang === 'ar' ? 'السابق' : 'Li qbel'}
              </button>
              <button onClick={() => setActive(Math.min(steps.length - 1, active + 1))} disabled={active === steps.length - 1}
                className="h-11 rounded-xl bg-white text-sky-700 font-semibold text-[13.5px] inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
                {lang === 'fr' ? 'Suivant' : lang === 'ar' ? 'التالي' : 'Li jay'} <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <SectionTitle>{lang === 'fr' ? 'Toutes les étapes' : lang === 'ar' ? 'كل الخطوات' : 'Koul l-khotwat'}</SectionTitle>
        <Card className="p-2.5 mb-3">
          <div className="relative">
            {/* vertical line */}
            <div className="absolute start-[22px] top-2 bottom-2 w-0.5 bg-paper-200" />
            {steps.map((s, i) => {
              const done = i < active;
              const current = i === active;
              return (
                <button key={i} onClick={() => setActive(i)}
                  className="w-full relative flex items-start gap-3 p-2 rounded-2xl hover:bg-paper-50">
                  <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-soft
                    ${done ? 'bg-mint-500 text-white' : current ? 'bg-sky-500 text-white ring-4 ring-sky-100' : 'bg-white border border-paper-200 text-ink-500'}`}>
                    <Icon name={done ? 'check' : s.icon} size={18} stroke={done ? 3 : 2.2} />
                  </div>
                  <div className="flex-1 min-w-0 text-start py-1">
                    <div className={`text-[14px] font-semibold leading-tight ${current ? 'text-ink-900' : done ? 'text-ink-400' : 'text-ink-700'}`}>
                      {pick(s.title)}
                    </div>
                    <div className="text-[12px] text-ink-400 mt-0.5">{pick(s.body)}</div>
                  </div>
                  {current && <Pill tone="sky" icon="dot">{lang === 'fr' ? 'Ici' : lang === 'ar' ? 'هنا' : 'Hna'}</Pill>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Fallback */}
        <div className="rounded-2xl bg-paper-100 border border-paper-200 p-3 flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-white border border-paper-200 flex items-center justify-center text-ink-700">
            <Icon name="user-round" size={20} />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-ink-900">{t.talkHuman}</div>
            <div className="text-[12px] text-ink-500">{lang === 'fr' ? 'Accueil : Pavillon central, 24/24.' : lang === 'ar' ? 'الاستقبال: الجناح المركزي، ٢٤/٢٤.' : 'Accueil: Pavillon mrkzi, 24/24.'}</div>
          </div>
          <button className="h-10 px-3 rounded-full bg-ink-900 text-white text-[13px] font-semibold inline-flex items-center gap-2">
            <Icon name="phone" size={14} /> {lang === 'fr' ? 'Appeler' : lang === 'ar' ? 'اتصل' : '3ayyet'}
          </button>
        </div>

        <div className="h-3" />
      </ScrollArea>
    </>
  );
};

window.GuidanceScreen = GuidanceScreen;
