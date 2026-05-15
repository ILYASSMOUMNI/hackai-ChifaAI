// Voice assistant screen — big mic with state machine.

const VoiceScreen = ({ go }) => {
  const { t, lang } = useI18n();
  // States: idle | listening | thinking | answer
  const [state, setState] = React.useState('idle');
  const [seconds, setSeconds] = React.useState(0);
  const [audioPlaying, setAudioPlaying] = React.useState(false);

  React.useEffect(() => {
    let id;
    if (state === 'listening') {
      setSeconds(0);
      id = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => id && clearInterval(id);
  }, [state]);

  const onTapMic = () => {
    if (state === 'idle') {
      setState('listening');
      // auto-progress after 3s
      setTimeout(() => setState('thinking'), 3200);
      setTimeout(() => setState('answer'), 5400);
    } else if (state === 'listening') {
      setState('thinking');
      setTimeout(() => setState('answer'), 1600);
    } else if (state === 'answer') {
      setState('idle');
    }
  };

  const statusText = {
    idle: t.tapToSpeak,
    listening: t.listening,
    thinking: t.thinking,
    answer: t.answerReady,
  }[state];

  const micTone = {
    idle: 'bg-sky-500 shadow-mic',
    listening: 'bg-alert-500 shadow-mic',
    thinking: 'bg-ink-700',
    answer: 'bg-mint-500',
  }[state];

  return (
    <>
      <TopBar onBack={() => go('home')} title={t.voice} />
      <ScrollArea className="px-4">
        {/* Mic stage */}
        <div className="mt-4 rounded-3xl bg-white border border-paper-200 shadow-soft p-5 text-center relative overflow-hidden">
          {/* gradient halo */}
          <div className={`absolute inset-x-0 -top-20 h-48 ${state === 'listening' ? 'bg-alert-50' : state === 'answer' ? 'bg-mint-50' : 'bg-sky-50'} blur-2xl opacity-70 pointer-events-none transition-colors duration-500`} />

          <div className="relative flex flex-col items-center">
            {/* sample question chip when idle */}
            {state === 'idle' && (
              <div className="mb-4 text-[12.5px] text-ink-400">
                <span className="italic">“{t.sampleQ}”</span>
              </div>
            )}

            {/* mic + pulse rings */}
            <div className="relative w-[180px] h-[180px] flex items-center justify-center">
              {state === 'listening' && (
                <>
                  <span className="absolute inset-0 rounded-full bg-alert-500/30 pulse-ring" />
                  <span className="absolute inset-0 rounded-full bg-alert-500/20 pulse-ring d2" />
                  <span className="absolute inset-0 rounded-full bg-alert-500/15 pulse-ring d3" />
                </>
              )}
              {state === 'idle' && (
                <>
                  <span className="absolute inset-2 rounded-full bg-sky-500/15 breathe" />
                </>
              )}
              <button onClick={onTapMic}
                aria-label={statusText}
                className={`relative w-[136px] h-[136px] rounded-full ${micTone} text-white flex items-center justify-center transition-all duration-300 active:scale-95`}>
                {state === 'thinking' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-white rounded-full think-dot" />
                    <span className="w-2.5 h-2.5 bg-white rounded-full think-dot" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2.5 h-2.5 bg-white rounded-full think-dot" style={{ animationDelay: '0.3s' }} />
                  </div>
                ) : state === 'listening' ? (
                  <div className="flex items-end gap-1.5 h-12">
                    {[60, 100, 70, 90, 55, 85, 70].map((h, i) => (
                      <span key={i} className="w-1.5 bg-white rounded-full wave-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </div>
                ) : state === 'answer' ? (
                  <Icon name="check" size={56} stroke={2.6} />
                ) : (
                  <Icon name="mic" size={64} stroke={2.2} />
                )}
              </button>
            </div>

            {/* status */}
            <div className="mt-5 text-[20px] font-semibold text-ink-900">{statusText}</div>
            {state === 'listening' && (
              <div className="mt-1 text-[13px] text-alert-500 font-mono">{String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}</div>
            )}
            {state === 'idle' && (
              <div className="mt-1 text-[12.5px] text-ink-400">{t.privacy}</div>
            )}

            {state === 'listening' && (
              <button onClick={() => setState('idle')} className="mt-4 h-10 px-4 rounded-full bg-paper-100 text-ink-700 text-[13px] font-semibold">
                <Icon name="x" size={14} className="inline -mt-0.5 me-1" /> Annuler
              </button>
            )}
          </div>
        </div>

        {/* ANSWER */}
        {state === 'answer' && (
          <div className="mt-4 space-y-3 fade-up">
            {/* User transcript */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-sky-500 text-white px-4 py-3 text-[14px] leading-snug shadow-soft">
                {t.sampleQ}
              </div>
            </div>

            {/* Assistant summary */}
            <div className="rounded-2xl rounded-tl-sm bg-white border border-paper-200 p-4 shadow-soft">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-ink-900 text-white flex items-center justify-center">
                  <Icon name="stethoscope" size={14} />
                </div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-ink-400">Chifaa AI</div>
                <Pill tone="mint" icon="badge-check">{t.answerReady}</Pill>
              </div>
              <p className="text-[15px] leading-snug text-ink-900">{t.sampleA}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setAudioPlaying(p => !p)}
                  className="h-11 px-4 rounded-full bg-sky-500 text-white font-semibold inline-flex items-center gap-2 text-[14px] shadow-pop">
                  {audioPlaying ? (
                    <span className="flex items-end gap-[2px] h-4">
                      {[60,100,70,90].map((h,i)=>(
                        <span key={i} className="w-[3px] bg-white wave-bar" style={{height: h+'%', animationDelay: `${i*0.1}s`}} />
                      ))}
                    </span>
                  ) : <Icon name="play" size={16} stroke={2.6} />}
                  {t.playAudio}
                </button>
                <ReadAloud />
              </div>
            </div>

            {/* Step cards */}
            <Card className="p-3">
              <div className="px-1 pb-2 text-[12px] uppercase tracking-wider font-semibold text-ink-400">{t.step}s</div>
              <div className="space-y-1">
                <StepRow idx={1} icon="moon" title={lang === 'fr' ? 'La veille au soir' : lang === 'ar' ? 'في الليلة السابقة' : 'L-lila qbel'}
                  body={lang === 'fr' ? 'Dernier repas léger avant 22 h.' : lang === 'ar' ? 'وجبة خفيفة قبل الساعة العاشرة ليلاً.' : 'Akla khfifa qbel 22h.'} />
                <StepRow idx={2} icon="droplets" title={lang === 'fr' ? 'À jeun' : lang === 'ar' ? 'على الريق' : '3la riq'}
                  body={lang === 'fr' ? 'Pas de café, pas de thé, pas de sucre. Eau autorisée.' : lang === 'ar' ? 'بدون قهوة، شاي أو سكر. الماء مسموح.' : 'Bla qhwa, bla atay, bla skkar. L-ma msmoh.'} />
                <StepRow idx={3} icon="folder" title={lang === 'fr' ? 'Documents' : lang === 'ar' ? 'الوثائق' : 'L-wra9'}
                  body={lang === 'fr' ? 'Carte CNSS / Mutuelle + ordonnance.' : lang === 'ar' ? 'بطاقة CNSS أو التأمين + الوصفة الطبية.' : 'CNSS / Mutuelle + ordonnance.'} />
                <StepRow idx={4} icon="map-pin" title={lang === 'fr' ? 'Au laboratoire' : lang === 'ar' ? 'في المختبر' : 'F l-laboratoire'}
                  body={lang === 'fr' ? 'Présentez‑vous à l’accueil, étage 1.' : lang === 'ar' ? 'توجه إلى الاستقبال، الطابق الأول.' : 'Sir l accueil, etage 1.'} />
              </div>
            </Card>

            {/* Confidence + fallback */}
            <div className="rounded-2xl bg-paper-100 border border-paper-200 p-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-paper-200 flex items-center justify-center text-ink-500">
                <Icon name="user-round" size={18} />
              </div>
              <div className="flex-1">
                <div className="text-[13px] text-ink-700 leading-snug">{t.confidenceLow}</div>
                <button onClick={() => go('emergency')} className="mt-2 h-10 px-3 rounded-full bg-white border border-paper-200 text-[13px] font-semibold text-ink-900 inline-flex items-center gap-2">
                  <Icon name="phone" size={14} /> {t.talkHuman}
                </button>
              </div>
            </div>

            <button onClick={() => setState('idle')} className="w-full h-12 rounded-2xl bg-paper-100 border border-paper-200 text-ink-700 font-semibold text-[14px] inline-flex items-center justify-center gap-2">
              <Icon name="rotate-ccw" size={16} /> {lang === 'fr' ? 'Poser une autre question' : lang === 'ar' ? 'اطرح سؤالاً آخر' : 'Sewwel sou2al akhor'}
            </button>
          </div>
        )}

        {/* IDLE suggestions */}
        {state === 'idle' && (
          <div className="mt-4 mb-4">
            <SectionTitle>{lang === 'fr' ? 'Exemples' : lang === 'ar' ? 'أمثلة' : 'Amthila'}</SectionTitle>
            <div className="space-y-2">
              {[
                lang === 'fr' ? 'Où est le service de cardiologie ?' : lang === 'ar' ? 'أين قسم أمراض القلب؟' : 'Fin kayna service dyal lqalb?',
                lang === 'fr' ? 'Que veut dire « à jeun » ?' : lang === 'ar' ? 'ماذا تعني "على الريق"؟' : 'Achno kat3ni "3la riq"?',
                lang === 'fr' ? 'Quels papiers pour une consultation ?' : lang === 'ar' ? 'ما الأوراق المطلوبة للاستشارة؟' : 'Chno l-wra9 li khasni l consultation?',
              ].map((q, i) => (
                <button key={i} onClick={onTapMic} className="w-full text-start bg-white rounded-2xl border border-paper-200 p-3 flex items-center gap-3 hover:bg-paper-50">
                  <Icon name="message-circle-question" size={18} className="text-sky-600" />
                  <span className="text-[14px] text-ink-700 flex-1">{q}</span>
                  <Icon name="mic" size={16} className="text-ink-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-3" />
      </ScrollArea>
    </>
  );
};

window.VoiceScreen = VoiceScreen;
