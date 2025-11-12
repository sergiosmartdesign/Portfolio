/**
 * 3D Particle Orb Animation
 * Generates 300 particles in a rotating 3D sphere
 * Converted from SCSS to vanilla JavaScript
 */

(function() {
  'use strict';

  var config = {
    total: 300,           // total particles
    orbSize: 100,         // orb radius in pixels
    particleSize: 2,      // particle size in pixels
    animationTime: 14,    // animation duration in seconds
    baseHue: 180          // base color hue (180 = cyan, 0 = red, 280 = magenta)
  };

  // Generate random integer between min and max
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Create the orb container and particles
  function createOrbHTML() {
    var introSection = document.getElementById('intro');
    if (!introSection) return;

    // Create wrapper
    var wrap = document.createElement('div');
    wrap.className = 'orb-wrap';
    wrap.id = 'orb3d';

    // Create 300 particles
    for (var i = 0; i < config.total; i++) {
      var particle = document.createElement('div');
      particle.className = 'orb-particle';
      wrap.appendChild(particle);
    }

    // Insert as second child (after particle canvas, before everything else)
    if (introSection.children.length > 0) {
      introSection.insertBefore(wrap, introSection.children[0].nextSibling);
    } else {
      introSection.appendChild(wrap);
    }
  }

  // Generate CSS animations for all particles
  function generateOrbCSS() {
    var styleSheet = document.createElement('style');
    styleSheet.id = 'orb-3d-animations';
    var cssRules = [];

    // Generate unique animation for each particle
    for (var i = 1; i <= config.total; i++) {
      var zAngle = randomInt(0, 360);  // random Z rotation
      var yAngle = randomInt(0, 360);  // random Y rotation
      var hue = ((40 / config.total * i) + config.baseHue) % 360;  // hue gradient
      var delay = (i * 0.01).toFixed(2);  // staggered start

      // Particle-specific styles
      cssRules.push(
        '.orb-particle:nth-child(' + i + ') {' +
        '  animation: orbit' + i + ' ' + config.animationTime + 's infinite;' +
        '  animation-delay: ' + delay + 's;' +
        '  background-color: hsla(' + hue + ', 100%, 50%, 1);' +
        '}'
      );

      // Unique keyframe animation for this particle
      cssRules.push(
        '@keyframes orbit' + i + ' {' +
        '  20% {' +
        '    opacity: 1;' +  // fade in
        '  }' +
        '  30% {' +
        '    transform: rotateZ(' + (-zAngle) + 'deg) rotateY(' + yAngle + 'deg) ' +
        '               translateX(' + config.orbSize + 'px) rotateZ(' + zAngle + 'deg);' +  // form orb
        '  }' +
        '  80% {' +
        '    transform: rotateZ(' + (-zAngle) + 'deg) rotateY(' + yAngle + 'deg) ' +
        '               translateX(' + config.orbSize + 'px) rotateZ(' + zAngle + 'deg);' +  // hold orb
        '    opacity: 1;' +
        '  }' +
        '  100% {' +
        '    transform: rotateZ(' + (-zAngle) + 'deg) rotateY(' + yAngle + 'deg) ' +
        '               translateX(' + (config.orbSize * 3) + 'px) rotateZ(' + zAngle + 'deg);' +  // explode
        '  }' +
        '}'
      );
    }

    styleSheet.textContent = cssRules.join('\n');
    document.head.appendChild(styleSheet);
  }

  // Initialize orb when DOM is ready
  function init() {
    createOrbHTML();
    generateOrbCSS();
  }

  // Wait for DOM content to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
