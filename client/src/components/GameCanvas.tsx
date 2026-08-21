import { useEffect, useRef, useState, type ReactNode } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/texture";
import { createGameScene } from "@/game/scene";
import {
  CAMPAIGN_LEVELS,
  COMBO_ROUTES,
  LOADOUTS,
  MISSIONS,
  type CampaignStage,
  type GameHandle,
  type HudState,
  type InputAction,
  type LoadoutKey,
  type MissionKey,
} from "@/game/types";

const ROSTER_ART = "/manus-storage/mecha-roster-command-deck_499e092e.png";
const REWARD_ART = "/manus-storage/reward-cache-emblems_828578b5.png";
const AEGIS_ART = "/manus-storage/aegis-rift-custom-frame_bb4c57ca.png";
const PRISM_SHIELD_ART = "/manus-storage/prismatic-aegis-shield_5ac4d617.png";

type ConsoleView = "command" | "missions" | "roster" | "rewards" | "achievements" | "settings" | "hangar" | "battle";
type CampaignProgress = { credits: number; completed: MissionKey[]; medals: MissionKey[]; achievements: string[]; battlesWon: number; campaignComplete: boolean };
type CabinetSettings = { reducedFx: boolean; scanlines: boolean; contrast: boolean };
type BossIntroData = { missionKey: MissionKey; threat: string; title: string; designation: string; directive: string; transmission: string; artUrl: string; accent: string };

const INITIAL_MISSION = MISSIONS["level-01"];
const INITIAL_HUD: HudState = {
  playerHp: 100,
  playerMaxHp: 100,
  enemyHp: INITIAL_MISSION.opponent.maxHp,
  enemyMaxHp: INITIAL_MISSION.opponent.maxHp,
  playerState: "idle",
  enemyState: "idle",
  playerX: -3.55,
  enemyX: 3.55,
  matchState: "select",
  round: 1,
  playerRounds: 0,
  enemyRounds: 0,
  playerLabel: "AEGIS RIFT",
  playerCallsign: "PILOT-01",
  enemyLabel: INITIAL_MISSION.opponent.label,
  enemyCallsign: INITIAL_MISSION.opponent.callsign,
  selectedLoadout: "vanguard",
  missionKey: INITIAL_MISSION.key,
  missionTitle: INITIAL_MISSION.title,
  missionObjective: INITIAL_MISSION.objective,
  missionReward: INITIAL_MISSION.reward,
  missionLevel: 1,
  stage: 1,
  stageLabel: INITIAL_MISSION.stageLabel,
  theatreClass: "frontier",
  locationKey: INITIAL_MISSION.location.key,
  locationLabel: INITIAL_MISSION.location.label,
  locationCallout: INITIAL_MISSION.location.callout,
  surface: INITIAL_MISSION.location.surface,
  locationAccent: INITIAL_MISSION.location.accent,
  atmosphere: INITIAL_MISSION.location.atmosphere,
  backgroundUrl: INITIAL_MISSION.backgroundUrl,
  enemyArtUrl: INITIAL_MISSION.enemyArtUrl,
  soundOn: true,
  combo: 0,
  overdrive: false,
  specialCooldown: 0,
  specialReady: true,
  routeLabel: "RAIL TRIAD",
  routeStep: 0,
  routeLength: 3,
  routeNextInput: "strike",
  routeFinisherArmed: false,
  counterStatus: "",
  message: "COMMAND LINK // SELECT A LEVEL",
};

const DEFAULT_PROGRESS: CampaignProgress = { credits: 480, completed: [], medals: [], achievements: [], battlesWon: 0, campaignComplete: false };
const DEFAULT_SETTINGS: CabinetSettings = { reducedFx: false, scanlines: true, contrast: false };
const ACHIEVEMENTS = [
  { id: "first-link", title: "FIRST LINK", copy: "Secure Level 01.", icon: "◇" },
  { id: "frontier-cleared", title: "FRONTIER CLEARED", copy: "Complete all Stage I levels.", icon: "◈" },
  { id: "vault-breaker", title: "VAULT BREAKER", copy: "Reach the Final Stage.", icon: "▣" },
  { id: "zero-crown", title: "CROWN BREAKER", copy: "Secure Level 20.", icon: "✦" },
];

const BOSS_INTROS: Record<string, BossIntroData> = {
  "level-07": { missionKey: "level-07", threat: "STAGE I COMMANDER", title: "EMBER WRAITH", designation: "RAILHEAD EXECUTIONER", directive: "FRONTIER COMMAND", transmission: "YOU TOOK THE RAILS. NOW PAY THE FURNACE TAX.", artUrl: "/manus-storage/ember-wraith-custom-frame_75ff79a0.png", accent: "ember" },
  "level-14": { missionKey: "level-14", threat: "STAGE II COMMANDER", title: "WARDEN HELIX", designation: "FOUNDRY OVERSIGHT INTELLIGENCE", directive: "CINDER FOUNDRY", transmission: "ALL UNAUTHORIZED FRAMES WILL BE MELTED INTO THE LINE.", artUrl: "/manus-storage/warden-helix-boss-frame_114334d4.png", accent: "helix" },
  "level-20": { missionKey: "level-20", threat: "FINAL STAGE COMMANDER", title: "ZERO CROWN", designation: "NIGHT VAULT CATASTROPHE ENGINE", directive: "NIGHT VAULT", transmission: "YOU DID NOT BREAK THE CROWN. YOU ACTIVATED IT.", artUrl: "/manus-storage/zero-crown-final-boss-frame_f74aa26d.png", accent: "crown" },
};

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function Meter({ hp, maxHp, side }: { hp: number; maxHp: number; side: "player" | "enemy" }) {
  const active = Math.ceil((hp / maxHp) * 10);
  return <div className={`meter ${side}`} aria-label={`${side} integrity ${hp} out of ${maxHp}`}>{Array.from({ length: 10 }, (_, index) => <span className={`meter-segment ${index < active ? "active" : ""}`} key={index} />)}</div>;
}

function RoundPips({ wins, side }: { wins: number; side: "player" | "enemy" }) {
  return <div className={`round-pips ${side}`} aria-label={`${wins} rounds won`}>{[0, 1].map((index) => <span className={index < wins ? "won" : ""} key={index} />)}</div>;
}

function ActionButton({ action, children, className = "", onAction }: { action: InputAction; children: ReactNode; className?: string; onAction: (action: InputAction, pressed: boolean) => void }) {
  return <button type="button" className={`action-button ${className}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onAction(action, true); }} onPointerUp={() => onAction(action, false)} onPointerCancel={() => onAction(action, false)} onPointerLeave={(event) => { if (event.buttons === 1) onAction(action, false); }} aria-label={`Use ${action}`}>{children}</button>;
}

function NavButton({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick: () => void }) {
  return <button type="button" className={`console-nav-button ${active ? "active" : ""}`} onClick={onClick}>{children}</button>;
}

function CustomMecha({ side, action, position, artUrl, chassis, surface, specialName, specialKind }: { side: "player" | "enemy"; action: HudState["playerState"]; position: number; artUrl: string; chassis: string; surface: HudState["surface"]; specialName?: string; specialKind?: string }) {
  const percent = ((position + 6.25) / 12.5) * 100;
  return <div className={`custom-mecha ${side} chassis-${chassis} action-${action} surface-${surface} special-${specialKind ?? "none"}`} style={{ left: `${Math.max(10, Math.min(90, percent))}%` }} aria-hidden="true">
    <span className="mecha-ground-shadow" />
    <span className="mecha-contact-plate"><i /><i /><i /></span>
    <span className="custom-engine engine-top" />
    <span className="custom-engine engine-bottom" />
    <img className="custom-mecha-art" src={artUrl} alt="" />
    <span className="motion-rig"><span className="articulated-arm arm-back"><i /><b /></span><span className="articulated-arm arm-front"><i /><b /></span><span className="motion-weapon" /><span className="motion-impact" /></span>
    {action === "special" && specialName && <span className="special-move-flare"><b>{specialName}</b><i /></span>}
    {action === "guard" && <img className="prism-shield-art" src={PRISM_SHIELD_ART} alt="" />}
  </div>;
}

function CombatStage({ hud }: { hud: HudState }) {
  const playerChassis = LOADOUTS[hud.selectedLoadout].chassis;
  const playerSpecial = LOADOUTS[hud.selectedLoadout].special;
  const enemyChassis = MISSIONS[hud.missionKey]?.opponent.chassis ?? "raider";
  return <section className={`css-battle-stage theatre-${hud.theatreClass} level-stage-${hud.stage} surface-${hud.surface} atmosphere-${hud.atmosphere}`} aria-hidden="true">
    <div className="stage-art-backdrop" style={{ backgroundImage: `linear-gradient(128deg, ${hud.locationAccent}66 0%, transparent 48%, ${hud.locationAccent}20 100%), url(${hud.backgroundUrl})` }} />
    <div className="stage-sky" /><div className="stage-smoke smoke-a" /><div className="stage-smoke smoke-b" />
    <div className="stage-crane"><i /><b /></div><div className="stage-factory factory-a" /><div className="stage-factory factory-b" /><div className="stage-factory factory-c" /><div className="stage-stack stack-a" /><div className="stage-stack stack-b" />
    <div className="location-signal"><span>{hud.locationLabel}</span><small>{hud.locationCallout}</small></div>
    <CustomMecha side="player" action={hud.playerState} position={hud.playerX} artUrl={AEGIS_ART} chassis={playerChassis} surface={hud.surface} specialName={playerSpecial?.name} specialKind={playerSpecial?.kind} />
    <CustomMecha side="enemy" action={hud.enemyState} position={hud.enemyX} artUrl={hud.enemyArtUrl} chassis={enemyChassis} surface={hud.surface} />
    <div className="stage-catwalk" /><div className="stage-rail rail-top" /><div className="stage-rail rail-bottom" />
  </section>;
}

function initialConsoleView(): ConsoleView {
  const params = new URLSearchParams(window.location.search);
  if (params.has("demo")) return "battle";
  const requested = params.get("view");
  const validViews: ConsoleView[] = ["command", "missions", "roster", "rewards", "achievements", "settings", "hangar", "battle"];
  return validViews.includes(requested as ConsoleView) ? requested as ConsoleView : "command";
}

function initialBossIntro() {
  const requested = new URLSearchParams(window.location.search).get("boss");
  return requested ? BOSS_INTROS[requested] ?? null : null;
}

function initialEpilogue() {
  return new URLSearchParams(window.location.search).has("epilogue");
}

function BossIntro({ intro, onEngage, onSkip }: { intro: BossIntroData; onEngage: () => void; onSkip: () => void }) {
  return <section className={`boss-intro-overlay accent-${intro.accent}`} role="dialog" aria-modal="true" aria-label={`${intro.title} boss introduction`}>
    <div className="boss-intro-noise" /><div className="boss-intro-scanline" />
    <div className="boss-intro-header"><span>HOSTILE SIGNATURE DETECTED</span><span>THREAT // MAXIMUM</span></div>
    <div className="boss-intro-frame"><div className="boss-intro-portrait"><span className="boss-reticle" /><img src={intro.artUrl} alt={`${intro.title} enemy combat frame`} /></div><div className="boss-intro-copy"><span className="boss-kicker">{intro.threat}</span><h2>{intro.title}</h2><p className="boss-designation">{intro.designation}</p><div className="boss-divider" /><p className="boss-transmission">“{intro.transmission}”</p><dl><dt>THEATRE</dt><dd>{intro.directive}</dd><dt>DIRECTIVE</dt><dd>BREAK COMMAND LINK</dd></dl><div className="boss-intro-actions"><button type="button" className="primary-console-button" onClick={onEngage}>ENGAGE BOSS FRAME</button><button type="button" className="boss-skip-button" onClick={onSkip}>SKIP UPLINK</button></div></div></div>
    <div className="boss-intro-footer">BOSS UPLINK // PRESS ENGAGE TO INITIATE COMBAT</div>
  </section>;
}

function CampaignEpilogue({ onAcknowledge }: { onAcknowledge: () => void }) {
  return <section className="campaign-epilogue" role="dialog" aria-modal="true" aria-label="Campaign ending epilogue">
    <div className="epilogue-starfield" /><div className="epilogue-signal" />
    <header className="epilogue-header"><span>FINAL TRANSMISSION // NIGHT VAULT</span><span>CAMPAIGN CLEAR</span></header>
    <div className="epilogue-content"><div className="epilogue-reel"><div className="epilogue-frame frame-a"><img src={AEGIS_ART} alt="Aegis Rift standing above the restored rail network" /><span>01 // CROWN LINK BROKEN</span></div><div className="epilogue-frame frame-b"><span className="epilogue-reactor">✦</span><span>02 // VAULT REACTOR STABLE</span></div><div className="epilogue-frame frame-c"><span className="epilogue-sun" /><span>03 // RUSTBELT DAWN</span></div></div><div className="epilogue-copy"><span className="epilogue-kicker">THE LAST SIGNAL FADES</span><h2>THE CROWN<br /><em>FELL SILENT</em></h2><p>Zero Crown’s command lattice collapsed into the Night Vault. Across the Rustbelt, rail relays came back online—one cyan light at a time.</p><p className="epilogue-quote">“The arena was never the end of the line. It was the power switch.”</p><div className="epilogue-awards"><div><b>20 / 20</b><span>LINKS SECURED</span></div><div><b>✦</b><span>CROWN BREAKER</span></div><div><b>∞</b><span>NEW CYCLE READY</span></div></div><button type="button" className="primary-console-button" onClick={onAcknowledge}>RETURN TO COMMAND DECK</button></div></div>
    <footer className="epilogue-footer">PIXEL // MECHA BATTLE // END OF CAMPAIGN · BEGINNING OF THE NEXT CYCLE</footer>
  </section>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const gameRef = useRef<GameHandle | null>(null);
  const rewardedMatchRef = useRef("");
  const [hud, setHud] = useState(INITIAL_HUD);
  const [view, setView] = useState<ConsoleView>(initialConsoleView);
  const [loadout, setLoadout] = useState<LoadoutKey>("vanguard");
  const [missionKey, setMissionKey] = useState<MissionKey>(() => initialBossIntro()?.missionKey ?? (initialEpilogue() ? "level-20" : "level-01"));
  const [stageFilter, setStageFilter] = useState<CampaignStage>(1);
  const [progress, setProgress] = useState<CampaignProgress>(() => loadLocal("pixel-mecha-campaign", DEFAULT_PROGRESS));
  const [settings, setSettings] = useState<CabinetSettings>(() => loadLocal("pixel-mecha-settings", DEFAULT_SETTINGS));
  const [bossIntro, setBossIntro] = useState<BossIntroData | null>(initialBossIntro);
  const [epilogue, setEpilogue] = useState(initialEpilogue);

  useEffect(() => { window.localStorage.setItem("pixel-mecha-campaign", JSON.stringify(progress)); }, [progress]);
  useEffect(() => { window.localStorage.setItem("pixel-mecha-settings", JSON.stringify(settings)); }, [settings]);
  useEffect(() => {
    const preview = initialBossIntro();
    if (!preview) return;
    setMissionKey(preview.missionKey);
    setBossIntro(preview);
  }, []);
  useEffect(() => { if (hud.matchState === "match-victory" && hud.missionKey === "level-20") setEpilogue(true); }, [hud.matchState, hud.missionKey]);

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
    if (hud.matchState !== "match-victory" || rewardedMatchRef.current === hud.missionKey) return;
    rewardedMatchRef.current = hud.missionKey;
    setProgress((current) => {
      const fresh = !current.completed.includes(hud.missionKey);
      const completed = fresh ? [...current.completed, hud.missionKey] : current.completed;
      const credits = current.credits + (fresh ? hud.missionReward : Math.ceil(hud.missionReward / 4));
      const medals = new Set(current.medals ?? []);
      if (fresh) medals.add(hud.missionKey);
      const achievements = new Set(current.achievements);
      if (completed.includes("level-01")) achievements.add("first-link");
      if (CAMPAIGN_LEVELS.filter((item) => item.stage === 1).every((item) => completed.includes(item.key))) achievements.add("frontier-cleared");
      if (completed.some((key) => MISSIONS[key]?.stage === 3)) achievements.add("vault-breaker");
      if (completed.includes("level-20")) achievements.add("zero-crown");
      return { credits, completed, medals: Array.from(medals), battlesWon: current.battlesWon + 1, achievements: Array.from(achievements), campaignComplete: current.campaignComplete || hud.missionKey === "level-20" };
    });
  }, [hud.matchState, hud.missionKey, hud.missionReward]);

  const mission = MISSIONS[missionKey] ?? INITIAL_MISSION;
  const selected = LOADOUTS[loadout];
  const activeSpecial = selected.special;
  const activeRoute = COMBO_ROUTES[loadout];
  const cooldownRatio = activeSpecial ? Math.max(0, Math.min(1, 1 - hud.specialCooldown / activeSpecial.cooldown)) : 1;
  const completeSet = new Set(progress.completed.filter((key) => Boolean(MISSIONS[key])));
  const completeLevels = Array.from(completeSet);
  const medalSet = new Set((progress.medals ?? []).filter((key) => Boolean(MISSIONS[key])));
  const campaignComplete = progress.campaignComplete || completeSet.has("level-20");
  const nextOpen = CAMPAIGN_LEVELS.find((item) => !completeSet.has(item.key));
  const unlockedLevel = nextOpen?.level ?? 20;
  const stageLevels = CAMPAIGN_LEVELS.filter((item) => item.stage === stageFilter);
  const onAction = (action: InputAction, pressed: boolean) => gameRef.current?.setAction(action, pressed);
  const launchBattle = () => { rewardedMatchRef.current = ""; gameRef.current?.startMatch(loadout, missionKey); setView("battle"); };
  const launch = () => { const intro = BOSS_INTROS[missionKey]; if (intro) { setBossIntro(intro); return; } launchBattle(); };
  const engageBoss = () => { setBossIntro(null); launchBattle(); };
  const returnCommand = () => { gameRef.current?.returnToSelect(); setView("command"); };
  const acknowledgeEpilogue = () => { setEpilogue(false); returnCommand(); };
  const selectMission = (nextMission: MissionKey) => { setMissionKey(nextMission); setView("hangar"); };
  const setCabinet = (key: keyof CabinetSettings) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  return <main className={`mecha-app ${settings.reducedFx ? "fx-reduced" : ""} ${settings.scanlines ? "scanlines-on" : "scanlines-off"} ${settings.contrast ? "contrast-on" : ""}`}>
    <canvas ref={canvasRef} className="arena-canvas" aria-label="Pixel Mecha Battle playable arena. Use A and D to move, J to strike, K to guard, and R to return to Command Deck." />
    {view === "battle" ? <>
      <div className="arena-vignette" /><CombatStage hud={hud} /><div className="corner-warning" />
      <section className="battle-hud" aria-label="Battle interface">
        <header className="top-deck">
          <section className="plate vital-panel"><div className="pilot-line"><span>{hud.playerLabel}</span><span className="unit-tag">{hud.playerCallsign}</span></div><div className="meter-line"><Meter hp={hud.playerHp} maxHp={hud.playerMaxHp} side="player" /><span className="hp-number">{hud.playerHp}</span></div><RoundPips wins={hud.playerRounds} side="player" /></section>
          <section className="plate brand-plate"><span className="brand-reactor" aria-hidden="true"><i /><b /></span><div><div className="brand-title">PIXEL // MECHA</div><div className="brand-sub">STAGE {hud.stage} // LEVEL {String(hud.missionLevel).padStart(2, "0")}</div></div><button type="button" className={`audio-toggle ${hud.soundOn ? "on" : "off"}`} onClick={() => gameRef.current?.toggleAudio()}>{hud.soundOn ? "SND ON" : "SND OFF"}</button></section>
          <section className="plate vital-panel enemy"><div className="pilot-line"><span>{hud.enemyLabel}</span><span className="unit-tag">{hud.enemyCallsign}</span></div><div className="meter-line"><Meter hp={hud.enemyHp} maxHp={hud.enemyMaxHp} side="enemy" /><span className="hp-number">{hud.enemyHp}</span></div><RoundPips wins={hud.enemyRounds} side="enemy" /></section>
        </header>
        <div className="round-dock" aria-live="polite"><div className="round-readout">LVL-{String(hud.missionLevel).padStart(2, "0")} // R0{hud.round}<br />BEST OF 03</div><div className="location-readout"><span>{hud.locationLabel}</span><small>{hud.locationCallout}</small></div><div className={`route-readout ${hud.routeFinisherArmed ? "armed" : ""}`}><b>{hud.routeFinisherArmed ? activeRoute.finisher : activeRoute.label}</b><span>{hud.routeFinisherArmed ? "FINISHER ARMED" : `ROUTE ${hud.routeStep}/${hud.routeLength} · NEXT ${hud.routeNextInput.toUpperCase()}`}</span></div>{hud.combo > 0 && <div className={`combo-readout ${hud.overdrive ? "overdrive" : ""}`}><b>{hud.combo}X</b><span>{hud.overdrive ? "OVERDRIVE" : "COMBO"}</span></div>}{hud.counterStatus && <div className="commander-counter">{hud.counterStatus}</div>}<div className="status-copy">{hud.message}</div></div>
        <footer className="bottom-deck"><aside className="plate manual"><div className="manual-header"><span className="info-label">{hud.stageLabel}</span><span className="system-line">{hud.playerState.toUpperCase()}</span></div><p>{hud.missionObjective}</p><dl><dt>MOVE</dt><dd>A / D or ← / →</dd><dt>MELEE</dt><dd>J or SPACE</dd><dt>PRISM GUARD</dt><dd>HOLD K</dd><dt>VECTOR BOOST</dt><dd>L or SHIFT</dd><dt>FRAME SPECIAL</dt><dd>Q // {activeSpecial?.name ?? "SPECIAL"}</dd><dt>ROUTE</dt><dd>{activeRoute.sequence.map((step) => step === "special" ? "Q" : "J").join(" → ")} // {activeRoute.finisher}</dd><dt>OVERDRIVE</dt><dd>LAND 3 CLEAN HITS</dd></dl></aside><div className="action-cluster"><ActionButton action="strike" className="strike" onAction={onAction}><strong>J</strong>MELEE</ActionButton><ActionButton action="guard" className="guard" onAction={onAction}><strong>K</strong>PRISM GUARD</ActionButton><ActionButton action="boost" className="boost" onAction={onAction}><strong>L</strong>BOOST</ActionButton><ActionButton action="special" className={`special ${hud.specialReady ? "ready" : "cooling"}`} onAction={onAction}><strong>Q</strong><span className="special-button-name">{activeSpecial?.name ?? "SPECIAL"}</span><span className="special-cooldown"><i style={{ width: `${cooldownRatio * 100}%` }} /><small>{hud.specialReady ? "READY" : `${hud.specialCooldown.toFixed(1)}S`}</small></span></ActionButton></div><div className="direction-pad"><ActionButton action="left" onAction={onAction}><span>◀</span></ActionButton><ActionButton action="right" onAction={onAction}><span>▶</span></ActionButton></div></footer>
      </section>
      {hud.matchState === "round-result" && <section className="round-flash"><span>ROUND {hud.playerRounds + hud.enemyRounds} COMPLETE</span><strong>{hud.playerRounds > hud.enemyRounds ? "AEGIS HOLDS" : "HOSTILE HOLDS"}</strong><small>RE-ARMING NEXT LINK</small></section>}
      {hud.matchState === "match-victory" && <section className="ending-overlay victory"><div className="ending-kicker">LEVEL COMPLETE</div><div className="ending-title">OBJECTIVE SECURED</div><div className="ending-copy">{hud.playerLabel} secured Level {hud.missionLevel} and recovered +{hud.missionReward} salvage.</div><button type="button" className="reset-button" onClick={() => setView("rewards")}>CLAIM REWARD CACHE</button></section>}
      {hud.matchState === "match-defeat" && <section className="ending-overlay defeat"><div className="ending-kicker">LEVEL FAILED</div><div className="ending-title">FRAME BREACHED</div><div className="ending-copy">{hud.enemyLabel} held Level {hud.missionLevel}. Refit and try again.</div><button type="button" className="reset-button" onClick={returnCommand}>RETURN TO COMMAND</button></section>}
    </> : <section className="command-console" aria-label="Pixel Mecha Battle command console">
      <div className="command-backdrop" style={{ backgroundImage: `linear-gradient(90deg, rgba(9,13,13,.85), rgba(9,13,13,.24)), url(${view === "command" ? ROSTER_ART : mission.backgroundUrl})` }} />
      <header className="command-header"><button type="button" className="command-brand" onClick={() => setView("command")}><span className="brand-reactor" aria-hidden="true"><i /><b /></span><span><strong>PIXEL // MECHA</strong><small>20-LEVEL CAMPAIGN</small></span></button><div className="command-totals"><span>⌬ {progress.credits.toLocaleString()} SALVAGE</span><span>✦ {progress.achievements.length}/4 BADGES</span></div></header>
      <nav className="command-nav"><NavButton active={view === "command"} onClick={() => setView("command")}>⌬ COMMAND</NavButton><NavButton active={view === "missions"} onClick={() => setView("missions")}>▣ LEVELS</NavButton><NavButton active={view === "roster"} onClick={() => setView("roster")}>▥ ROSTER</NavButton><NavButton active={view === "rewards"} onClick={() => setView("rewards")}>◉ REWARDS</NavButton><NavButton active={view === "achievements"} onClick={() => setView("achievements")}>✦ BADGES</NavButton><NavButton active={view === "settings"} onClick={() => setView("settings")}>⚙ SETTINGS</NavButton></nav>
      {view === "command" && campaignComplete && <div className="campaign-complete-seal"><span>✦</span><b>CAMPAIGN COMPLETE</b><small>ZERO CROWN TERMINATED // RUSTBELT RELAYS RESTORED</small></div>}
      <div className="console-content">
        {view === "command" && <section className="command-hero"><div className="hero-kicker">OPS CONTROL // THREE STAGES</div><h1>BREAK<br /><em>THE CROWN</em></h1><p>Twenty combat links span the Scrapline Frontier, Cinder Foundry, and the final Night Vault. Every level increases enemy intent, speed, pressure, and reward.</p><div className="hero-actions"><button type="button" className="primary-console-button" onClick={() => setView("missions")}>DEPLOY // LEVEL BOARD</button><button type="button" className="secondary-console-button" onClick={() => setView("roster")}>INSPECT ACTIVE FRAMES</button></div><aside className="command-operation"><span className="operation-kicker">NEXT DEPLOYMENT</span><b>{mission.location.label}</b><small>{mission.location.callout} · LVL {String(mission.level).padStart(2, "0")}</small><div><span>⌖ SURFACE // {mission.location.surface.toUpperCase()}</span><span>⚡ AI // {mission.difficulty}/20</span><span>◈ OVERDRIVE // READY</span></div></aside><div className="command-stats"><article><b>{completeLevels.length}/20</b><span>LEVELS SECURED</span></article><article><b>STAGE {Math.min(3, Math.ceil(unlockedLevel / 7))}</b><span>CURRENT PUSH</span></article><article><b>{selected.callsign}</b><span>ACTIVE FRAME</span></article></div></section>}
        {view === "missions" && <section className="console-panel campaign-board"><div className="panel-heading"><span>CAMPAIGN BOARD // 20 LEVELS</span><h2>SELECT A COMBAT LINK</h2><p>Each new level changes the fight location, surface response, arena atmosphere, hostile AI pressure, and salvage yield.</p></div><div className="stage-tabs">{([1, 2, 3] as CampaignStage[]).map((stage) => <button type="button" className={stageFilter === stage ? "active" : ""} onClick={() => setStageFilter(stage)} key={stage}>STAGE {stage}</button>)}</div><div className={`stage-rail stage-${stageFilter}`}><div className="stage-rail-header"><span>{stageLevels[0].stageLabel}</span><b>{stageLevels[0].theatre}</b></div><div className="level-grid">{stageLevels.map((item) => { const complete = completeSet.has(item.key); const locked = item.level > unlockedLevel; return <button type="button" disabled={locked} className={`level-card ${complete ? "complete" : ""} ${locked ? "locked" : ""}`} onClick={() => selectMission(item.key)} key={item.key}><span>LEVEL {String(item.level).padStart(2, "0")}</span><strong>{item.title}</strong><i>{item.location.label}</i><small>{locked ? "LINK LOCKED" : complete ? "SECURED" : item.location.callout}</small><footer><em>AI {item.difficulty}/20</em><b>+{item.reward}</b></footer></button>; })}</div></div></section>}
        {view === "hangar" && <section className="console-panel hangar-console"><div className="panel-heading"><span>{mission.stageLabel} // LEVEL {String(mission.level).padStart(2, "0")}</span><h2>ASSIGN A CUSTOM FRAME</h2><p>{mission.objective} Hostile: <strong>{mission.opponent.label}</strong>.</p></div><div className="hangar-showcase"><img src={AEGIS_ART} alt="Aegis Rift custom cobalt assault frame" /><div><b>ACTIVE PILOT FRAME</b><strong>{selected.label}</strong><p>{selected.description}</p><span>FRAME SPECIAL // {selected.special?.name} · {selected.special?.tactical}</span><span>COMBO ROUTE // {activeRoute.label} · {activeRoute.sequence.map((step) => step === "special" ? "Q" : "J").join(" → ")} → {activeRoute.finisher}</span></div></div><div className="loadout-grid expanded">{Object.values(LOADOUTS).map((profile) => { const route = COMBO_ROUTES[profile.key as LoadoutKey]; return <button type="button" className={`loadout-card ${profile.chassis} ${loadout === profile.key ? "selected" : ""}`} onClick={() => setLoadout(profile.key as LoadoutKey)} key={profile.key}><span className="loadout-code">{profile.callsign}</span><span className="mecha-portrait" aria-hidden="true"><i className="portrait-head" /><i className="portrait-torso" /><i className="portrait-arm arm-left" /><i className="portrait-arm arm-right" /><i className="portrait-leg leg-left" /><i className="portrait-leg leg-right" /><b className="portrait-core" /></span><strong>{profile.label}</strong><span className="loadout-description">{profile.description}</span><span className="loadout-special">Q // {profile.special?.name}</span><span className="loadout-route">{route.sequence.map((step) => step === "special" ? "Q" : "J").join(" → ")} // {route.finisher}</span><span className="loadout-stats">HP {profile.maxHp} · SPD {profile.speed.toFixed(2)} · DMG {profile.strikeDamage}</span></button>; })}</div><div className="hangar-launch-row"><button type="button" className="secondary-console-button" onClick={() => setView("missions")}>BACK TO LEVELS</button><button type="button" className="primary-console-button" onClick={launch}>LAUNCH LEVEL {String(mission.level).padStart(2, "0")}</button></div></section>}
        {view === "roster" && <section className="console-panel"><div className="panel-heading"><span>BLUE FACTION // CUSTOM INVENTORY</span><h2>FRAME ROSTER</h2><p>Each pilot frame has its own silhouette, thruster behavior, defensive response, combat rhythm, special, and advanced route.</p></div><div className="roster-table">{Object.values(LOADOUTS).map((profile) => { const route = COMBO_ROUTES[profile.key as LoadoutKey]; return <article className={`roster-row ${profile.chassis}`} key={profile.key}><div className="mini-mecha"><span className="mini-head" /><span className="mini-body" /><span className="mini-core" /><i /></div><div><b>{profile.label}</b><span>{profile.callsign} · {profile.description}</span><em>Q // {profile.special?.name} · {profile.special?.tactical}<br />ROUTE // {route.sequence.map((step) => step === "special" ? "Q" : "J").join(" → ")} → {route.finisher}</em></div><div className="roster-stat"><small>INTEGRITY</small><strong>{profile.maxHp}</strong></div><div className="roster-stat"><small>SPEED</small><strong>{profile.speed.toFixed(2)}</strong></div><button type="button" onClick={() => { setLoadout(profile.key as LoadoutKey); setView("missions"); }}>FIELD FRAME</button></article>; })}</div></section>}
        {view === "rewards" && <section className="console-panel reward-panel"><div className="reward-art"><img src={REWARD_ART} alt="A glowing industrial reward crate with achievement emblems" /></div><div className="panel-heading"><span>SUPPLY LINK // LEVEL CACHE</span><h2>REWARD CACHE</h2><p>New level clears grant the full salvage cache. Repeat clears still award tactical salvage for experimental frame upgrades.</p><div className="reward-total"><strong>{progress.credits.toLocaleString()}</strong><span>AVAILABLE SALVAGE</span></div><button type="button" className="primary-console-button" onClick={returnCommand}>RETURN TO COMMAND</button></div><div className="cache-history">{completeLevels.length ? completeLevels.map((key) => <div key={key}><span>{MISSIONS[key].code}</span><b>{MISSIONS[key].title}</b><em>SECURED +{MISSIONS[key].reward}</em></div>) : <p>NO LEVEL CACHES RECOVERED. DEPLOY TO LEVEL 01 TO START THE LINK.</p>}</div></section>}
        {view === "achievements" && <section className="console-panel"><div className="panel-heading"><span>PERSONNEL RECORD // BLUE FACTION</span><h2>ACHIEVEMENTS</h2><p>Operational merits now track three-stage campaign progression.</p></div><div className="achievement-grid">{ACHIEVEMENTS.map((achievement) => { const unlocked = progress.achievements.includes(achievement.id); return <article className={`achievement-card ${unlocked ? "unlocked" : ""}`} key={achievement.id}><span>{unlocked ? achievement.icon : "×"}</span><div><b>{achievement.title}</b><p>{achievement.copy}</p></div><em>{unlocked ? "UNLOCKED" : "LOCKED"}</em></article>; })}</div></section>}
        {view === "settings" && <section className="console-panel settings-panel"><div className="panel-heading"><span>CABINET CONTROL // LOCAL PROFILE</span><h2>SETTINGS</h2><p>Adjust the visual signal without changing gameplay rules or campaign progression.</p></div><div className="setting-list"><button type="button" onClick={() => setCabinet("scanlines")}><span><b>CRT SCANLINES</b><small>Adds a low-contrast cabinet screen texture.</small></span><i className={settings.scanlines ? "switch-on" : ""}>{settings.scanlines ? "ON" : "OFF"}</i></button><button type="button" onClick={() => setCabinet("reducedFx")}><span><b>REDUCED EFFECTS</b><small>Minimizes ambient sparks, engine trails, and stage motion.</small></span><i className={settings.reducedFx ? "switch-on" : ""}>{settings.reducedFx ? "ON" : "OFF"}</i></button><button type="button" onClick={() => setCabinet("contrast")}><span><b>HIGH-CONTRAST PANELS</b><small>Boosts text and interface plate separation.</small></span><i className={settings.contrast ? "switch-on" : ""}>{settings.contrast ? "ON" : "OFF"}</i></button><button type="button" onClick={() => gameRef.current?.toggleAudio()}><span><b>CABINET SOUND</b><small>Controls the arena music loop and combat chip effects.</small></span><i className={hud.soundOn ? "switch-on" : ""}>{hud.soundOn ? "ON" : "OFF"}</i></button></div></section>}
      </div>
    </section>}
    {bossIntro && <BossIntro intro={bossIntro} onEngage={engageBoss} onSkip={engageBoss} />}
    {epilogue && <CampaignEpilogue onAcknowledge={acknowledgeEpilogue} />}
  </main>;
}
