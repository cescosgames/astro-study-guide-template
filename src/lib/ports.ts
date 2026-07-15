export interface PortRow {
  port: string;
  tag: 'tcp' | 'udp' | 'both';
  service: string;
  hook: string;
}

export const portSections: { heading: string; rows: PortRow[] }[] = [
  {
    heading: 'File Transfer & Remote Access',
    rows: [
      { port: '20', tag: 'tcp', service: 'FTP — Data transfer', hook: '20 moves the data — "2 computers passing files"' },
      { port: '21', tag: 'tcp', service: 'FTP — Control / commands', hook: '21 is the boss — commands and control; 20 does the work' },
      { port: '22', tag: 'tcp', service: 'SSH / SFTP / SCP', hook: '"22 = two locks" — Secure Shell, everything encrypted' },
      { port: '23', tag: 'tcp', service: 'Telnet', hook: '23 = old, plaintext, insecure — replaced by SSH (22)' },
      { port: '3389', tag: 'both', service: 'RDP — Remote Desktop Protocol', hook: '"33-89 = Remote Desktop" — Windows remote GUI access' },
    ],
  },
  {
    heading: 'Email',
    rows: [
      { port: '25', tag: 'tcp', service: 'SMTP — Sending mail (server-to-server)', hook: '"Send Mail To People" — 25 letters in the alphabet (minus 1)' },
      { port: '110', tag: 'tcp', service: 'POP3 — Retrieve & delete from server', hook: 'POP3 = 110; "Point Of Pickup" — grabs mail and removes it from server' },
      { port: '143', tag: 'tcp', service: 'IMAP — Sync mail, stays on server', hook: '"I MAP 143" — syncs across devices, mail lives on server' },
      { port: '465 / 587', tag: 'tcp', service: 'SMTPS / SMTP+STARTTLS (secure sending)', hook: '587 = "Submit" — modern secure outbound; 465 = legacy SMTPS' },
      { port: '993', tag: 'tcp', service: 'IMAPS — IMAP over SSL/TLS', hook: '993 = secure IMAP — same sync behavior as 143, but encrypted' },
      { port: '995', tag: 'tcp', service: 'POP3S — POP3 over SSL/TLS', hook: '995 = secure POP3 — same grab-and-go as 110, but encrypted' },
    ],
  },
  {
    heading: 'Web & Proxy',
    rows: [
      { port: '80', tag: 'tcp', service: 'HTTP — Unencrypted web', hook: '"80 = HTTP" — standard web, no padlock' },
      { port: '443', tag: 'both', service: 'HTTPS — Encrypted web (TLS)', hook: '"443 = padlock" — HTTPS, the secure web; UDP for HTTP/3 (QUIC)' },
      { port: '8080', tag: 'tcp', service: 'HTTP Alternate / Web proxy', hook: '8080 = 80 doubled — common for dev servers and HTTP proxies' },
    ],
  },
  {
    heading: 'Network Services',
    rows: [
      { port: '53', tag: 'both', service: 'DNS — Domain name resolution', hook: '"53 = DNS" — UDP for queries, TCP for zone transfers' },
      { port: '67', tag: 'udp', service: 'DHCP — Server (assigns IPs)', hook: '67 = server listens; "6 + 7 = 13 = unlucky without an IP"' },
      { port: '68', tag: 'udp', service: 'DHCP — Client (requests IPs)', hook: '68 = client; 67 server, 68 client — one apart, always together' },
      { port: '123', tag: 'udp', service: 'NTP — Network Time Protocol', hook: '"123 = time" — counts up like a clock: 1, 2, 3!' },
      { port: '161', tag: 'udp', service: 'SNMP — Polling (manager queries device)', hook: '"161 = SNMP" — Simple Network Management Protocol queries' },
      { port: '162', tag: 'udp', service: 'SNMP Trap — Device alerts manager', hook: '162 = trap; device pushes alert to manager — 161 + 1 = triggered' },
    ],
  },
  {
    heading: 'File Sharing & Directory Services',
    rows: [
      { port: '389', tag: 'both', service: 'LDAP — Directory lookup (Active Directory)', hook: '"389 = LDAP" — Lightweight Directory Access Protocol; 3-8-9 = find the user' },
      { port: '445', tag: 'tcp', service: 'SMB / CIFS — Windows file & printer shares', hook: '"445 = Samba" — Windows networking; think 4 + 4 + 5 = shared drives' },
      { port: '636', tag: 'both', service: 'LDAPS — LDAP over SSL/TLS', hook: '636 = secure LDAP — same directory lookup as 389, encrypted' },
    ],
  },
];

export interface PortEntry {
  port: string;
  service: string;
  tag: PortRow['tag'];
}

const SPLIT_SERVICE_OVERRIDES: Record<string, string> = {
  '465': 'SMTPS (secure sending)',
  '587': 'SMTP+STARTTLS (secure sending)',
};

/** Flattens `portSections` into individual port/service pairs for the matching game — splits combined cells like "465 / 587" into one entry per port number. */
export const portEntries: PortEntry[] = portSections.flatMap((section) =>
  section.rows.flatMap((row) =>
    row.port.split('/').map((p) => {
      const port = p.trim();
      return { port, service: SPLIT_SERVICE_OVERRIDES[port] ?? row.service, tag: row.tag };
    }),
  ),
);
