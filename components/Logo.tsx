import { css } from "@/lib/css";

export function LogoMark({ size = 24 }: { size?: number }) {
  const inner = Math.round(size * 0.375);
  return (
    <span style={{ ...css("border-radius:7px;background:#26734D;display:grid;place-items:center;flex-shrink:0"), width: size, height: size }}>
      <span style={{ ...css("border-radius:3px;background:#FFFFFF;transform:rotate(45deg)"), width: inner, height: inner }} />
    </span>
  );
}
