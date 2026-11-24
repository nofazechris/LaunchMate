"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { boxes, WORLD_OBJECTS } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { useLaunchmate } from "@/components/LaunchmateProvider";

export default function WorldScreen() {
  const { bizUrl } = useLaunchmate();
  const [rot, setRot] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const scene = useMemo(() => boxes(6, focus), [focus]);
  const obj = WORLD_OBJECTS.find((o) => o.key === focus);
  const statusOf = (k: string, fallback: string) => (k === "domain" ? bizUrl : fallback);

  const onDown = (e: PointerEvent) => { drag.current = { x: e.clientX, r: rot }; };
  const onMove = (e: PointerEvent) => {
    if (!drag.current) return;
    setRot(Math.max(-35, Math.min(35, drag.current.r + (e.clientX - drag.current.x) * 0.25)));
  };
  const onUp = () => { drag.current = null; };

  return (
    <div data-screen-label="05 Business World" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Business World</h1>
          <span style={css("font-size:14px;color:#78817B")}>A live model of your business. Drag to rotate, pick a part to open it.</span>
        </div>
        <div style={css("display:flex;padding:3px;border-radius:12px;background:#FFFFFF;border:1px solid #E8ECE8")}>
          <Link href="/overview" style={css("font-size:13px;padding:7px 12px;border-radius:9px;color:#5E6862")}>Business Overview</Link>
          <span style={css("font-size:13px;padding:7px 12px;border-radius:9px;background:#EEF6F0;color:#185C3B;font-weight:500")}>Business World</span>
        </div>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px")}>
        <div style={css("grid-column:span 2;position:relative;min-height:520px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;overflow:hidden")}>
          <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} style={css("position:absolute;inset:0;container-type:size;cursor:grab;touch-action:pan-y")}>
            <IsoScene size={62} offset={6} transform={`rotateX(58deg) rotateZ(${45 + rot}deg)`} transition="transform .5s cubic-bezier(.2,.8,.2,1)" sway={16}>
              <IsoBoxes boxes={scene} variant="world" />
            </IsoScene>
          </div>
          <div style={css("position:absolute;left:14px;bottom:14px;display:flex;gap:6px")}>
            <button onClick={() => { setRot(0); setFocus(null); }} style={css("height:34px;padding:0 12px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;font-size:12px;cursor:pointer")}>Reset view</button>
          </div>
          {obj && (
            <div style={css("position:absolute;right:14px;top:14px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:12px;padding:12px 14px;font-size:13px;display:flex;flex-direction:column;gap:3px;box-shadow:0 8px 24px rgba(32,39,35,.08);animation:lmIn .25s ease-out")}>
              <span style={css("font-weight:600")}>{obj.label}</span>
              <span style={css("color:#78817B")}>{statusOf(obj.key, obj.status)}</span>
              <Link href={`/${obj.route}`} style={css("margin-top:6px;font-size:12px;padding:7px 10px;border-radius:8px;background:#26734D;color:#FFFFFF;text-align:center")}>Open {obj.label}</Link>
            </div>
          )}
        </div>

        <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:2px")}>
          <span style={css("font-size:13px;color:#78817B;margin:4px 8px 10px")}>Business parts</span>
          {WORLD_OBJECTS.map((w) => (
            <button key={w.key} onClick={() => setFocus(w.key)} onMouseEnter={() => setFocus(w.key)} className="hv-grey" style={{ ...css("display:flex;align-items:center;gap:10px;padding:11px 10px;border-radius:10px;border:none;text-align:left;cursor:pointer;font-size:14px;color:#202723"), background: focus === w.key ? "#EEF6F0" : "transparent" }}>
              <span style={css("width:8px;height:8px;border-radius:50%;background:#268653")} />
              <span style={css("flex:1")}>{w.label}</span>
              <span style={css("font-size:12px;color:#78817B")}>{statusOf(w.key, w.status)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
