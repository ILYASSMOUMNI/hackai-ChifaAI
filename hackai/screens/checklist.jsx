// Procedure checklist screen — appointment prep with check-off tasks.

const ChecklistScreen = ({ go }) => {
  const { t, lang } = useI18n();

  const initial = [
    { id: 'cin',    icon: 'id-card',      title: { fr: 'Carte d’identité nationale', ar: 'بطاقة التعريف الوطنية', dr: 'Carte CIN' }, body: { fr: 'CIN ou passeport.', ar: 'CIN أو جواز السفر.', dr: 'CIN aw passeport.' }, done: true },
    { id: 'cnss',   icon: 'shield-check', title: { fr: 'Carte CNSS / AMO',          ar: 'بطاقة CNSS / AMO',        dr: 'CNSS / AMO' }, body: { fr: 'Pour le remboursement.', ar: 'لاسترداد التكاليف.', dr: 'Bach yterja3 l-flouss.' }, done: true },
    { id: 'rx',     icon: 'file-text',    title: { fr: 'Lettre du médecin',          ar: 'رسالة الطبيب',           dr: 'Wraq dyal tbib' }, body: { fr: 'Ordonnance ou demande de consultation.', ar: 'الوصفة أو طلب استشارة.', dr: 'Ordonnance / talab consultation.' }, done: false },
    { id: 'fast',   icon: 'utensils',     title: { fr: 'À jeun depuis 22 h',         ar: 'على الريق منذ العاشرة ليلاً', dr: '3la riq mn 22h' }, body: { fr: 'Eau autorisée seulement.', ar: 'الماء فقط مسموح.', dr: 'Ghir l-ma m7lol.' }, done: false },
    { id: 'meds',   icon: 'pill',         title: { fr: 'Liste des médicaments',     ar: 'قائمة الأدوية',           dr: 'Lista dyal dwa' }, body: { fr: 'Tout ce que vous prenez actuellement.', ar: 'كل ما تتناوله حالياً.', dr: 'Koullchi li kataakhod daba.' }, done: false },
    { id: 'family', icon: 'users',        title: { fr: 'Accompagnant',              ar: 'مرافق',                    dr: 'Wahd m3ak' }, body: { fr: 'Recommandé pour la première visite.', ar: 'مستحسن في الزيارة الأولى.', dr: 'Mzyan l ziyara loula.' }, done: false },
  ];

  const [items, setItems] = React.useState(initial);
  const total = items.length;
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / total) * 100);

  const toggle = id => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));

  const pickLang = (obj) => obj[lang] || obj.fr;

  return (
    <>
      <TopBar onBack={() => go('home')} title={t.checklist} />
      <ScrollArea className="px-4">
        {/* Appointment context card */}
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Icon name="calendar-clock" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">{t.appointment}</div>
              <div className="text-[15.5px] font-semibold text-ink-900">
                {lang === 'fr' ? 'Cardiologie · Dr. Bennani' : lang === 'ar' ? 'أمراض القلب · د. بناني' : 'Cardiologie · Dr. Bennani'}
              </div>
              <div className="text-[12.5px] text-ink-500 mt-0.5 flex items-center gap-1.5">
                <Icon name="map-pin" size={12} /> CHU Ibn Rochd · {lang === 'fr' ? 'Pavillon 4' : lang === 'ar' ? 'الجناح ٤' : 'Pavillon 4'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                {lang === 'fr' ? 'Mer' : lang === 'ar' ? 'الأربعاء' : 'Larba3'}
              </div>
              <div className="text-[22px] font-bold text-ink-900 leading-none">20</div>
              <div className="text-[10px] text-ink-500 mt-0.5">09:30</div>
            </div>
          </div>

          {/* progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-ink-500">{done} / {total}</span>
              <span className="text-[12px] font-semibold text-mint-600">{pct}% {lang === 'fr' ? 'prêt' : lang === 'ar' ? 'جاهز' : 'wajed'}</span>
            </div>
            <div className="h-2 rounded-full bg-paper-100 overflow-hidden">
              <div className="h-full bg-mint-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </Card>

        <SectionTitle action={<ReadAloud />}>{lang === 'fr' ? 'À préparer' : lang === 'ar' ? 'يجب التحضير' : 'Khasek twajjed'}</SectionTitle>

        <div className="space-y-2 mb-4">
          {items.map(it => (
            <button key={it.id} onClick={() => toggle(it.id)}
              className={`w-full text-start flex items-center gap-3 p-3 rounded-2xl border transition
              ${it.done ? 'bg-mint-50 border-mint-100' : 'bg-white border-paper-200 shadow-soft hover:bg-paper-50'}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0
                ${it.done ? 'bg-mint-500 text-white' : 'bg-paper-100 text-ink-700'}`}>
                <Icon name={it.done ? 'check' : it.icon} size={20} stroke={it.done ? 3 : 2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[14.5px] font-semibold leading-tight ${it.done ? 'text-ink-400 line-through' : 'text-ink-900'}`}>{pickLang(it.title)}</div>
                <div className="text-[12px] text-ink-500 mt-0.5">{pickLang(it.body)}</div>
              </div>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0
                ${it.done ? 'bg-mint-500 border-mint-500 text-white' : 'border-paper-300 bg-white'}`}>
                {it.done && <Icon name="check" size={14} stroke={3} />}
              </div>
            </button>
          ))}
        </div>

        {/* Route preview */}
        <SectionTitle>{lang === 'fr' ? 'Trajet à l’hôpital' : lang === 'ar' ? 'الطريق إلى المستشفى' : 'Triq l sbitar'}</SectionTitle>
        <Card className="p-3 mb-4">
          <div className="relative h-32 rounded-2xl overflow-hidden bg-paper-100">
            {/* mock map */}
            <svg viewBox="0 0 400 160" className="absolute inset-0 w-full h-full">
              <rect width="400" height="160" fill="#EAF0F7" />
              {[40, 80, 120].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#DCE5F0" strokeWidth="1" />
              ))}
              {[80, 160, 240, 320].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="160" stroke="#DCE5F0" strokeWidth="1" />
              ))}
              <path d="M 30 130 Q 80 90 140 110 T 260 70 T 370 40" stroke="#2E5BFF" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="30" cy="130" r="8" fill="#10B981" />
              <circle cx="30" cy="130" r="3" fill="white" />
              <circle cx="370" cy="40" r="10" fill="#E11D48" />
              <path d="M 366 36 L 374 36 M 370 32 L 370 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Icon name="navigation" size={16} className="text-sky-600" />
              <span className="text-[13px] font-semibold text-ink-900">CHU Ibn Rochd</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-ink-500">
              <span className="flex items-center gap-1"><Icon name="clock" size={12} /> 24 min</span>
              <span className="flex items-center gap-1"><Icon name="car" size={12} /> 12 km</span>
            </div>
          </div>
        </Card>

        <BigButton tone="sky" icon="route" onClick={() => go('guidance')}>
          {lang === 'fr' ? 'Suivre le parcours' : lang === 'ar' ? 'تابع المسار' : 'Tbe3 l-parcours'}
        </BigButton>

        <div className="h-3" />
      </ScrollArea>
    </>
  );
};

window.ChecklistScreen = ChecklistScreen;
