import type { ReactNode } from "react";
import { css } from "@/lib/css";
import type { IsoBox } from "@/lib/data";

/**
 * Isometric scene. Parent must be a size container (`container-type:size`)
 * because everything is measured in cqmin.
 */
export function IsoScene({
  size, offset, transform, sway, transition, children,
}: {
  size: number; offset: number; transform: string; sway: number; transition?: string; children: ReactNode;
}) {
  return (
    <div style={css("position:absolute;inset:0;display:grid;place-items:center;overflow:hidden")}>
      <div style={{ ...css(`width:${size}cqmin;height:${size}cqmin;position:relative;margin-top:${offset}cqmin;transform-style:preserve-3d`), transform, transition }}>
        <div style={{ ...css("position:absolute;inset:0;transform-style:preserve-3d"), animation: `lmSway ${sway}s ease-in-out infinite` }}>{children}</div>
      </div>
    </div>
  );
}

function Faces({ b }: { b: IsoBox }) {
  return (
    <>
      <div style={{ ...css("position:absolute;inset:0"), background: b.top, transform: b.topT }} />
      <div style={{ ...css("position:absolute;left:0;bottom:0;width:100%;transform-origin:bottom center"), height: b.h, background: b.front, transform: b.frontT }} />
      <div style={{ ...css("position:absolute;right:0;top:0;height:100%;transform-origin:right center"), width: b.h, background: b.side, transform: b.sideT }} />
    </>
  );
}

/** `build` variant animates each block in (scale + fade); `flat` is a static / fade-only scene. */
export function IsoBoxes({ boxes, variant }: { boxes: IsoBox[]; variant: "flat" | "build" | "world" }) {
  return (
    <>
      {boxes.map((b, i) => {
        const place = { left: b.x, top: b.y, width: b.w, height: b.d };
        if (variant === "build") {
          return (
            <div key={i} style={{ ...css("position:absolute;inset:0;transform-style:preserve-3d;transition:opacity .5s ease, transform .6s cubic-bezier(.2,.9,.25,1.1)"), opacity: b.op, transform: b.wrapT, transformOrigin: b.origin }}>
              <div style={{ ...css("position:absolute;transform-style:preserve-3d"), ...place }}><Faces b={b} /></div>
            </div>
          );
        }
        return (
          <div key={i} style={{ ...css("position:absolute;transform-style:preserve-3d"), ...place, opacity: b.op, transition: variant === "world" ? "opacity .3s" : undefined }}>
            <Faces b={b} />
          </div>
        );
      })}
    </>
  );
}
