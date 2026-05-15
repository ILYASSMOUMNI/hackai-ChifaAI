// Shared building blocks: Icon, Phone shell, Nav, Cards, Buttons, Audio bits.

const Icon = ({ name, size = 22, stroke = 2, className = '', style }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = `<i data-lucide="${name}"></i>`;
    try { window.lucide.createIcons({ nameAttr: 'data-lucide' }); } catch (e) {}
    const svg = ref.current.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke-width', stroke);
      if (className) svg.setAttribute('class', className);
      if (style) Object.assign(svg.style, style);
    }
  }, [name, size, stroke, className]);
  return <span ref={ref} className="inline-flex items-center justify-center shrink-0" style={style} />;
};

// Phone shell — frames the prototype on desktop, fills viewport on mobile.
const PhoneShell = ({ children, dir = 'ltr' }) => {
  return (
    <div className="min-h-screen w-full flex items-stretch md:items-center md:justify-center bg-[#EEF2F8] md:py-6"
         style={{
           backgroundImage: 'radial-gradient(1200px 600px at 80% -10%, rgba(46,91,255,0.06), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(16,185,129,0.05), transparent 60%)'
         }}>
      <div className="relative w-full md:w-[420px] md:rounded-[44px] md:border md:border-paper-200 md:shadow-[0_30px_80px_-20px_rgba(11,37,69,0.25)] bg-paper-50 overflow-hidden flex flex-col min-h-screen md:min-h-0 md:h-[min(100dvh-48px,880px)]"
           dir={dir}>
        {/* status bar (decorative) */}
        <div className="hidden md:flex items-center justify-between px-8 py-3 text-[12px] font-medium text-ink-700 bg-paper-50">
          <span>9:41</span>
          <span className="flex items-center gap-1.5">
            <Icon name="signal" size={14} />
            <Icon name="wifi" size={14} />
            <Icon name="battery-full" size={16} />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};

// Top bar with language pill + optional back
const TopBar = ({ title, onBack, right, transparent = false }) => {
  const { lang, setLang, t } = useI18n();
  const langs = [
    { id: 'fr', label: 'Français', short: 'FR' },
    { id: 'ar', label: 'العربية', short: 'AR' },
    { id: 'dr', label: 'Darija', short: 'DR' },
  ];
  return (
    <div className={`flex items-center gap-3 px-4 pt-3 pb-2 ${transparent ? '' : 'bg-paper-50 border-b border-paper-200'}`}>
      {onBack ? (
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-paper-200 flex items-center justify-center text-ink-700 hover:bg-paper-100 shrink-0" aria-label="Back">
          <Icon name={STRINGS[lang].dir === 'rtl' ? 'chevron-right' : 'chevron-left'} size={22} />
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-ink-900 text-white flex items-center justify-center shadow-soft">
            <Icon name="stethoscope" size={20} stroke={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-ink-900">Chifaa AI</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-400 font-medium">Hospital Assistant</div>
          </div>
        </div>
      )}
      {title && <div className="text-[15px] font-semibold text-ink-900 truncate">{title}</div>}
      <div className="ms-auto flex items-center gap-2">
        {right}
        <LangPill langs={langs} current={lang} setLang={setLang} />
      </div>
    </div>
  );
};

const LangPill = ({ langs, current, setLang }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const click = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="h-10 px-3 rounded-full bg-white border border-paper-200 flex items-center gap-2 text-[13px] font-semibold text-ink-700 hover:bg-paper-100">
        <Icon name="languages" size={16} />
        <span>{langs.find(l => l.id === current)?.short}</span>
        <Icon name="chevron-down" size={14} />
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-44 bg-white rounded-2xl border border-paper-200 shadow-card overflow-hidden z-50">
          {langs.map(l => (
            <button key={l.id} onClick={() => { setLang(l.id); setOpen(false); }}
              className={`w-full px-3 py-3 flex items-center justify-between text-[14px] hover:bg-paper-50 ${current === l.id ? 'text-sky-600 font-semibold' : 'text-ink-700'}`}>
              <span className={l.id === 'ar' ? 'font-arabic' : ''}>{l.label}</span>
              {current === l.id && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Bottom nav
const BottomNav = ({ current, go }) => {
  const { t } = useI18n();
  const items = [
    { id: 'home',     label: t.home,     icon: 'house' },
    { id: 'voice',    label: t.voice,    icon: 'mic' },
    { id: 'emergency', label: t.sos,     icon: 'siren' },
    { id: 'settings', label: t.settings, icon: 'settings-2' },
  ];
  return (
    <nav className="border-t border-paper-200 bg-white/95 backdrop-blur px-2 py-1.5 pb-safe">
      <div className="flex items-stretch justify-between">
        {items.map(it => {
          const active = current === it.id;
          return (
            <button key={it.id} onClick={() => go(it.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl ${active ? 'text-sky-600' : 'text-ink-400'} hover:text-sky-600`}>
              <span className={`relative flex items-center justify-center w-10 h-7 rounded-full ${active ? 'bg-sky-50' : ''}`}>
                <Icon name={it.icon} size={20} stroke={active ? 2.4 : 2} />
              </span>
              <span className="text-[10.5px] font-semibold tracking-wide">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Primary big CTA button
const BigButton = ({ children, onClick, icon, tone = 'primary', size = 'lg', full = true, disabled = false }) => {
  const tones = {
    primary: 'bg-ink-900 text-white hover:bg-ink-700 shadow-soft',
    sky:     'bg-sky-500 text-white hover:bg-sky-600 shadow-pop',
    mint:    'bg-mint-500 text-white hover:bg-mint-600',
    alert:   'bg-alert-500 text-white hover:bg-alert-600',
    ghost:   'bg-white text-ink-900 border border-paper-200 hover:bg-paper-100',
    paper:   'bg-paper-100 text-ink-900 border border-paper-200 hover:bg-paper-200',
  };
  const sizes = {
    lg: 'h-14 text-[16px] px-5 rounded-2xl',
    md: 'h-12 text-[15px] px-4 rounded-xl',
    sm: 'h-10 text-[13px] px-3 rounded-xl',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${tones[tone]} ${sizes[size]} ${full ? 'w-full' : ''} font-semibold inline-flex items-center justify-center gap-2.5 transition active:scale-[0.99] disabled:opacity-50`}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} stroke={2.2} />}
      <span className="truncate">{children}</span>
    </button>
  );
};

// Small "read aloud" pill that toggles a fake playing state
const ReadAloud = ({ label }) => {
  const { t } = useI18n();
  const [playing, setPlaying] = React.useState(false);
  React.useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setPlaying(false), 2200);
    return () => clearTimeout(id);
  }, [playing]);
  return (
    <button onClick={() => setPlaying(p => !p)}
      className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 text-[13px] font-semibold border border-sky-100">
      <span className="relative flex items-center justify-center w-5 h-5">
        {playing ? (
          <span className="flex items-end gap-[2px] h-3.5">
            <span className="w-[3px] bg-sky-600 wave-bar" style={{ height: '60%' }} />
            <span className="w-[3px] bg-sky-600 wave-bar" style={{ height: '100%', animationDelay: '0.15s' }} />
            <span className="w-[3px] bg-sky-600 wave-bar" style={{ height: '70%', animationDelay: '0.3s' }} />
            <span className="w-[3px] bg-sky-600 wave-bar" style={{ height: '90%', animationDelay: '0.45s' }} />
          </span>
        ) : (
          <Icon name="volume-2" size={16} />
        )}
      </span>
      {label || t.readAloud}
    </button>
  );
};

// Disclaimer chip
const Disclaimer = ({ compact = false }) => {
  const { t } = useI18n();
  return (
    <div className={`flex items-start gap-2.5 ${compact ? 'p-2.5' : 'p-3'} rounded-2xl bg-amber-50 border border-amber-100`}>
      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shrink-0">
        <Icon name="info" size={16} stroke={2.5} />
      </div>
      <div className="text-[12.5px] leading-snug text-ink-700">
        <span className="font-semibold text-ink-900">{t.notADoctor}</span>
      </div>
    </div>
  );
};

// Card primitive
const Card = ({ children, className = '', as = 'div', ...rest }) => {
  const Tag = as;
  return (
    <Tag className={`bg-white rounded-2xl border border-paper-200 shadow-soft ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

// Big visual action card (e.g. landing tile)
const ActionTile = ({ icon, title, subtitle, onClick, tone = 'sky', size = 'md' }) => {
  const tones = {
    sky:   { ring: 'bg-sky-50',  ic: 'text-sky-600',  border: 'border-sky-100' },
    mint:  { ring: 'bg-mint-50', ic: 'text-mint-600', border: 'border-mint-100' },
    navy:  { ring: 'bg-ink-900/5', ic: 'text-ink-900', border: 'border-paper-200' },
    amber: { ring: 'bg-amber-50',  ic: 'text-amber-500', border: 'border-amber-100' },
    alert: { ring: 'bg-alert-50',  ic: 'text-alert-500', border: 'border-alert-100' },
  };
  const ts = tones[tone];
  return (
    <button onClick={onClick}
      className={`group text-start w-full bg-white rounded-2xl border ${ts.border} shadow-soft p-4 hover:shadow-card transition active:scale-[0.99] flex items-center gap-3.5`}>
      <span className={`shrink-0 w-12 h-12 rounded-2xl ${ts.ring} ${ts.ic} flex items-center justify-center`}>
        <Icon name={icon} size={24} stroke={2.2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15.5px] font-semibold text-ink-900 leading-tight">{title}</span>
        {subtitle && <span className="block text-[12.5px] text-ink-400 mt-0.5">{subtitle}</span>}
      </span>
      <Icon name="chevron-right" size={20} className="text-ink-300 rtl-flip" />
    </button>
  );
};

// Section header
const SectionTitle = ({ children, action }) => (
  <div className="flex items-center justify-between px-1 mt-2 mb-2">
    <h3 className="text-[13.5px] font-semibold uppercase tracking-wider text-ink-400">{children}</h3>
    {action}
  </div>
);

// Step row
const StepRow = ({ idx, title, body, done = false, current = false, icon }) => (
  <div className={`flex items-start gap-3 ${current ? 'bg-sky-50/60' : ''} rounded-2xl p-3`}>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-[14px]
      ${done ? 'bg-mint-500 text-white' : current ? 'bg-sky-500 text-white' : 'bg-paper-100 text-ink-500 border border-paper-200'}`}>
      {done ? <Icon name="check" size={18} stroke={3} /> : idx}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={16} className="text-ink-400" />}
        <span className={`text-[14.5px] font-semibold leading-tight ${done ? 'text-ink-400 line-through' : 'text-ink-900'}`}>{title}</span>
      </div>
      {body && <div className="text-[13px] text-ink-500 mt-1 leading-snug">{body}</div>}
    </div>
  </div>
);

// Small badge
const Pill = ({ children, tone = 'paper', icon }) => {
  const tones = {
    paper: 'bg-paper-100 text-ink-700 border-paper-200',
    sky:   'bg-sky-50 text-sky-700 border-sky-100',
    mint:  'bg-mint-50 text-mint-700 border-mint-100',
    amber: 'bg-amber-50 text-amber-500 border-amber-100',
    alert: 'bg-alert-50 text-alert-600 border-alert-100',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[12px] font-semibold ${tones[tone]}`}>
      {icon && <Icon name={icon} size={12} stroke={2.5} />}
      {children}
    </span>
  );
};

// Util: container with padding and scroll
const ScrollArea = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto no-scrollbar ${className}`}>{children}</div>
);

Object.assign(window, {
  Icon, PhoneShell, TopBar, BottomNav, BigButton, ReadAloud,
  Disclaimer, Card, ActionTile, SectionTitle, StepRow, Pill, ScrollArea,
});
