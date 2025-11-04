/**
 * Username Generator Utility
 * 
 * Generates unique, crypto-style usernames from Solana wallet addresses
 * Prevents users from setting admin or reserved usernames
 */

/**
 * Generate a unique username from a Solana wallet address
 * Format: trader_abc123 or whale_xyz789
 * 
 * @param walletAddress - Solana public key (base58 string)
 * @returns Generated username
 */
export function generateUsername(walletAddress: string): string {
  // Take last 6 characters of wallet address
  const suffix = walletAddress.slice(-6).toLowerCase();
  
  // Random prefixes for variety
  const prefixes = [
    'trader',
    'whale',
    'degen',
    'ape',
    'hodler',
    'bull',
    'bear',
    'moon',
    'chad',
    'ser',
  ];
  
  // Pick a random prefix based on wallet address hash
  const hash = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prefix = prefixes[hash % prefixes.length];
  
  return `${prefix}_${suffix}`;
}

/**
 * Check if a username is reserved/admin
 * 
 * @param username - Username to check
 * @returns true if username is reserved
 */
export function isReservedUsername(username: string): boolean {
  const reserved = ['admin', 'moderator', 'mod', 'system', 'instinct', 'support'];
  return reserved.includes(username.toLowerCase());
}

/**
 * Validate username format
 * 
 * @param username - Username to validate
 * @returns Error message or null if valid
 */
export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  if (isReservedUsername(username)) {
    return 'This username is reserved';
  }
  
  return null;
}

