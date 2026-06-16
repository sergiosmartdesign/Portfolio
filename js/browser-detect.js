/**
 * Browser Detection Utility
 * Lightweight detection for Safari/iOS to enable performance optimizations
 */

const BrowserDetect = {
  // Safari detection (excludes Chrome which also contains "Safari" in UA)
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),

  // iOS detection
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,

  // Coarse-pointer / touch device with no real hover (computed once at load).
  // Single source of truth for capability-gated mobile behavior in other modules.
  isTouch: window.matchMedia('(hover: none) and (pointer: coarse)').matches,

  // Mobile-layout viewport — tracks the CSS ≤768px breakpoint. Evaluated once at
  // load (consumers read it during init), matching how this module is used.
  isMobile: window.matchMedia('(max-width: 768px)').matches,

  // Combined check for any Safari-based browser
  isSafariBased: function() {
    return this.isSafari || this.isIOS;
  },

  // Performance tier (for adaptive quality). Phones fall to 'low' so canvas /
  // particle consumers that respect the tier scale down for battery + jank.
  getPerformanceTier: function() {
    if (this.isIOS || this.isMobile) return 'low';
    if (this.isSafari) return 'medium';
    return 'high';
  }
};

App.BrowserDetect = BrowserDetect;
