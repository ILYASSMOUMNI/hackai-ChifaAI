// Root app: state, routing, i18n provider, tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "sky",
  "language": "fr",
  "startScreen": "home"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  sky:   { '--accent-500': '#2E5BFF', '--accent-600': '#1E47E0' },
  mint:  { '--accent-500': '#10B981', '--accent-600': '#0E9E70' },
  navy:  { '--accent-500': '#0B2545', '--accent-600': '#1E3A5F' },
};

const App = () => {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(tw.startScreen || 'home');
  const [lang, setLangState] = React.useState(tw.language || 'fr');

  // Keep state in sync with tweaks panel
  React.useEffect(() => { setLangState(tw.language); }, [tw.language]);
  React.useEffect(() => { setScreen(tw.startScreen || 'home'); }, [tw.startScreen]);

  const setLang = (l) => { setLangState(l); setTweak('language', l); };

  const strings = STRINGS[lang] || STRINGS.fr;
  const dir = strings.dir;

  // Map current screen → which bottom tab is highlighted
  const navTab = ({
    home: 'home',
    voice: 'voice',
    checklist: 'home',
    guidance: 'home',
    emergency: 'emergency',
    settings: 'settings',
  })[screen] || 'home';

  const screens = {
    home:      <LandingScreen   go={setScreen} />,
    voice:     <VoiceScreen     go={setScreen} />,
    checklist: <ChecklistScreen go={setScreen} />,
    guidance:  <GuidanceScreen  go={setScreen} />,
    emergency: <EmergencyScreen go={setScreen} />,
    settings:  <SettingsScreen  go={setScreen} />,
  };

  return (
    <I18nCtx.Provider value={{ lang, setLang, t: strings }}>
      <div style={ACCENT_PRESETS[tw.accent] || ACCENT_PRESETS.sky}>
        <PhoneShell dir={dir}>
          <div key={screen} className="flex-1 flex flex-col fade-up min-h-0">
            {screens[screen] || screens.home}
          </div>
          <BottomNav current={navTab} go={setScreen} />
        </PhoneShell>
      </div>

      <ChifaaTweaks t={tw} setTweak={setTweak} />
    </I18nCtx.Provider>
  );
};

// Tweaks panel
const ChifaaTweaks = ({ t, setTweak }) => (
  <TweaksPanel title="Chifaa AI · Tweaks">
    <TweakSection title="Language">
      <TweakRadio
        label="Active"
        value={t.language}
        onChange={(v) => setTweak('language', v)}
        options={[
          { value: 'fr', label: 'FR' },
          { value: 'ar', label: 'AR' },
          { value: 'dr', label: 'DR' },
        ]}
      />
    </TweakSection>

    <TweakSection title="Brand accent">
      <TweakRadio
        label="Palette"
        value={t.accent}
        onChange={(v) => setTweak('accent', v)}
        options={[
          { value: 'sky',  label: 'Sky' },
          { value: 'mint', label: 'Mint' },
          { value: 'navy', label: 'Navy' },
        ]}
      />
    </TweakSection>

    <TweakSection title="Jump to screen">
      <TweakSelect
        label="Screen"
        value={t.startScreen}
        onChange={(v) => setTweak('startScreen', v)}
        options={[
          { value: 'home',      label: 'Landing' },
          { value: 'voice',     label: 'Voice assistant' },
          { value: 'checklist', label: 'Procedure checklist' },
          { value: 'guidance',  label: 'Patient guidance' },
          { value: 'emergency', label: 'Emergency' },
          { value: 'settings',  label: 'Settings' },
        ]}
      />
    </TweakSection>
  </TweaksPanel>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
