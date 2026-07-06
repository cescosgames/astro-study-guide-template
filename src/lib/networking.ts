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

export function generateIPv6Problem(difficulty: 'easy' | 'medium' | 'hard'): IPv6Problem {
  const zeroGroupCounts: Record<string, number> = { easy: 4, medium: 2, hard: 1 };
  const zeroGroups = zeroGroupCounts[difficulty];
  const groups = Array.from({ length: 8 }, (_, i) =>
    i < zeroGroups ? '0000' : randomInt(0, 0xffff).toString(16).padStart(4, '0')
  );
  const full = groups.join(':');
  return { full, compressed: compressIPv6(full), difficulty };
}
