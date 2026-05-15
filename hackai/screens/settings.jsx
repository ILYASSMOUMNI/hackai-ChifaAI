// Settings / Language screen — accessibility-first controls.

const SettingsScreen = ({ go }) => {
  const { t, lang, setLang } = useI18n();
  const [voicePref, setVoicePref] = React.useState('f');
  const [textSize, setTextSize] = React.useState(1); // 0,1,2
  const [contrast, setContrast] = React.useState(false);
  const [autoRead, setAutoRead] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);

  const languages = [
    { id: 'fr', label: 'Français',  sub: 'Standard FR',          flag: '🇫🇷' },
    { id: 'ar', label: 'العربية',    sub: 'Arabe (standard)',     flag: '🇲🇦', font: 'font-arabic' },
    { id: 'dr', label: 'Darija',    sub: 'Maghribi (Latin)',     flag: '🇲🇦' },
  ];

  return (
    <>
      <TopBar onBack={() => go('home')} title={t.settings} />
      <ScrollArea className="px-4">
        <SectionTitle>{lang === 'fr' ? 'Langue' : lang === 'ar' ? 'اللغة' : 'L-lo8a'}</SectionTitle>
        <Card className="p-2 mb-4">
          {languages.map((l, i) => (
            <button key={l.id} onClick={() => setLang(l.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl text-start ${lang === l.id ? 'bg-sky-50' : 'hover:bg-paper-50'} ${i < languages.length - 1 ? 'mb-1' : ''}`}>
              <div className="w-11 h-11 rounded-2xl bg-paper-100 border border-paper-200 flex items-center justify-center text-[22px]">
                {l.flag}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[15px] font-semibold text-ink-900 ${l.font || ''}`}>{l.label}</div>
                <div className="text-[12px] text-ink-500">{l.sub}</div>
              </div>
              {lang === l.id ? (
                <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center">
                  <Icon name="check" size={16} stroke={3} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-paper-300" />
              )}
            </button>
          ))}
        </Card>

        <SectionTitle>{t.voicePref}</SectionTitle>
        <Card className="p-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'f', label: lang === 'fr' ? 'Voix féminine' : lang === 'ar' ? 'صوت أنثوي' : 'Sout dyal mra', icon: 'user-round' },
              { id: 'm', label: lang === 'fr' ? 'Voix masculine' : lang === 'ar' ? 'صوت ذكوري' : 'Sout dyal rajel', icon: 'user-round' },
            ].map(v => (
              <button key={v.id} onClick={() => setVoicePref(v.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition
                ${voicePref === v.id ? 'bg-sky-50 border-sky-200' : 'bg-white border-paper-200 hover:bg-paper-50'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${voicePref === v.id ? 'bg-sky-500 text-white' : 'bg-paper-100 text-ink-700'}`}>
                  <Icon name={v.icon} size={22} />
                </div>
                <div className="text-[13.5px] font-semibold text-ink-900 text-center">{v.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button className="h-10 px-3 rounded-full bg-paper-100 border border-paper-200 text-[13px] font-semibold inline-flex items-center gap-1.5">
              <Icon name="play" size={14} /> {lang === 'fr' ? 'Écouter un exemple' : lang === 'ar' ? 'استمع لعينة' : 'Sma3 namodaj'}
            </button>
            <div className="flex-1" />
            <span className="text-[11px] text-ink-400 font-mono">v1.0 · neural</span>
          </div>
        </Card>

        <SectionTitle>{lang === 'fr' ? 'Accessibilité' : lang === 'ar' ? 'إمكانية الوصول' : 'Accessibilité'}</SectionTitle>
        <Card className="p-3 mb-4">
          {/* Text size */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[14px] font-semibold text-ink-900">{t.textSize}</div>
              <Pill tone="sky">{['A','A','A'][textSize]}{textSize === 0 ? ' · S' : textSize === 1 ? ' · M' : ' · L'}</Pill>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0,1,2].map(i => (
                <button key={i} onClick={() => setTextSize(i)}
                  className={`h-14 rounded-xl border flex items-center justify-center font-semibold
                  ${textSize === i ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-paper-200 text-ink-700'}`}
                  style={{ fontSize: i === 0 ? 14 : i === 1 ? 18 : 22 }}>
                  Aa
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          {[
            { id: 'contrast', label: t.contrast,         icon: 'contrast', value: contrast, set: setContrast },
            { id: 'autoread', label: lang === 'fr' ? 'Lecture automatique' : lang === 'ar' ? 'القراءة التلقائية' : 'Qira2a auto', icon: 'volume-2', value: autoRead, set: setAutoRead },
            { id: 'haptics',  label: lang === 'fr' ? 'Vibrations'         : lang === 'ar' ? 'الاهتزاز'           : 'Haptics',     icon: 'vibrate',  value: haptics,  set: setHaptics },
          ].map((t2, i) => (
            <div key={t2.id} className={`flex items-center gap-3 py-2.5 ${i < 2 ? 'border-b border-paper-100' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-paper-100 text-ink-700 flex items-center justify-center">
                <Icon name={t2.icon} size={18} />
              </div>
              <div className="flex-1 text-[14px] font-semibold text-ink-900">{t2.label}</div>
              <button onClick={() => t2.set(v => !v)}
                className={`relative w-12 h-7 rounded-full transition ${t2.value ? 'bg-sky-500' : 'bg-paper-200'}`}>
                <span className={`absolute top-0.5 ${t2.value ? 'start-[22px]' : 'start-0.5'} w-6 h-6 bg-white rounded-full shadow transition-all`} />
              </button>
            </div>
          ))}
        </Card>

        <SectionTitle>{lang === 'fr' ? 'Confidentialité' : lang === 'ar' ? 'الخصوصية' : 'Khososiya'}</SectionTitle>
        <Card className="p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
              <Icon name="shield-check" size={20} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-ink-900 mb-1">{lang === 'fr' ? 'Vos données restent privées' : lang === 'ar' ? 'بياناتك تبقى خاصة' : 'L-bayanat dyalek khaass'}</div>
              <div className="text-[12.5px] text-ink-500 leading-snug">{t.privacy}</div>
            </div>
          </div>
        </Card>

        <div className="text-center text-[11px] text-ink-400 mt-2 mb-4 font-mono">
          Chifaa AI · v1.0.0 · {lang === 'fr' ? 'Conçu au Maroc' : lang === 'ar' ? 'صُمم في المغرب' : 'Conçu f l-Maghrib'}
        </div>
      </ScrollArea>
    </>
  );
};

window.SettingsScreen = SettingsScreen;
