/**
 * Enterprise Security, Threat Mitigation, & Fraud Detection Engine
 */

export interface SecurityEventLog {
  id: string;
  timestamp: number;
  type: 'XSS_ATTEMPT' | 'SQLI_ATTEMPT' | 'BRUTE_FORCE' | 'RATE_LIMIT' | 'BOT_DETECTION' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_LOCATION' | 'CSRF_MISMATCH';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  ipAddress?: string;
  userId?: string;
  deviceId?: string;
  actionTaken: 'LOGGED' | 'BLOCKED' | 'ACCOUNT_SUSPENDED' | 'DEVICE_BANNED';
}

export interface BannedEntry {
  id: string;
  type: 'user' | 'device' | 'ip';
  target: string;
  reason: string;
  bannedAt: number;
  expiresAt?: number; // Null = Permanent
  bannedBy: string;
}

// Security Threat Response State
export interface SystemThreatState {
  threatLevel: 'NORMAL' | 'ELEVATED' | 'HIGH_ALERT' | 'LOCKDOWN';
  activeBlocksCount: number;
  lastAttackTimestamp?: number;
  totalAttacksBlocked: number;
}

const SECURITY_LOGS_KEY = 'aura_security_audit_logs';
const BANNED_LIST_KEY = 'aura_banned_targets';
const DEVICE_ID_KEY = 'aura_device_fingerprint_id';

// Generate or retrieve persistent Device Fingerprint
export function getDeviceId(): string {
  let devId = localStorage.getItem(DEVICE_ID_KEY);
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, devId);
  }
  return devId;
}

// Check if current user or device is banned
export function checkIsBanned(userId?: string, ip?: string): { banned: boolean; reason?: string } {
  const deviceId = getDeviceId();
  const bannedList: BannedEntry[] = getBannedList();
  
  const now = Date.now();
  for (const entry of bannedList) {
    if (entry.expiresAt && entry.expiresAt < now) continue; // Expired ban
    
    if (entry.type === 'device' && entry.target === deviceId) {
      return { banned: true, reason: `Device Banned: ${entry.reason}` };
    }
    if (userId && entry.type === 'user' && entry.target === userId) {
      return { banned: true, reason: `Account Suspended: ${entry.reason}` };
    }
    if (ip && entry.type === 'ip' && entry.target === ip) {
      return { banned: true, reason: `IP Blocked: ${entry.reason}` };
    }
  }
  
  return { banned: false };
}

// Get banned targets
export function getBannedList(): BannedEntry[] {
  try {
    const raw = localStorage.getItem(BANNED_LIST_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'ban_sample_1',
        type: 'ip',
        target: '192.168.1.105',
        reason: 'Automated Bot Credential Stuffing Attack',
        bannedAt: Date.now() - 86400000,
        bannedBy: 'System Auto-Defender'
      }
    ];
  } catch {
    return [];
  }
}

// Ban user, device, or IP
export function banTarget(type: 'user' | 'device' | 'ip', target: string, reason: string, durationHours?: number, bannedBy: string = 'Admin'): BannedEntry {
  const list = getBannedList();
  const newEntry: BannedEntry = {
    id: 'ban_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    type,
    target,
    reason,
    bannedAt: Date.now(),
    expiresAt: durationHours ? Date.now() + (durationHours * 3600000) : undefined,
    bannedBy
  };
  list.unshift(newEntry);
  localStorage.setItem(BANNED_LIST_KEY, JSON.stringify(list));
  
  logSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    severity: 'critical',
    details: `Target [${type.toUpperCase()}: ${target}] was explicitly banned. Reason: ${reason}`,
    actionTaken: type === 'user' ? 'ACCOUNT_SUSPENDED' : 'DEVICE_BANNED',
    deviceId: type === 'device' ? target : undefined,
    userId: type === 'user' ? target : undefined
  });
  
  return newEntry;
}

// Unban target
export function unbanTarget(id: string): void {
  const list = getBannedList().filter(b => b.id !== id);
  localStorage.setItem(BANNED_LIST_KEY, JSON.stringify(list));
}

// Sanitize user input against XSS & HTML injection
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, 'no-js:')
    .replace(/onload=/gi, 'no-load=')
    .replace(/onerror=/gi, 'no-error=')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// Detect SQL Injection & Script Injection Patterns
export function detectMaliciousPayload(input: string): { isMalicious: boolean; type?: 'XSS' | 'SQLI'; pattern?: string } {
  if (!input) return { isMalicious: false };
  
  // SQL Injection Patterns
  const sqliPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i,
    /(--|\/\*|\*\/|;|\bOR\b\s+['"]?1['"]?\s*=\s*['"]?1)/i,
    /(' OR '1'='1|' OR 1=1|admin'--)/i
  ];
  
  for (const pattern of sqliPatterns) {
    if (pattern.test(input)) {
      return { isMalicious: true, type: 'SQLI', pattern: pattern.toString() };
    }
  }
  
  // XSS Patterns
  const xssPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /eval\(/i,
    /document\.cookie/i
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return { isMalicious: true, type: 'XSS', pattern: pattern.toString() };
    }
  }
  
  return { isMalicious: false };
}

// Client Sliding Window Rate Limiter
const actionRateTracker: Record<string, number[]> = {};

export function checkRateLimit(actionName: string, maxPerWindow: number = 20, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  if (!actionRateTracker[actionName]) {
    actionRateTracker[actionName] = [];
  }
  
  // Filter out timestamps outside window
  actionRateTracker[actionName] = actionRateTracker[actionName].filter(ts => now - ts < windowMs);
  
  if (actionRateTracker[actionName].length >= maxPerWindow) {
    logSecurityEvent({
      type: 'RATE_LIMIT',
      severity: 'medium',
      details: `Rate limit hit for action [${actionName}]. ${actionRateTracker[actionName].length} calls in ${windowMs / 1000}s.`,
      actionTaken: 'BLOCKED'
    });
    return { allowed: false, remaining: 0 };
  }
  
  actionRateTracker[actionName].push(now);
  return { allowed: true, remaining: maxPerWindow - actionRateTracker[actionName].length };
}

// Automated Fraud & Bot Detection
let lastTypingTimestamps: number[] = [];

export function analyzeBotBehavior(inputLength: number, timeTakenMs: number): boolean {
  // If 200 characters pasted/typed in under 50ms, suspicious bot behavior
  if (inputLength > 100 && timeTakenMs < 80) {
    logSecurityEvent({
      type: 'BOT_DETECTION',
      severity: 'high',
      details: `Bot-like automated text insertion detected (${inputLength} chars in ${timeTakenMs}ms).`,
      actionTaken: 'LOGGED'
    });
    return true;
  }
  return false;
}

// Log Security Event
export function logSecurityEvent(event: Omit<SecurityEventLog, 'id' | 'timestamp'>): SecurityEventLog {
  const logs = getSecurityLogs();
  const fullLog: SecurityEventLog = {
    ...event,
    id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    deviceId: event.deviceId || getDeviceId()
  };
  
  logs.unshift(fullLog);
  // Keep max 200 security logs locally
  if (logs.length > 200) logs.pop();
  
  localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(logs));
  
  // Also attempt to notify backend API
  try {
    fetch('/api/security/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullLog)
    }).catch(() => {});
  } catch {}
  
  return fullLog;
}

// Get Security Audit Logs
export function getSecurityLogs(): SecurityEventLog[] {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  // Seed initial realistic security logs
  const now = Date.now();
  return [
    {
      id: 'sec_101',
      timestamp: now - 3600000 * 2,
      type: 'SQLI_ATTEMPT',
      severity: 'high',
      details: 'Automated payload check blocked: SELECT * FROM users WHERE 1=1',
      ipAddress: '185.220.101.5',
      actionTaken: 'BLOCKED'
    },
    {
      id: 'sec_102',
      timestamp: now - 3600000 * 5,
      type: 'XSS_ATTEMPT',
      severity: 'medium',
      details: 'Stripped script tag in forum post submission: <script>alert("xss")</script>',
      ipAddress: '102.89.23.12',
      actionTaken: 'BLOCKED'
    },
    {
      id: 'sec_103',
      timestamp: now - 3600000 * 12,
      type: 'BRUTE_FORCE',
      severity: 'critical',
      details: 'Failed passcode verification 5 times within 30 seconds.',
      ipAddress: '197.210.54.8',
      actionTaken: 'ACCOUNT_SUSPENDED'
    },
    {
      id: 'sec_104',
      timestamp: now - 3600000 * 24,
      type: 'RATE_LIMIT',
      severity: 'low',
      details: 'Messaging API burst threshold reached (25 msgs/min).',
      actionTaken: 'BLOCKED'
    }
  ];
}

// Get Overall Threat System Summary
export function getSystemThreatStatus(): SystemThreatState {
  const logs = getSecurityLogs();
  const banned = getBannedList();
  const recentHighAlerts = logs.filter(l => Date.now() - l.timestamp < 3600000 * 24 && (l.severity === 'high' || l.severity === 'critical'));
  
  let threatLevel: SystemThreatState['threatLevel'] = 'NORMAL';
  if (recentHighAlerts.length >= 5) {
    threatLevel = 'LOCKDOWN';
  } else if (recentHighAlerts.length >= 2) {
    threatLevel = 'HIGH_ALERT';
  } else if (logs.length > 10) {
    threatLevel = 'ELEVATED';
  }
  
  return {
    threatLevel,
    activeBlocksCount: banned.length,
    lastAttackTimestamp: logs[0]?.timestamp,
    totalAttacksBlocked: logs.filter(l => l.actionTaken === 'BLOCKED' || l.actionTaken === 'DEVICE_BANNED').length
  };
}
