// Rustbelt Arena design reminder: this component is the physical arcade cabinet frame; it surrounds, but never competes with, the side-on duel.
import { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene } from "@/game/scene";
import type { GameHandle, HudState, InputAction } from "@/game/types";

const REACTOR_MARK = "/manus-storage/reactor-core-mark_76dd0b87.png";

const INITIAL_HUD: HudState = {
  playerHp: 100, enemyHp: 100, playerState: "idle", enemyState: "idle", matchState: "active", message: "SYSTEM READY // CLOSE DISTANCE",
};

function Meter({ hp, side }: { hp: number; side: "player" | "enemy" }) {
  const activeSegments = Math.ceil(hp / 10);
  return <div className={`meter ${side}`} aria-label={`${side} health ${hp} out of 100`}>
    {Array.from({ length: 10 }, (_, index) => <span className={`meter-segment ${index < activeSegments ? "active" : ""}`} key={index} />)}
  </div>;
}

function ActionButton({ action, children, className = "", onAction }: { action: InputAction; children: React.ReactNode; className?: string; onAction: (action: InputAction, pressed: boolean) => void }) {
  return <button type="button" className={`action-button ${className}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onAction(action, true); }} onPointerUp={() => onAction(action, false)} onPointerCancel={() => onAction(action, false)} onPointerLeave={(event) => { if (event.buttons === 1) onAction(action, false); }} aria-label={typeof children === "string" ? children : `Use ${action}`}>
    {children}
  </button>;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const gameRef = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState(INITIAL_HUD);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let disposed = false;
    createGameScene(engine, canvas, (next) => { if (!disposed) setHud(next); }).then((handle) => {
      if (disposed) { handle.dispose(); return; }
      gameRef.current = handle;
      engine.runRenderLoop(() => handle.scene.render());
    });
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      gameRef.current?.dispose();
      gameRef.current = null;
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const onAction = (action: InputAction, pressed: boolean) => gameRef.current?.setAction(action, pressed);
  const ended = hud.matchState !== "active";
  const win = hud.matchState === "victory";

  return <main className="mecha-app">
    <canvas ref={canvasRef} className="arena-canvas" aria-label="Pixel Mecha Battle playable arena. Use A and D to move, J to strike, K to guard, and R to reset." />
    <div className="arena-vignette" />
    <div className="corner-warning" />
    <section className="battle-hud" aria-label="Battle interface">
      <header className="top-deck">
        <section className="plate vital-panel" aria-label="Blue Vanguard health">
          <div className="pilot-line"><span>BLUE VANGUARD</span><span className="unit-tag">UNIT 01</span></div>
          <div className="meter-line"><Meter hp={hud.playerHp} side="player" /><span className="hp-number">{hud.playerHp}</span></div>
        </section>
        <section className="plate brand-plate" aria-label="Pixel Mecha Battle">
          <img className="brand-mark" src={REACTOR_MARK} alt="Angular teal reactor core emblem" />
          <div><div className="brand-title">PIXEL // MECHA</div><div className="brand-sub">RUSTBELT ARENA</div></div>
        </section>
        <section className="plate vital-panel enemy" aria-label="Red Raider health">
          <div className="pilot-line"><span>RED RAIDER</span><span className="unit-tag">UNIT 02</span></div>
          <div className="meter-line"><Meter hp={hud.enemyHp} side="enemy" /><span className="hp-number">{hud.enemyHp}</span></div>
        </section>
      </header>

      <div className="round-dock" aria-live="polite">
        <div className="round-readout">ROUND 01<br />LINK ACTIVE</div>
        <div className="status-copy">{hud.message}</div>
      </div>

      <footer className="bottom-deck">
        <aside className="plate manual">
          <div className="manual-header"><span className="info-label">PILOT MANUAL</span><span className="system-line">{hud.playerState.toUpperCase()}</span></div>
          <dl><dt>MOVE</dt><dd>A / D or ← / →</dd><dt>STRIKE</dt><dd>J or SPACE</dd><dt>GUARD</dt><dd>HOLD K</dd></dl>
        </aside>
        <div className="action-cluster" aria-label="Combat action buttons">
          <ActionButton action="strike" className="strike" onAction={onAction}><strong>J</strong>STRIKE</ActionButton>
          <ActionButton action="guard" className="guard" onAction={onAction}><strong>K</strong>GUARD</ActionButton>
        </div>
        <div className="direction-pad" aria-label="Movement buttons">
          <ActionButton action="left" onAction={onAction}><span>◀</span></ActionButton>
          <ActionButton action="right" onAction={onAction}><span>▶</span></ActionButton>
        </div>
      </footer>
    </section>
    {ended && <section className={`ending-overlay ${win ? "victory" : "defeat"}`} role="dialog" aria-modal="true" aria-label={win ? "Victory" : "Defeat"}>
      <div className="ending-kicker">COMBAT RESULT</div>
      <div className="ending-title">{win ? "ARENA SECURED" : "FRAME BREACHED"}</div>
      <div className="ending-copy">{win ? "RED RAIDER POWER CORE HAS GONE DARK." : "BLUE VANGUARD REQUIRES A FRESH COMBAT LINK."}</div>
      <button type="button" className="reset-button" onClick={() => gameRef.current?.reset()}>R // RE-ARM</button>
    </section>}
  </main>;
}

