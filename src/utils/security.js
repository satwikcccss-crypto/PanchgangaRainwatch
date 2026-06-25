/**
 * Security Hardening for Panchganga Rain Gauge Net
 * Disables inspect tools, right clicks, and obfuscates API keys.
 */

// Simple XOR + Base64 obfuscation to prevent plain text scraping in build
const SECRET_KEY = 42;

export const obfuscate = (str) => {
  if (!str) return '';
  const xored = str.split('').map(char => String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY)).join('');
  return btoa(unescape(encodeURIComponent(xored)));
};

export const deobfuscate = (obfuscatedStr) => {
  if (!obfuscatedStr) return '';
  try {
    const decoded = decodeURIComponent(escape(atob(obfuscatedStr)));
    return decoded.split('').map(char => String.fromCharCode(char.charCodeAt(0) ^ SECRET_KEY)).join('');
  } catch (e) {
    console.error('Security decryption error');
    return '';
  }
};

// Initialize event blockers
export const initSecuritySystem = () => {
  if (import.meta.env.DEV) {
    console.warn('[Security System] Inactive in development mode.');
    return;
  }

  // 1. Disable Right Click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, false);

  // 2. Disable Common DevTools shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
    if (e.ctrlKey && (e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67) || e.key === 'u' || e.keyCode === 85 || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
  }, false);

  // 3. Anti-Debugger Loop to disrupt inspect view when DevTools is opened
  setInterval(() => {
    try {
      // Use dynamic constructor to bypass compile-time optimization/stripping
      const dbg = Function('debugger');
      dbg();
    } catch (e) {}
  }, 100);
};
