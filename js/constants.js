/**
 * constants.js — shared application-wide constants.
 *
 * NOTE: preloader.js keeps a verbatim copy of GLITCH_CHARS because it runs
 * as a classic IIFE before any module infrastructure is available. If you
 * change the string here, update preloader.js line 8 to match.
 */
(function () {
  'use strict';

  window.GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');
}());
