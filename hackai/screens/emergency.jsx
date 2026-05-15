// Emergency information screen — calm, clear, action-oriented.

const EmergencyScreen = ({ go }) => {
  const { t, lang } = useI18n();

  const numbers = [
    { label: { fr: 'SAMU', ar: 'الإسعاف', dr: 'SAMU' },              num: '141', icon: 'ambulance', tone: 'alert' },
    { label: { fr: 'Police', ar: 'الشرطة', dr: 'Bolissa' },           num: '19',  icon: 'shield', tone: 'navy' },
    { label: { fr: 'Pompiers', ar: 'المطافئ', dr: 'Tafa l-7arik' },   num: '15',  icon: 'flame',     tone: 'amber' },
  ];

  const signs = [
    { icon: 'heart-pulse', label: { fr: 'Douleur thoracique', ar: 'ألم في الصدر',       dr: 'Wj3 f sder' } },
    { icon: 'wind',        label: { fr: 'Difficulté à respirer', ar: 'صعوبة في التنفس', dr: 'S3ouba f tnaffos' } },
    { icon: 'brain',       label: { fr: 'Perte de conscience',  ar: 'فقدان الوعي',     dr: 'Khsara dyal l-wa3i' } },
    { icon: 'droplet',     label: { fr: 'Saignement fort',      ar: 'نزيف حاد',        dr: 'Dam bzzaf' } },
    { icon: 'thermometer-sun', label: { fr: 'Fièvre très élevée', ar: 'حمى مرتفعة جداً', dr: 'Skhana 3aliya bzzaf' } },
    { icon: 'baby',        label: { fr: 'Enfant inanimé',       ar: 'طفل فاقد للوعي',  dr: 'Drari ma kayt7arrekch' } },
  ];

  const pick = (o) => o[lang] || o.fr;

  return (
    <>
      <TopBar onBack={() => go('home')} title={t.sos} />
      <ScrollArea className="px-4">
        {/* Big alert hero */}
        <div className="mt-4 rounded-3xl bg-alert-500 text-white p-5 shadow-card relative overflow-hidden">
          <div className="absolute -bottom-10 -end-8 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon name="siren" size={28} stroke={2.2} />
              </div>
              <div>
                <div className="text-[12px] uppercase tracking-wider font-semibold text-white/80">{t.emergencyTitle}</div>
                <div className="text-[22px] font-bold leading-tight">{t.emergencySub}</div>
              </div>
            </div>
            <a href="tel:141" className="mt-5 h-16 rounded-2xl bg-white text-alert-600 font-bold text-[20px] inline-flex w-full items-center justify-center gap-3 shadow-soft active:scale-[0.99]">
              <Icon name="phone-call" size={26} stroke={2.4} />
              {t.emergencyCall} · 141
            </a>
          </div>
        </div>

        {/* Numbers */}
        <SectionTitle>{lang === 'fr' ? 'Numéros utiles' : lang === 'ar' ? 'أرقام مفيدة' : 'Numeros mhimmin'}</SectionTitle>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {numbers.map((n, i) => {
            const tones = {
              alert: 'bg-alert-50 text-alert-600 border-alert-100',
              navy:  'bg-ink-900/5 text-ink-900 border-paper-200',
              amber: 'bg-amber-50 text-amber-500 border-amber-100',
            };
            return (
              <a key={i} href={`tel:${n.num}`} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border ${tones[n.tone]} active:scale-[0.99]`}>
                <Icon name={n.icon} size={26} stroke={2.2} />
                <div className="text-[12.5px] font-semibold text-ink-900">{pick(n.label)}</div>
                <div className="text-[18px] font-bold leading-none">{n.num}</div>
              </a>
            );
          })}
        </div>

        {/* Warning signs */}
        <SectionTitle action={<ReadAloud />}>{lang === 'fr' ? 'Signes d’urgence' : lang === 'ar' ? 'علامات الطوارئ' : 'Signes dyal tawari2'}</SectionTitle>
        <Card className="p-2 mb-3">
          <div className="grid grid-cols-2 gap-1">
            {signs.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-paper-50">
                <div className="w-10 h-10 rounded-xl bg-alert-50 text-alert-600 flex items-center justify-center shrink-0">
                  <Icon name={s.icon} size={20} stroke={2.2} />
                </div>
                <div className="text-[13px] font-semibold text-ink-900 leading-tight">{pick(s.label)}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Calm guidance */}
        <Card className="p-4 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Icon name="heart-handshake" size={20} stroke={2.2} />
            </div>
            <div>
              <div className="text-[14.5px] font-semibold text-ink-900">
                {lang === 'fr' ? 'Restez calme' : lang === 'ar' ? 'ابقَ هادئاً' : 'B9a hadi'}
              </div>
              <div className="text-[13px] text-ink-500 mt-1 leading-snug">
                {lang === 'fr' ? 'Respirez lentement. Indiquez clairement votre adresse à l’opérateur. Ne raccrochez pas avant qu’on vous le dise.' :
                 lang === 'ar' ? 'تنفس ببطء. أعطِ عنوانك بوضوح. لا تنهِ المكالمة قبل أن يُطلب منك ذلك.' :
                 'Tnaffes b chwiya. 3ti l-3onwan b nichan. Matktayyech telephone hetta ygolouk.'}
              </div>
            </div>
          </div>
        </Card>

        {/* Nearest hospital */}
        <SectionTitle>{lang === 'fr' ? 'Hôpital le plus proche' : lang === 'ar' ? 'أقرب مستشفى' : 'Sbitar l-9rib'}</SectionTitle>
        <Card className="p-3 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-mint-500 text-white flex items-center justify-center">
            <Icon name="hospital" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-semibold text-ink-900">CHU Ibn Rochd</div>
            <div className="text-[12.5px] text-ink-500 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1"><Icon name="map-pin" size={12} /> 2.4 km</span>
              <span className="text-ink-300">·</span>
              <span className="flex items-center gap-1"><Icon name="clock" size={12} /> 7 min</span>
            </div>
          </div>
          <button className="h-10 px-3 rounded-full bg-sky-500 text-white text-[13px] font-semibold inline-flex items-center gap-1.5">
            <Icon name="navigation" size={14} /> {lang === 'fr' ? 'Y aller' : lang === 'ar' ? 'اذهب' : 'Sir'}
          </button>
        </Card>

        <div className="h-3" />
      </ScrollArea>
    </>
  );
};

window.EmergencyScreen = EmergencyScreen;
