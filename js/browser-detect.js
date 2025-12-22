/**
 * Browser Detection Utility
 * Lightweight detection for Safari/iOS to enable performance optimizations
 */

const BrowserDetect = {
  // Safari detection (excludes Chrome which also contains "Safari" in UA)
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),

  // iOS detection
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,

  // Combined check for any Safari-based browser
  isSafariBased: function() {
    return this.isSafari || this.isIOS;
  },

  // Performance tier (for adaptive quality)
  getPerformanceTier: function() {
    if (this.isIOS) return 'low';
    if (this.isSafari) return 'medium';
    return 'high';
  }
};

// Make globally available
window.BrowserDetect = BrowserDetect;

// Log detection results
console.log('[Browser Detect]', {
  Safari: BrowserDetect.isSafari,
  iOS: BrowserDetect.isIOS,
  Tier: BrowserDetect.getPerformanceTier()
});
