export const withAlpha = (color: string, alpha: number): string => {
  const a = Math.max(0, Math.min(1, alpha));
  if (/^#([\da-fA-F]{6})$/.test(color)) {
    const hexAlpha = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${color}${hexAlpha}`;
  }
  const rgbMatch = color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color;
};
