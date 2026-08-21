// Rustbelt Arena design reminder: the hangar selector and match HUD must feel like bolted-on arcade machine hardware, preserving the mecha duel as the center-line read.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/texture";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createGameScene } from "@/game/scene";
import { LOADOUTS, type GameHandle, type HudState, type InputAction, type LoadoutKey } from "@/game/types";

const REACTOR_MARK = "/manus-storage/reactor-core-mark_76dd0b87.png";
const INITIAL_HUD: HudState = { playerHp: 100, playerMaxHp: 100, enemyHp: 100, enemyMaxHp: 100, playerState: "idle", enemyState: "idle", playerX: -3.55, enemyX: 3.55, matchState: "select", round: 1, playerRounds: 0, enemyRounds: 0, playerLabel: "BLUE VANGUARD", playerCallsign: "UNIT 01", selectedLoadout: "vanguard", soundOn: true, message: "HANGAR LINK // SELECT A FRAME" };

function PixelMecha({ side, action, position, loadout }: { side: "player" | "enemy"; action: HudState["playerState"]; position: number; loadout?: LoadoutKey }) {
  const percent = ((position + 6.25) / 12.5) * 100;
  const frameClass = side === "player" ? loadout ?? "vanguard" : "raider";
  return <div className={`pixel-fighter ${side} ${frameClass} action-${action}`} style={{ left: `${Math.max(7, Math.min(93, percent))}%` }} aria-hidden="true"><i className="fighter-head" /><i className="fighter-visor" /><i className="fighter-body" /><i className="fighter-arm arm-one" /><i className="fighter-arm arm-two" /><i className="fighter-leg leg-one" /><i className="fighter-leg leg-two" /><b className="fighter-core" /><em className="fighter-shield" /><em className="fighter-slash" /></div>;
}

function CombatStage({ hud }: { hud: HudState }) {
  return <section className="css-battle-stage" aria-hidden="true"><div className="stage-sky" /><div className="stage-smoke smoke-a" /><div className="stage-smoke smoke-b" /><div className="stage-crane"><i /><b /></div><div className="stage-factory factory-a" /><div className="stage-factory factory-b" /><div className="stage-factory factory-c" /><div className="stage-stack stack-a" /><div className="stage-stack stack-b" /><PixelMecha side="player" action={hud.playerState} position={hud.playerX} loadout={hud.selectedLoadout} /><PixelMecha side="enemy" action={hud.enemyState} position={hud.enemyX} /><div className="stage-catwalk" /><div className="stage-rail rail-top" /><div className="stage-rail rail-bottom" /></section>;
}

function Meter({ hp, maxHp, side }: { hp: number; maxHp: number; side: "player" | "enemy" }) {
  const activeSegments = Math.ceil((hp / maxHp) * 10);
  return <div className={`meter ${side}`} aria-label={`${side} health ${hp} out of ${maxHp}`}>{Array.from({ length: 10 }, (_, index) => <span className={`meter-segment ${index < activeSegments ? "active" : ""}`} key={index} />)}</div>;
}

function RoundPips({ wins, side }: { wins: number; side: "player" | "enemy" }) {
  return <div className={`round-pips ${side}`} aria-label={`${wins} rounds won`}>{[0, 1].map((index) => <span className={index < wins ? "won" : ""} key={index} />)}</div>;
}

function ActionButton({ action, children, className = "", onAction }: { action: InputAction; children: ReactNode; className?: string; onAction: (action: InputAction, pressed: boolean) => void }) {
  return <button type="button" className={`action-button ${className}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onAction(action, true); }} onPointerUp={() => onAction(action, false)} onPointerCancel={() => onAction(action, false)} onPointerLeave={(event) => { if (event.buttons === 1) onAction(action, false); }} aria-label={`Use ${action}`}>{children}</button>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const gameRef = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState(INITIAL_HUD);
  const [loadout, setLoadout] = useState<LoadoutKey>("vanguard");

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
      const advanceGame = (time: number) => {
        if (disposed) return;
        handle.update(Math.min(0.05, (time - previousTime) / 1000));
        previousTime = time;
        animationFrame = window.requestAnimationFrame(advanceGame);
      };
      animationFrame = window.requestAnimationFrame(advanceGame);
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => { disposed = true; window.cancelAnimationFrame(animationFrame); window.removeEventListener("resize", onResize); gameRef.current?.dispose(); gameRef.current = null; engine.dispose(); startedRef.current = false; };
  }, []);

  const onAction = (action: InputAction, pressed: boolean) => gameRef.current?.setAction(action, pressed);
  const selected = LOADOUTS[loadout];
  const matchEnded = hud.matchState === "match-victory" || hud.matchState === "match-defeat";

  return <main className="mecha-app">
    <canvas ref={canvasRef} className="arena-canvas" aria-label="Pixel Mecha Battle playable arena. Choose a frame, then use A and D to move, J to strike, K to guard, and R to return to Hangar Select." />
    <div className="arena-vignette" />
    <CombatStage hud={hud} />
    <div className="corner-warning" />
    <section className="battle-hud" aria-label="Battle interface">
      <header className="top-deck">
        <section className="plate vital-panel" aria-label={`${hud.playerLabel} health`}>
          <div className="pilot-line"><span>{hud.playerLabel}</span><span className="unit-tag">{hud.playerCallsign}</span></div>
          <div className="meter-line"><Meter hp={hud.playerHp} maxHp={hud.playerMaxHp} side="player" /><span className="hp-number">{hud.playerHp}</span></div>
          <RoundPips wins={hud.playerRounds} side="player" />
        </section>
        <section className="plate brand-plate" aria-label="Pixel Mecha Battle">
          <img className="brand-mark" src={REACTOR_MARK} alt="Angular teal reactor core emblem" />
          <span className="brand-reactor" aria-hidden="true"><i /><b /></span>
          <div><div className="brand-title">PIXEL // MECHA</div><div className="brand-sub">TOURNAMENT LINK</div></div>
          <button type="button" className={`audio-toggle ${hud.soundOn ? "on" : "off"}`} onClick={() => gameRef.current?.toggleAudio()} aria-pressed={hud.soundOn}>{hud.soundOn ? "SND ON" : "SND OFF"}</button>
        </section>
        <section className="plate vital-panel enemy" aria-label="Red Raider health">
          <div className="pilot-line"><span>RED RAIDER</span><span className="unit-tag">UNIT 02</span></div>
          <div className="meter-line"><Meter hp={hud.enemyHp} maxHp={hud.enemyMaxHp} side="enemy" /><span className="hp-number">{hud.enemyHp}</span></div>
          <RoundPips wins={hud.enemyRounds} side="enemy" />
        </section>
      </header>
      <div className="round-dock" aria-live="polite"><div className="round-readout">BEST OF 03<br />ROUND 0{hud.round}</div><div className="status-copy">{hud.message}</div></div>
      <footer className="bottom-deck">
        <aside className="plate manual"><div className="manual-header"><span className="info-label">{selected.key.toUpperCase()} DATA</span><span className="system-line">{hud.playerState.toUpperCase()}</span></div><dl><dt>MOVE</dt><dd>A / D or ← / →</dd><dt>STRIKE</dt><dd>J or SPACE</dd><dt>GUARD</dt><dd>HOLD K</dd></dl></aside>
        <div className="action-cluster" aria-label="Combat action buttons"><ActionButton action="strike" className="strike" onAction={onAction}><strong>J</strong>STRIKE</ActionButton><ActionButton action="guard" className="guard" onAction={onAction}><strong>K</strong>GUARD</ActionButton></div>
        <div className="direction-pad" aria-label="Movement buttons"><ActionButton action="left" onAction={onAction}><span>◀</span></ActionButton><ActionButton action="right" onAction={onAction}><span>▶</span></ActionButton></div>
      </footer>
    </section>
    {hud.matchState === "select" && <section className="hangar-overlay" role="dialog" aria-modal="true" aria-label="Select your mecha loadout"><div className="hangar-beam beam-one" /><div className="hangar-beam beam-two" /><div className="hangar-heading"><div className="heading-row"><span className="hangar-reactor" aria-hidden="true" /><div className="ending-kicker">HANGAR SELECT // BLUE FACTION</div></div><h1>CHOOSE YOUR FRAME</h1><p>First pilot to secure two rounds takes the Rustbelt Arena.</p></div><RadioGroup value={loadout} onValueChange={(value) => setLoadout(value as LoadoutKey)} className="loadout-grid" aria-label="Available mecha loadouts">{Object.values(LOADOUTS).map((profile) => <label className={`loadout-card ${profile.key} ${loadout === profile.key ? "selected" : ""}`} key={profile.key}><RadioGroupItem value={profile.key} className="mecha-radio" /><span className="loadout-code">{profile.callsign}</span><span className="mecha-portrait" aria-hidden="true"><i className="portrait-head" /><i className="portrait-torso" /><i className="portrait-arm arm-left" /><i className="portrait-arm arm-right" /><i className="portrait-leg leg-left" /><i className="portrait-leg leg-right" /><b className="portrait-core" /></span><strong>{profile.label}</strong><span className="loadout-description">{profile.description}</span><span className="loadout-stats">HP {profile.maxHp} · SPD {profile.speed.toFixed(2)} · DMG {profile.strikeDamage}</span></label>)}</RadioGroup><button type="button" className="launch-button" onClick={() => gameRef.current?.startMatch(loadout)}>LAUNCH {selected.label}</button><p className="hangar-note">Sound starts when you launch. You can mute the cabinet through SND ON in the header.</p></section>}
    {hud.matchState === "round-result" && <section className="round-flash" aria-live="assertive"><span>ROUND {hud.playerRounds + hud.enemyRounds} COMPLETE</span><strong>{hud.playerRounds > hud.enemyRounds ? "BLUE FRAME HOLDS" : "RED RAIDER HOLDS"}</strong><small>RE-ARMING NEXT LINK</small></section>}
    {matchEnded && <section className={`ending-overlay ${hud.matchState === "match-victory" ? "victory" : "defeat"}`} role="dialog" aria-modal="true" aria-label={hud.matchState === "match-victory" ? "Match victory" : "Match defeat"}><div className="ending-kicker">BEST OF THREE COMPLETE</div><div className="ending-title">{hud.matchState === "match-victory" ? "ARENA SECURED" : "FRAME BREACHED"}</div><div className="ending-copy">{hud.matchState === "match-victory" ? `${hud.playerLabel} wins the tournament link ${hud.playerRounds}–${hud.enemyRounds}.` : `RED RAIDER wins the tournament link ${hud.enemyRounds}–${hud.playerRounds}.`}</div><button type="button" className="reset-button" onClick={() => gameRef.current?.returnToSelect()}>R // HANGAR SELECT</button></section>}
  </main>;
}
