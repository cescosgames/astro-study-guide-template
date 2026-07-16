export interface PortRow {
  port: string;
  tag: 'tcp' | 'udp' | 'both';
  service: string;
  purpose: string;
  hook: string;
}

/**
 * Sourced directly from CompTIA A+ 220-1201 Exam Objectives v2.0, section 2.1
 * ("Compare and contrast TCP and UDP ports, protocols, and their purposes").
 * Deliberately limited to exactly this list — no extra ports padded in —
 * so the reference sheet and minigame only drill objectives-testable content.
 */
export const portSections: { heading: string; rows: PortRow[] }[] = [
  {
    heading: 'File Transfer & Remote Access',
    rows: [
      { port: '20-21', tag: 'tcp', service: 'FTP — File Transfer Protocol', purpose: 'Transfers files between a client and server; 20 moves data, 21 handles commands.', hook: '21 is the boss — commands and control; 20 does the work' },
      { port: '22', tag: 'tcp', service: 'SSH — Secure Shell', purpose: 'Encrypted remote command-line access to a device.', hook: '"22 = two locks" — Secure Shell, everything encrypted' },
      { port: '23', tag: 'tcp', service: 'Telnet', purpose: 'Unencrypted remote command-line access — insecure, largely replaced by SSH.', hook: '23 = old, plaintext, insecure — replaced by SSH (22)' },
      { port: '3389', tag: 'tcp', service: 'RDP — Remote Desktop Protocol', purpose: 'Remote graphical desktop access to a Windows computer.', hook: '"33-89 = Remote Desktop" — Windows remote GUI access' },
    ],
  },
  {
    heading: 'Email',
    rows: [
      { port: '25', tag: 'tcp', service: 'SMTP — Simple Mail Transfer Protocol', purpose: 'Sends outbound email from a client to a server, or between mail servers.', hook: '"Send Mail To People" — 25 letters in the alphabet (minus 1)' },
      { port: '110', tag: 'tcp', service: 'POP3 — Post Office Protocol 3', purpose: 'Downloads email to a single device, typically removing it from the server.', hook: 'POP3 = 110; "Point Of Pickup" — grabs mail and removes it from server' },
      { port: '143', tag: 'tcp', service: 'IMAP — Internet Mail Access Protocol', purpose: 'Synchronizes email across multiple devices; messages stay on the server.', hook: '"I MAP 143" — syncs across devices, mail lives on server' },
    ],
  },
  {
    heading: 'Web',
    rows: [
      { port: '80', tag: 'tcp', service: 'HTTP — Hypertext Transfer Protocol', purpose: 'Transfers unencrypted web page content between browser and server.', hook: '"80 = HTTP" — standard web, no padlock' },
      { port: '443', tag: 'both', service: 'HTTPS — HTTP Secure', purpose: 'Transfers encrypted web page content between browser and server (HTTP over TLS).', hook: '"443 = padlock" — HTTPS, the secure web' },
    ],
  },
  {
    heading: 'Network Services',
    rows: [
      { port: '53', tag: 'both', service: 'DNS — Domain Name System', purpose: 'Resolves domain names to IP addresses.', hook: '"53 = DNS" — UDP for queries, TCP for zone transfers' },
      { port: '67-68', tag: 'udp', service: 'DHCP — Dynamic Host Configuration Protocol', purpose: 'Automatically assigns IP addresses and network settings to clients; 67 = server, 68 = client.', hook: '67 server, 68 client — one apart, always together' },
    ],
  },
  {
    heading: 'File Sharing & Directory Services',
    rows: [
      { port: '137-139', tag: 'both', service: 'NetBIOS / NetBT', purpose: 'Legacy name resolution and session services for Windows file/print sharing over TCP/IP.', hook: '137-139 = old-school Windows networking, pre-dates SMB direct-hosting on 445' },
      { port: '389', tag: 'both', service: 'LDAP — Lightweight Directory Access Protocol', purpose: 'Queries and authenticates against a directory service, e.g. Active Directory.', hook: '"389 = LDAP" — 3-8-9 = find the user' },
      { port: '445', tag: 'tcp', service: 'SMB / CIFS — Server Message Block / Common Internet File System', purpose: 'Shares files and printers on a Windows network.', hook: '"445 = Samba" — Windows networking; 4 + 4 + 5 = shared drives' },
    ],
  },
];

export interface PortEntry {
  port: string;
  service: string;
  purpose: string;
  tag: PortRow['tag'];
}

/** Flattens `portSections` into individual port/service pairs for the matching game — splits combined cells like "20-21" or "67-68" into one entry per port number. */
export const portEntries: PortEntry[] = portSections.flatMap((section) =>
  section.rows.flatMap((row) =>
    row.port.split('-').map((p) => {
      const port = p.trim();
      return { port, service: row.service, purpose: row.purpose, tag: row.tag };
    }),
  ),
);
