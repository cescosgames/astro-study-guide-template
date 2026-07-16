import { portEntries } from './ports';

export interface SubnetInfo {
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
}

export interface SubnetProblem {
  ip: string;
  cidr: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IPv6Problem {
  full: string;
  compressed: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

function ipToLong(ip: string): number {
  const octets = ip.split('.').map(Number);
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function longToIp(long: number): string {
  return [24, 16, 8, 0].map((shift) => (long >>> shift) & 255).join('.');
}

export function cidrToSubnetMask(cidr: number): string {
  if (cidr < 0 || cidr > 32) throw new RangeError('CIDR must be between 0 and 32');
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  return longToIp(mask);
}

export function getSubnetInfo(ip: string, cidr: number): SubnetInfo {
  const maskLong = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcardLong = (~maskLong) >>> 0;
  const ipLong = ipToLong(ip);
  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;

  const totalHosts = 2 ** (32 - cidr);
  const usableHosts = cidr >= 31 ? 0 : totalHosts - 2;

  return {
    cidr,
    subnetMask: longToIp(maskLong),
    wildcardMask: longToIp(wildcardLong),
    networkAddress: longToIp(networkLong),
    broadcastAddress: longToIp(broadcastLong),
    firstHost: usableHosts > 0 ? longToIp(networkLong + 1) : longToIp(networkLong),
    lastHost: usableHosts > 0 ? longToIp(broadcastLong - 1) : longToIp(broadcastLong),
    totalHosts,
    usableHosts,
  };
}

export function expandIPv6(compressed: string): string {
  const [head, tail = ''] = compressed.split('::');
  const headGroups = head ? head.split(':') : [];
  const tailGroups = tail ? tail.split(':') : [];

  const missing = 8 - headGroups.length - tailGroups.length;
  const middleGroups = compressed.includes('::') ? Array(missing).fill('0000') : [];

  const allGroups = [...headGroups, ...middleGroups, ...tailGroups];

  return allGroups.map((g) => g.padStart(4, '0')).join(':');
}

export function compressIPv6(full: string): string {
  const groups = full.split(':').map((g) => g.replace(/^0+(?=.)/, ''));

  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen < 2) return groups.join(':');

  const before = groups.slice(0, bestStart);
  const after = groups.slice(bestStart + bestLen);
  return `${before.join(':')}::${after.join(':')}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSubnetProblem(difficulty: 'easy' | 'medium' | 'hard'): SubnetProblem {
  const cidrRanges: Record<string, [number, number]> = {
    easy: [24, 28],
    medium: [20, 27],
    hard: [16, 30],
  };
  const [min, max] = cidrRanges[difficulty];
  const cidr = randomInt(min, max);
  const ip = [randomInt(1, 223), randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)].join('.');
  return { ip, cidr, difficulty };
}

function randomHexGroup(): string {
  return randomInt(0, 0xffff).toString(16).padStart(4, '0');
}

function placeZeroRun(groups: string[], start: number, length: number): void {
  for (let i = start; i < start + length; i++) groups[i] = '0000';
}

export function generateIPv6Problem(difficulty: 'easy' | 'medium' | 'hard'): IPv6Problem {
  const groups = Array.from({ length: 8 }, () => randomHexGroup());

  // Difficulty controls how much of the address collapses under `::`.
  // Easy nearly always has an obvious multi-group run; hard sometimes has
  // a run too short to compress (RFC 5952: `::` only applies to 2+ groups)
  // or none at all, forcing the "no compression needed" case.
  const runLengthRanges: Record<string, [number, number]> = {
    easy: [3, 5],
    medium: [2, 4],
    hard: [0, 3],
  };
  const [minLen, maxLen] = runLengthRanges[difficulty];
  const primaryLen = randomInt(minLen, maxLen);

  if (primaryLen >= 1) {
    const primaryStart = randomInt(0, 8 - primaryLen);
    placeZeroRun(groups, primaryStart, primaryLen);

    // Occasionally seed a second, shorter zero run elsewhere so the
    // "compress only the longest run" rule actually gets exercised.
    if (difficulty !== 'easy' && primaryLen >= 2 && Math.random() < 0.4) {
      const secondaryLen = randomInt(1, primaryLen - 1);
      const gaps: number[] = [];
      for (let s = 0; s <= 8 - secondaryLen; s++) {
        const overlapsPrimary = s < primaryStart + primaryLen && s + secondaryLen > primaryStart;
        if (!overlapsPrimary) gaps.push(s);
      }
      if (gaps.length > 0) {
        const secondaryStart = gaps[randomInt(0, gaps.length - 1)];
        placeZeroRun(groups, secondaryStart, secondaryLen);
      }
    }
  }

  const full = groups.join(':');
  return { full, compressed: compressIPv6(full), difficulty };
}

export interface PortMatchTile {
  id: string;
  label: string;
}

export interface PortMatchRound {
  ports: PortMatchTile[];
  services: PortMatchTile[];
  /** Maps a port tile id to the matching service tile id. */
  answerKey: Record<string, string>;
  /** Maps a port tile id to its exam-objective purpose text, shown as a hint on a correct match. */
  purposes: Record<string, string>;
  difficulty: 'easy' | 'medium' | 'hard';
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generatePortMatchRound(difficulty: 'easy' | 'medium' | 'hard'): PortMatchRound {
  const pairCounts: Record<string, number> = { easy: 3, medium: 5, hard: 8 };
  const pairCount = Math.min(pairCounts[difficulty], portEntries.length);

  const chosen = shuffle(portEntries).slice(0, pairCount);

  const ports = shuffle(chosen.map((entry) => ({ id: entry.port, label: entry.port })));
  const services = shuffle(chosen.map((entry) => ({ id: entry.port, label: entry.service })));
  const answerKey = Object.fromEntries(chosen.map((entry) => [entry.port, entry.port]));
  const purposes = Object.fromEntries(chosen.map((entry) => [entry.port, entry.purpose]));

  return { ports, services, answerKey, purposes, difficulty };
}
