/**
 * Cryptographic Ledger Utility for Nir-ikshan AP State Water Command
 * Provides SHA-256 chaining, tamper-evident block generation, and integrity verification.
 */

export interface CryptographicBlock {
  id: string;
  blockNumber: number;
  blockHash: string;
  previousHash: string;
  timestamp: string;
  timestampIso: string;
  initiatedBy: {
    name: string;
    role: string;
    initials: string;
    staffId?: string;
  };
  action: string;
  recordId: string;
  stateTransition: {
    from: string;
    to: string;
  };
  details?: string;
  signature: string;
  verified: boolean;
}

/**
 * Computes SHA-256 hex digest using Web Crypto API (with fallback if needed)
 */
export async function computeSha256(message: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('[AuditCrypto] WebCrypto error, using fallback:', e);
  }

  // Fallback simple 64-char hex deterministic hash
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < message.length; i++) {
    const ch = message.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return (part + '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef').slice(0, 64);
}

/**
 * Creates a new chained cryptographic block
 */
export async function createChainedBlock(params: {
  blockNumber: number;
  previousHash: string;
  initiatedBy: { name: string; role: string; initials: string; staffId?: string };
  action: string;
  recordId: string;
  stateTransition: { from: string; to: string };
  details?: string;
}): Promise<CryptographicBlock> {
  const timestampIso = new Date().toISOString();
  const timestamp = `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('en-IN', { hour12: false })}`;
  
  const payloadString = JSON.stringify({
    blockNumber: params.blockNumber,
    previousHash: params.previousHash,
    timestamp: timestampIso,
    initiatedBy: params.initiatedBy,
    action: params.action,
    recordId: params.recordId,
    stateTransition: params.stateTransition,
    details: params.details || '',
  });

  const blockHash = await computeSha256(payloadString);
  const signature = `SIG-APWR-${blockHash.slice(0, 16).toUpperCase()}`;

  return {
    id: `blk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    blockNumber: params.blockNumber,
    blockHash,
    previousHash: params.previousHash,
    timestamp,
    timestampIso,
    initiatedBy: params.initiatedBy,
    action: params.action,
    recordId: params.recordId,
    stateTransition: params.stateTransition,
    details: params.details,
    signature,
    verified: true,
  };
}

/**
 * Verifies the integrity of a chain of blocks
 */
export async function verifyChainIntegrity(blocks: CryptographicBlock[]): Promise<{
  isValid: boolean;
  tamperedIndex: number | null;
  totalBlocks: number;
}> {
  if (blocks.length === 0) return { isValid: true, tamperedIndex: null, totalBlocks: 0 };

  // Sort chronological
  const sorted = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];

    // Recompute current block hash
    const payloadString = JSON.stringify({
      blockNumber: current.blockNumber,
      previousHash: current.previousHash,
      timestamp: current.timestampIso,
      initiatedBy: current.initiatedBy,
      action: current.action,
      recordId: current.recordId,
      stateTransition: current.stateTransition,
      details: current.details || '',
    });

    const expectedHash = await computeSha256(payloadString);
    if (expectedHash !== current.blockHash) {
      return { isValid: false, tamperedIndex: i, totalBlocks: sorted.length };
    }

    // Verify chain linkage with previous block
    if (i > 0) {
      const prev = sorted[i - 1];
      if (current.previousHash !== prev.blockHash) {
        return { isValid: false, tamperedIndex: i, totalBlocks: sorted.length };
      }
    }
  }

  return { isValid: true, tamperedIndex: null, totalBlocks: sorted.length };
}
