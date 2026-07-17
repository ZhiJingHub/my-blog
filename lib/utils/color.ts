export function hexToRgba(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  let h = hex.trim();
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  } else if (h.length === 9) {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    const embeddedAlpha = parseInt(h.slice(7, 9), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a * embeddedAlpha})`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return `rgba(0, 0, 0, ${a})`;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
