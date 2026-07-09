export function normalizeCommand(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isCommandAccepted(input: string, accepted: string[]): boolean {
  const normalized = normalizeCommand(input);
  return accepted.some((candidate) => normalizeCommand(candidate) === normalized);
}
