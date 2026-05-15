// Document upload — camera capture flow with detected document explanation.

const UploadScreen = ({ go }) => {
  const { t, lang } = useI18n();
  // States: hint | uploading | analyzed
  const [state, setState] = React.useState('hint');
  const [progress, setProgress] = React.useState(0);

  const startUpload = () => {
    setState('uploading');
    setProgress(0);
    let p = 0;
    const id = setInterval(() => {
      p += 7 + Math.random() * 8;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(() => setState('analyzed'), 350); }
      setProgress(Math.min(100, Math.round(p)));
    }, 220);
  };

  return (
    <>
      <TopBar onBack={() => go('home')} title={t.docs} />
      <ScrollArea className="px-4">
        {state === 'hint' && (
          <div className="mt-4 fade-up">
            {/* Camera viewfinder mock */}
            <div className="relative rounded-3xl overflow-hidden border border-paper-200 bg-ink-900 aspect-[3/4] shadow-card">
              {/* simulated paper */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[72%] h-[78%] bg-white rounded-md shadow-2xl -rotate-2 relative p-3">
                  <div className="text-[8px] font-mono text-ink-300 tracking-wider">CNSS · ORDONNANCE</div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-1.5 bg-paper-200 rounded w-3/4" />
                    <div className="h-1.5 bg-paper-200 rounded w-1/2" />
                  </div>
                  <div className="mt-3 space-y-1">
                    {[80, 60, 70, 55, 75, 45].map((w, i) => (
                      <div key={i} className="h-1 bg-paper-100 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="absolute bottom-2 end-3 w-10 h-6 bg-paper-200 rounded" />
                </div>
              </div>
              {/* viewfinder corners */}
              {[
                'top-4 left-4 border-t-2 border-l-2',
                'top-4 right-4 border-t-2 border-r-2',
                'bottom-4 left-4 border-b-2 border-l-2',
                'bottom-4 right-4 border-b-2 border-r-2',
              ].map((c, i) => (
                <div key={i} className={`absolute w-8 h-8 ${c} border-white rounded-md`} />
              ))}
              {/* hint */}
              <div className="absolute top-3 inset-x-3 bg-black/40 backdrop-blur rounded-full px-3 py-1.5 text-white text-[12px] flex items-center gap-2">
                <Icon name="info" size={14} />
                <span>{t.docHint}</span>
              </div>
            </div>

            <h2 className="mt-4 text-[20px] font-bold text-ink-900 leading-tight">{t.docTitle}</h2>
            <p className="text-[13px] text-ink-500 mt-1">
              {lang === 'fr' ? 'Ordonnance, carte CNSS, rendez‑vous, résultat d’analyse…' :
               lang === 'ar' ? 'وصفة طبية، بطاقة CNSS، موعد، نتيجة تحليل…' :
               'Ordonnance, CNSS, rendez-vous, résultat d\'analyse…'}
            </p>

            <div className="mt-4 space-y-2.5">
              <BigButton tone="sky" icon="camera" onClick={startUpload}>{t.takePhoto}</BigButton>
              <BigButton tone="ghost" icon="image" onClick={startUpload}>{t.chooseFile}</BigButton>
            </div>

            <div className="mt-4">
              <Disclaimer />
            </div>
            <div className="h-3" />
          </div>
        )}

        {state === 'uploading' && (
          <div className="mt-4 fade-up">
            <div className="rounded-3xl border border-paper-200 bg-white p-6 text-center shadow-soft">
              <div className="relative w-32 h-32 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#EAF0F7" strokeWidth="8" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#2E5BFF" strokeWidth="8"
                    strokeDasharray={`${(progress/100)*276} 276`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[26px] font-bold text-ink-900">{progress}%</div>
                    <div className="text-[10px] text-ink-400 font-mono uppercase tracking-wider">{progress < 60 ? 'Upload' : 'Analyse'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[15px] font-semibold text-ink-900">
                {progress < 60
                  ? (lang === 'fr' ? 'Téléversement…' : lang === 'ar' ? 'جاري الرفع…' : 'Kayrfa3…')
                  : (lang === 'fr' ? 'Lecture du document…' : lang === 'ar' ? 'قراءة الوثيقة…' : 'Kay9ra l-wrqa…')}
              </div>
              <div className="text-[12.5px] text-ink-400 mt-1">{t.privacy}</div>
            </div>
          </div>
        )}

        {state === 'analyzed' && (
          <div className="mt-4 fade-up">
            {/* Doc preview + detected */}
            <Card className="p-3 flex items-center gap-3">
              <div className="w-14 h-16 rounded-lg bg-paper-100 border border-paper-200 stripe-ph relative overflow-hidden">
                <div className="absolute inset-1 bg-white rounded p-1">
                  <div className="h-0.5 bg-paper-200 rounded w-3/4 mb-0.5" />
                  <div className="h-0.5 bg-paper-200 rounded w-1/2 mb-1" />
                  {[0,1,2,3,4].map(i=>(
                    <div key={i} className="h-0.5 bg-paper-100 rounded mb-0.5" style={{width: `${50+i*8}%`}} />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">{t.detected}</div>
                <div className="text-[15px] font-bold text-ink-900 leading-tight">
                  {lang === 'fr' ? 'Ordonnance médicale' : lang === 'ar' ? 'وصفة طبية' : 'Ordonnance tibiya'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Pill tone="mint" icon="badge-check">98%</Pill>
                  <span className="text-[11px] text-ink-400">Dr. Bennani · 12/05/2026</span>
                </div>
              </div>
            </Card>

            {/* What it means */}
            <div className="mt-3">
              <SectionTitle action={<ReadAloud />}>{t.whatItMeans}</SectionTitle>
              <Card className="p-4">
                <p className="text-[14.5px] text-ink-900 leading-snug">
                  {lang === 'fr' ? 'Cette ordonnance contient 2 médicaments pour traiter une infection. Vous devez les prendre pendant 7 jours.' :
                   lang === 'ar' ? 'هذه الوصفة الطبية تحتوي على دوائين لعلاج التهاب. يجب تناولهما لمدة 7 أيام.' :
                   'Had l-ordonnance fih 2 dwa bach tdawi infection. Khasek takhodhom 7 ayyam.'}
                </p>

                {/* Medications */}
                <div className="mt-3 space-y-2">
                  {[
                    { name: 'Amoxicilline 500mg', dose: lang === 'fr' ? '3× par jour, après les repas' : lang === 'ar' ? '٣ مرات يومياً بعد الأكل' : '3 marrat f lyoum b3d l-makla', icon: 'pill', tone: 'sky' },
                    { name: 'Paracétamol 1g',     dose: lang === 'fr' ? 'Si fièvre, max 3× par jour' : lang === 'ar' ? 'عند الحمى، ٣ مرات كحد أقصى' : 'Ila kan s-skhana, max 3 marrat', icon: 'thermometer', tone: 'mint' },
                  ].map((m, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${m.tone === 'sky' ? 'bg-sky-50/60 border-sky-100' : 'bg-mint-50/60 border-mint-100'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.tone === 'sky' ? 'bg-sky-500 text-white' : 'bg-mint-500 text-white'}`}>
                        <Icon name={m.icon} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14.5px] font-semibold text-ink-900">{m.name}</div>
                        <div className="text-[12.5px] text-ink-500">{m.dose}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* What to do */}
            <div className="mt-3">
              <SectionTitle>{t.whatToDo}</SectionTitle>
              <Card className="p-2.5">
                <StepRow idx={1} icon="map-pin" title={lang === 'fr' ? 'Aller à la pharmacie' : lang === 'ar' ? 'اذهب إلى الصيدلية' : 'Sir l fermassian'} body={lang === 'fr' ? 'Avec l’ordonnance et votre carte d’identité.' : lang === 'ar' ? 'مع الوصفة وبطاقة الهوية.' : 'M3a l-ordonnance w l-CIN.'} />
                <StepRow idx={2} icon="alarm-clock" title={lang === 'fr' ? 'Respecter les horaires' : lang === 'ar' ? 'احترم المواعيد' : '7tarem l-waqt'} body={lang === 'fr' ? 'Une prise toutes les 8 heures.' : lang === 'ar' ? 'جرعة كل ٨ ساعات.' : 'Wahd l-prise koul 8 sa3at.'} />
                <StepRow idx={3} icon="calendar-check" title={lang === 'fr' ? 'Contrôle dans 7 jours' : lang === 'ar' ? 'مراجعة بعد ٧ أيام' : 'Mراج3a mn ba3d 7 ayyam'} body={lang === 'fr' ? 'Reprendre rendez‑vous avec le médecin.' : lang === 'ar' ? 'حدد موعداً جديداً مع الطبيب.' : 'Khoud rendez-vous jdid m3a tbib.'} />
              </Card>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <BigButton tone="sky" icon="volume-2" size="md" onClick={() => {}}>{t.readAloud}</BigButton>
              <BigButton tone="ghost" icon="route" size="md" onClick={() => go('checklist')}>{t.checklist}</BigButton>
            </div>

            <div className="mt-3">
              <Disclaimer />
            </div>

            <button onClick={() => setState('hint')} className="mt-3 w-full h-12 rounded-2xl bg-paper-100 border border-paper-200 text-ink-700 font-semibold text-[14px] inline-flex items-center justify-center gap-2">
              <Icon name="rotate-ccw" size={16} /> {lang === 'fr' ? 'Téléverser un autre document' : lang === 'ar' ? 'إرسال وثيقة أخرى' : 'Rfa3 wrqa khra'}
            </button>
            <div className="h-3" />
          </div>
        )}
      </ScrollArea>
    </>
  );
};

window.UploadScreen = UploadScreen;
