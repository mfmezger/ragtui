export function formatCount(value: number): string {
  return new Intl.NumberFormat("en", { notation: value >= 10_000 ? "compact" : "standard" }).format(value);
}

export function shortPath(path: string, max = 48): string {
  if (path.length <= max) {
    return path;
  }
  const keep = Math.max(8, max - 1);
  return `…${path.slice(-keep)}`;
}

export function firstLines(text: string, maxLines: number): string {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= maxLines) {
    return lines.join("\n");
  }
  return `${lines.slice(0, maxLines).join("\n")}\n…`;
}

export function messageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
