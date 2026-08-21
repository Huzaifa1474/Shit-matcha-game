import { useEffect, useRef, useState, type ReactNode } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/texture";
import { createGameScene } from "@/game/scene";
import { LOADOUTS, MISSIONS, type GameHandle, type HudState, type InputAction, type LoadoutKey, type MissionKey } from "@/game/types";

const ROSTER_ART = "/manus-storage/mecha-roster-command-deck_499e092e.png";
const THEATRE_ART = "/manus-storage/mission-theatre-orbital-scrapyard_bd3c7520.png";
const REWARD_ART = "/manus-storage/reward-cache-emblems_828578b5.png";

type ConsoleView = "command" | "missions" | "roster" | "rewards" | "achievements" | "settings" | "hangar" | "battle";
type CampaignProgress = { credits: number; completed: MissionKey[]; achievements: string[]; battlesWon: number };
type CabinetSettings = { reducedFx: boolean; scanlines: boolean; contrast: boolean };

const INITIAL_HUD: HudState = {
  playerHp: 100, playerMaxHp: 100, enemyHp: 100, enemyMaxHp: 100, playerState: "idle", enemyState: "idle", playerX: -3.55, enemyX: 3.55,
  matchState: "select", round: 1, playerRounds: 0, enemyRounds: 0, playerLabel: "BLUE VANGUARD", playerCallsign: "UNIT 01", enemyLabel: "RED RAIDER", enemyCallsign: "UNIT 02",
  selectedLoadout: "vanguard", missionKey: "scrapline", missionTitle: MISSIONS.scrapline.title, missionObjective: MISSIONS.scrapline.objective, missionReward: MISSIONS.scrapline.reward,
  theatreClass: "scrapline", soundOn: true, message: "COMMAND LINK // SELECT AN OPERATION",
};

const DEFAULT_PROGRESS: CampaignProgress = { credits: 480, completed: [], achievements: [], battlesWon: 0 };
const DEFAULT_SETTINGS: CabinetSettings = { reducedFx: false, scanlines: true, contrast: false };

const ACHIEVEMENTS = [
  { id: "first-link", title: "FIRST LINK", copy: "Secure any operation.", icon: "◇" },
  { id: "theatre-runner", title: "THEATRE RUNNER", copy: "Secure two different operations.", icon: "◈" },
  { id: "cache-haul", title: "CACHE HAUL", copy: "Accumulate 1,000 salvage credits.", icon: "▣" },
  { id: "ace-pilot", title: "ACE PILOT", copy: "Win four operation links.", icon: "✦" },
];

function loadLocal<T>(key: string, fallback: T): T {
  try { const raw = window.localStorage.getItem(key); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; } catch { return fallback; }
}

function PixelMecha({ side, action, position, chassis }: { side: "player" | "enemy" | "ally"; action: HudState["playerState"]; position: number; chassis: string }) {
  const percent = ((position + 6.25) / 12.5) * 100;
  return <div className={`pixel-fighter ${side} ${chassis} action-${action}`} style={{ left: `${Math.max(7, Math.min(93, percent))}%` }} aria-hidden="true">
    <i className="fighter-head" /><i className="fighter-visor" /><i className="fighter-body" /><i className="fighter-arm arm-one" /><i className="fighter-arm arm-two" /><i className="fighter-leg leg-one" /><i className="fighter-leg leg-two" />
    <b className="fighter-core" /><em className="engine-engine engine-one" /><em className="engine-engine engine-two" /><em className="fighter-shield" /><em className="fighter-slash" />
  </div>;
}

function CombatStage({ hud }: { hud: HudState }) {
  const playerChassis = LOADOUTS[hud.selectedLoadout].chassis;
  const enemyChassis = MISSIONS[hud.missionKey].opponent.chassis;
  return <section className={`css-battle-stage theatre-${hud.theatreClass}`} aria-hidden="true">
    <div className="stage-sky" /><div className="stage-moon" /><div className="stage-distant-grid" /><div className="stage-smoke smoke-a" /><div className="stage-smoke smoke-b" />
    <div className="stage-crane"><i /><b /></div><div className="stage-factory factory-a" /><div className="stage-factory factory-b" /><div className="stage-factory factory-c" /><div className="stage-stack stack-a" /><div className="stage-stack stack-b" />
    <PixelMecha side="ally" action="idle" position={-5.55} chassis="heavy" /><PixelMecha side="ally" action="idle" position={5.62} chassis="winged" />
    <PixelMecha side="player" action={hud.playerState} position={hud.playerX} chassis={playerChassis} /><PixelMecha side="enemy" action={hud.enemyState} position={hud.enemyX} chassis={enemyChassis} />
    <div className="stage-catwalk" /><div className="stage-rail rail-top" /><div className="stage-rail rail-bottom" />
  </section>;
}

function Meter({ hp, maxHp, side }: { hp: number; maxHp: number; side: "player" | "enemy" }) {
  const activeSegments = Math.ceil((hp / maxHp) * 10);
  return <div className={`meter ${side}`} aria-label={`${side} integrity ${hp} out of ${maxHp}`}>{Array.from({ length: 10 }, (_, index) => <span className={`meter-segment ${index < activeSegments ? "active" : ""}`} key={index} />)}</div>;
}

function RoundPips({ wins, side }: { wins: number; side: "player" | "enemy" }) { return <div className={`round-pips ${side}`} aria-label={`${wins} rounds won`}>{[0, 1].map((index) => <span className={index < wins ? "won" : ""} key={index} />)}</div>; }

function ActionButton({ action, children, className = "", onAction }: { action: InputAction; children: ReactNode; className?: string; onAction: (action: InputAction, pressed: boolean) => void }) {
  return <button type="button" className={`action-button ${className}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onAction(action, true); }} onPointerUp={() => onAction(action, false)} onPointerCancel={() => onAction(action, false)} onPointerLeave={(event) => { if (event.buttons === 1) onAction(action, false); }} aria-label={`Use ${action}`}>{children}</button>;
}

function NavButton({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick: () => void }) { return <button type="button" className={`console-nav-button ${active ? "active" : ""}`} onClick={onClick}>{children}</button>; }

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const gameRef = useRef<GameHandle | null>(null);
  const rewardedMatchRef = useRef("");
  const [hud, setHud] = useState(INITIAL_HUD);
  const [view, setView] = useState<ConsoleView>(() => new URLSearchParams(window.location.search).has("demo") ? "battle" : "command");
  const [loadout, setLoadout] = useState<LoadoutKey>("vanguard");
  const [missionKey, setMissionKey] = useState<MissionKey>("scrapline");
  const [progress, setProgress] = useState<CampaignProgress>(() => loadLocal("pixel-mecha-campaign", DEFAULT_PROGRESS));
  const [settings, setSettings] = useState<CabinetSettings>(() => loadLocal("pixel-mecha-settings", DEFAULT_SETTINGS));

  useEffect(() => { window.localStorage.setItem("pixel-mecha-campaign", JSON.stringify(progress)); }, [progress]);
  useEffect(() => { window.localStorage.setItem("pixel-mecha-settings", JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true, disableWebGL2Support: true });
    let disposed = false;
    let animationFrame = 0;
    let previousTime = performance.now();
    createGameScene(engine, canvas, (next) => { if (!disposed) setHud(next); }).then((handle) => {
      if (disposed) { handle.dispose(); return; }
      gameRef.current = handle;
      const advanceGame = (time: number) => { if (disposed) return; handle.update(Math.min(0.05, (time - previousTime) / 1000)); previousTime = time; animationFrame = window.requestAnimationFrame(advanceGame); };
      animationFrame = window.requestAnimationFrame(advanceGame);
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => { disposed = true; window.cancelAnimationFrame(animationFrame); window.removeEventListener("resize", onResize); gameRef.current?.dispose(); gameRef.current = null; engine.dispose(); startedRef.current = false; };
  }, []);

  useEffect(() => {
    if (hud.matchState !== "match-victory" || rewardedMatchRef.current === `${hud.missionKey}-${hud.playerRounds}`) return;
    rewardedMatchRef.current = `${hud.missionKey}-${hud.playerRounds}`;
    setProgress((current) => {
      const freshMission = !current.completed.includes(hud.missionKey);
      const completed = freshMission ? [...current.completed, hud.missionKey] : current.completed;
      const credits = current.credits + (freshMission ? hud.missionReward : Math.ceil(hud.missionReward / 3));
      const battlesWon = current.battlesWon + 1;
      const achievements = new Set(current.achievements);
      achievements.add("first-link");
      if (completed.length >= 2) achievements.add("theatre-runner");
      if (credits >= 1000) achievements.add("cache-haul");
      if (battlesWon >= 4) achievements.add("ace-pilot");
      return { credits, completed, battlesWon, achievements: Array.from(achievements) };
    });
  }, [hud.matchState, hud.missionKey, hud.missionReward, hud.playerRounds]);

  const mission = MISSIONS[missionKey];
  const selected = LOADOUTS[loadout];
  const onAction = (action: InputAction, pressed: boolean) => gameRef.current?.setAction(action, pressed);
  const launch = () => { rewardedMatchRef.current = ""; gameRef.current?.startMatch(loadout, missionKey); setView("battle"); };
  const returnCommand = () => { gameRef.current?.returnToSelect(); setView("command"); };
  const selectMission = (nextMission: MissionKey) => { setMissionKey(nextMission); setView("hangar"); };
  const setCabinet = (key: keyof CabinetSettings) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  return <main className={`mecha-app ${settings.reducedFx ? "fx-reduced" : ""} ${settings.scanlines ? "scanlines-on" : "scanlines-off"} ${settings.contrast ? "contrast-on" : ""}`}>
    <canvas ref={canvasRef} className="arena-canvas" aria-label="Pixel Mecha Battle playable arena. Use A and D to move, J to strike, K to guard, and R to return to Command Deck." />
    {view === "battle" ? <>
      <div className="arena-vignette" /><CombatStage hud={hud} /><div className="corner-warning" />
      <section className="battle-hud" aria-label="Battle interface">
        <header className="top-deck">
          <section className="plate vital-panel" aria-label={`${hud.playerLabel} integrity`}><div className="pilot-line"><span>{hud.playerLabel}</span><span className="unit-tag">{hud.playerCallsign}</span></div><div className="meter-line"><Meter hp={hud.playerHp} maxHp={hud.playerMaxHp} side="player" /><span className="hp-number">{hud.playerHp}</span></div><RoundPips wins={hud.playerRounds} side="player" /></section>
          <section className="plate brand-plate" aria-label="Pixel Mecha Battle"><span className="brand-reactor" aria-hidden="true"><i /><b /></span><div><div className="brand-title">PIXEL // MECHA</div><div className="brand-sub">{hud.missionTitle}</div></div><button type="button" className={`audio-toggle ${hud.soundOn ? "on" : "off"}`} onClick={() => gameRef.current?.toggleAudio()} aria-pressed={hud.soundOn}>{hud.soundOn ? "SND ON" : "SND OFF"}</button></section>
          <section className="plate vital-panel enemy" aria-label={`${hud.enemyLabel} integrity`}><div className="pilot-line"><span>{hud.enemyLabel}</span><span className="unit-tag">{hud.enemyCallsign}</span></div><div className="meter-line"><Meter hp={hud.enemyHp} maxHp={hud.enemyMaxHp} side="enemy" /><span className="hp-number">{hud.enemyHp}</span></div><RoundPips wins={hud.enemyRounds} side="enemy" /></section>
        </header>
        <div className="round-dock" aria-live="polite"><div className="round-readout">{hud.missionKey.toUpperCase()} // R0{hud.round}<br />BEST OF 03</div><div className="status-copy">{hud.message}</div></div>
        <footer className="bottom-deck"><aside className="plate manual"><div className="manual-header"><span className="info-label">MISSION UPLINK</span><span className="system-line">{hud.playerState.toUpperCase()}</span></div><p>{hud.missionObjective}</p><dl><dt>MOVE</dt><dd>A / D or ← / →</dd><dt>STRIKE</dt><dd>J or SPACE</dd><dt>GUARD</dt><dd>HOLD K</dd></dl></aside><div className="action-cluster" aria-label="Combat action buttons"><ActionButton action="strike" className="strike" onAction={onAction}><strong>J</strong>STRIKE</ActionButton><ActionButton action="guard" className="guard" onAction={onAction}><strong>K</strong>GUARD</ActionButton></div><div className="direction-pad" aria-label="Movement buttons"><ActionButton action="left" onAction={onAction}><span>◀</span></ActionButton><ActionButton action="right" onAction={onAction}><span>▶</span></ActionButton></div></footer>
      </section>
      {hud.matchState === "round-result" && <section className="round-flash" aria-live="assertive"><span>ROUND {hud.playerRounds + hud.enemyRounds} COMPLETE</span><strong>{hud.playerRounds > hud.enemyRounds ? "BLUE FRAME HOLDS" : "HOSTILE HOLDS"}</strong><small>RE-ARMING NEXT LINK</small></section>}
      {hud.matchState === "match-victory" && <section className="ending-overlay victory" role="dialog" aria-modal="true"><div className="ending-kicker">OPERATION COMPLETE</div><div className="ending-title">OBJECTIVE SECURED</div><div className="ending-copy">{hud.playerLabel} secured {hud.missionTitle} and recovered +{hud.missionReward} salvage.</div><button type="button" className="reset-button" onClick={() => setView("rewards")}>CLAIM REWARD CACHE</button></section>}
      {hud.matchState === "match-defeat" && <section className="ending-overlay defeat" role="dialog" aria-modal="true"><div className="ending-kicker">OPERATION FAILED</div><div className="ending-title">FRAME BREACHED</div><div className="ending-copy">{hud.enemyLabel} held {hud.missionTitle}. Refit and select another operation.</div><button type="button" className="reset-button" onClick={returnCommand}>RETURN TO COMMAND</button></section>}
    </> : <section className="command-console" aria-label="Pixel Mecha Battle command console">
      <div className="command-backdrop" style={{ backgroundImage: `linear-gradient(90deg, rgba(9,13,13,.94), rgba(9,13,13,.42)), url(${view === "command" ? ROSTER_ART : THEATRE_ART})` }} />
      <header className="command-header"><button type="button" className="command-brand" onClick={() => setView("command")}><span className="brand-reactor" aria-hidden="true"><i /><b /></span><span><strong>PIXEL // MECHA</strong><small>CAMPAIGN CONSOLE</small></span></button><div className="command-totals"><span>⌬ {progress.credits.toLocaleString()} SALVAGE</span><span>✦ {progress.achievements.length}/4 BADGES</span></div></header>
      <nav className="command-nav" aria-label="Campaign navigation"><NavButton active={view === "command"} onClick={() => setView("command")}>COMMAND</NavButton><NavButton active={view === "missions"} onClick={() => setView("missions")}>MISSIONS</NavButton><NavButton active={view === "roster"} onClick={() => setView("roster")}>ROSTER</NavButton><NavButton active={view === "rewards"} onClick={() => setView("rewards")}>REWARDS</NavButton><NavButton active={view === "achievements"} onClick={() => setView("achievements")}>BADGES</NavButton><NavButton active={view === "settings"} onClick={() => setView("settings")}>SETTINGS</NavButton></nav>
      <div className="console-content">
        {view === "command" && <section className="command-hero"><div className="hero-kicker">OPS CONTROL // BLUE FACTION</div><h1>COMMAND<br /><em>THE RUSTBELT</em></h1><p>Choose a theatre, field a specialized chassis, and recover the scattered reactor cache before hostile links own the rail.</p><div className="hero-actions"><button type="button" className="primary-console-button" onClick={() => setView("missions")}>OPEN MISSION BOARD</button><button type="button" className="secondary-console-button" onClick={() => setView("roster")}>VIEW ACTIVE ROSTER</button></div><div className="command-stats"><article><b>{progress.completed.length}/4</b><span>THEATRES SECURED</span></article><article><b>{progress.battlesWon}</b><span>LINKS WON</span></article><article><b>{selected.callsign}</b><span>ACTIVE FRAME</span></article></div></section>}
        {view === "missions" && <section className="console-panel"><div className="panel-heading"><span>OPERATION BOARD</span><h2>CHOOSE A THEATRE</h2><p>Every operation carries a unique hostile frame, reward cache, and environmental identity.</p></div><div className="mission-grid">{Object.values(MISSIONS).map((item) => <button type="button" className={`mission-card ${item.theatreClass} ${progress.completed.includes(item.key) ? "complete" : ""}`} onClick={() => selectMission(item.key)} key={item.key}><span className="mission-code">{item.code} {progress.completed.includes(item.key) ? "// SECURED" : "// OPEN"}</span><strong>{item.title}</strong><span className="mission-theatre">{item.theatre}</span><p>{item.objective}</p><footer><span>{"◆".repeat(item.difficulty)}{"◇".repeat(4 - item.difficulty)}</span><span>+{item.reward} SALVAGE</span></footer></button>)}</div></section>}
        {view === "hangar" && <section className="console-panel hangar-console"><div className="panel-heading"><span>{mission.code} // {mission.theatre}</span><h2>ASSIGN A FRAME</h2><p>{mission.objective} Hostile: <strong>{mission.opponent.label}</strong>.</p></div><div className="loadout-grid expanded">{Object.values(LOADOUTS).map((profile) => <button type="button" className={`loadout-card ${profile.chassis} ${loadout === profile.key ? "selected" : ""}`} onClick={() => setLoadout(profile.key as LoadoutKey)} key={profile.key}><span className="loadout-code">{profile.callsign}</span><span className="mecha-portrait" aria-hidden="true"><i className="portrait-head" /><i className="portrait-torso" /><i className="portrait-arm arm-left" /><i className="portrait-arm arm-right" /><i className="portrait-leg leg-left" /><i className="portrait-leg leg-right" /><b className="portrait-core" /></span><strong>{profile.label}</strong><span className="loadout-description">{profile.description}</span><span className="loadout-stats">HP {profile.maxHp} · SPD {profile.speed.toFixed(2)} · DMG {profile.strikeDamage}</span></button>)}</div><div className="hangar-launch-row"><button type="button" className="secondary-console-button" onClick={() => setView("missions")}>BACK TO BOARD</button><button type="button" className="primary-console-button" onClick={launch}>LAUNCH {selected.label}</button></div></section>}
        {view === "roster" && <section className="console-panel"><div className="panel-heading"><span>BLUE FACTION // LIVE INVENTORY</span><h2>FRAME ROSTER</h2><p>Every chassis changes the duel tempo through integrity, acceleration, strike force, and guard efficiency.</p></div><div className="roster-table">{Object.values(LOADOUTS).map((profile) => <article className={`roster-row ${profile.chassis}`} key={profile.key}><div className="mini-mecha"><span className="mini-head" /><span className="mini-body" /><span className="mini-core" /><i /></div><div><b>{profile.label}</b><span>{profile.callsign} · {profile.description}</span></div><div className="roster-stat"><small>INTEGRITY</small><strong>{profile.maxHp}</strong></div><div className="roster-stat"><small>SPEED</small><strong>{profile.speed.toFixed(2)}</strong></div><button type="button" onClick={() => { setLoadout(profile.key as LoadoutKey); setView("missions"); }}>FIELD FRAME</button></article>)}</div></section>}
        {view === "rewards" && <section className="console-panel reward-panel"><div className="reward-art"><img src={REWARD_ART} alt="A glowing industrial reward crate with achievement emblems" /></div><div className="panel-heading"><span>SUPPLY LINK // CACHE LOG</span><h2>REWARD CACHE</h2><p>Secured operations add salvage to the campaign treasury. New theatres pay their full cache; repeat clears grant a smaller tactical bonus.</p><div className="reward-total"><strong>{progress.credits.toLocaleString()}</strong><span>AVAILABLE SALVAGE</span></div><button type="button" className="primary-console-button" onClick={returnCommand}>RETURN TO COMMAND</button></div><div className="cache-history">{progress.completed.length ? progress.completed.map((key) => <div key={key}><span>{MISSIONS[key].code}</span><b>{MISSIONS[key].title}</b><em>SECURED +{MISSIONS[key].reward}</em></div>) : <p>NO CACHES RECOVERED. DEPLOY TO AN OPERATION TO START A SUPPLY LINK.</p>}</div></section>}
        {view === "achievements" && <section className="console-panel"><div className="panel-heading"><span>PERSONNEL RECORD // BLUE FACTION</span><h2>ACHIEVEMENTS</h2><p>Operational merits track long-term command progress across the campaign console.</p></div><div className="achievement-grid">{ACHIEVEMENTS.map((achievement) => { const unlocked = progress.achievements.includes(achievement.id); return <article className={`achievement-card ${unlocked ? "unlocked" : ""}`} key={achievement.id}><span>{unlocked ? achievement.icon : "×"}</span><div><b>{achievement.title}</b><p>{achievement.copy}</p></div><em>{unlocked ? "UNLOCKED" : "LOCKED"}</em></article>; })}</div></section>}
        {view === "settings" && <section className="console-panel settings-panel"><div className="panel-heading"><span>CABINET CONTROL // LOCAL PROFILE</span><h2>SETTINGS</h2><p>Adjust the visual signal without changing game rules or campaign data.</p></div><div className="setting-list"><button type="button" onClick={() => setCabinet("scanlines")}><span><b>CRT SCANLINES</b><small>Adds a low-contrast cabinet screen texture.</small></span><i className={settings.scanlines ? "switch-on" : ""}>{settings.scanlines ? "ON" : "OFF"}</i></button><button type="button" onClick={() => setCabinet("reducedFx")}><span><b>REDUCED EFFECTS</b><small>Minimizes ambient sparks, engine trails, and stage motion.</small></span><i className={settings.reducedFx ? "switch-on" : ""}>{settings.reducedFx ? "ON" : "OFF"}</i></button><button type="button" onClick={() => setCabinet("contrast")}><span><b>HIGH-CONTRAST PANELS</b><small>Boosts text and interface plate separation.</small></span><i className={settings.contrast ? "switch-on" : ""}>{settings.contrast ? "ON" : "OFF"}</i></button><button type="button" onClick={() => gameRef.current?.toggleAudio()}><span><b>CABINET SOUND</b><small>Controls the arena music loop and combat chip effects.</small></span><i className={hud.soundOn ? "switch-on" : ""}>{hud.soundOn ? "ON" : "OFF"}</i></button></div></section>}
      </div>
    </section>}
  </main>;
}
