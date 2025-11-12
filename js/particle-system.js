/**
 * Particle System Animation
 * Adapted for vanilla JavaScript (no external dependencies)
 * Original concept by Alex Andrix
 */

var ParticleSystem = {};

ParticleSystem.setup = function() {
  // Create canvas element
  var canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  this.canvas = canvas;

  // Insert canvas as first child of intro section (background layer)
  var introSection = document.getElementById('intro');
  introSection.insertBefore(canvas, introSection.firstChild);

  this.ctx = this.canvas.getContext('2d');
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.dataToImageRatio = 1;

  // Disable image smoothing for sharper particles
  this.ctx.imageSmoothingEnabled = false;
  this.ctx.webkitImageSmoothingEnabled = false;
  this.ctx.msImageSmoothingEnabled = false;

  this.xC = this.width / 2;
  this.yC = this.height / 2;

  this.stepCount = 0;
  this.particles = [];

  // Particle system parameters - adjusted for intro section
  this.lifespan = 1000;
  this.popPerBirth = 1;
  this.maxPop = 150; // Reduced from 300 for better performance
  this.birthFreq = 2;

  // Build motion grid
  this.gridSize = 8;
  this.gridSteps = Math.floor(1000 / this.gridSize);
  this.grid = [];

  var i = 0;
  for (var xx = -500; xx < 500; xx += this.gridSize) {
    for (var yy = -500; yy < 500; yy += this.gridSize) {
      // Radial field - creates attraction pattern
      var r = Math.sqrt(xx * xx + yy * yy);
      var r0 = 100;
      var field;

      if (r < r0) {
        field = 255 / r0 * r;
      } else if (r > r0) {
        field = 255 - Math.min(255, (r - r0) / 2);
      }

      this.grid.push({
        x: xx,
        y: yy,
        busyAge: 0,
        spotIndex: i,
        isEdge: (xx == -500 ? 'left' :
                 (xx == (-500 + this.gridSize * (this.gridSteps - 1)) ? 'right' :
                  (yy == -500 ? 'top' :
                   (yy == (-500 + this.gridSize * (this.gridSteps - 1)) ? 'bottom' :
                    false
                   )
                  )
                 )
                ),
        field: field
      });
      i++;
    }
  }
  this.gridMaxIndex = i;

  // Counters
  this.drawnInLastFrame = 0;
  this.deathCount = 0;

  this.initDraw();
};

ParticleSystem.evolve = function() {
  this.stepCount++;

  // Increment all grid ages
  for (var i = 0; i < this.grid.length; i++) {
    if (this.grid[i].busyAge > 0) {
      this.grid[i].busyAge++;
    }
  }

  // Birth new particles
  if (this.stepCount % this.birthFreq == 0 &&
      (this.particles.length + this.popPerBirth) < this.maxPop) {
    this.birth();
  }

  this.move();
  this.draw();
};

ParticleSystem.birth = function() {
  var gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex);
  var gridSpot = this.grid[gridSpotIndex];
  var x = gridSpot.x;
  var y = gridSpot.y;

  var particle = {
    // Cyberpunk cyan color scheme - matches your theme
    hue: 180, // Cyan (change to 20 for orange)
    sat: 95,
    lum: 20 + Math.floor(40 * Math.random()),
    x: x,
    y: y,
    xLast: x,
    yLast: y,
    xSpeed: 0,
    ySpeed: 0,
    age: 0,
    ageSinceStuck: 0,
    attractor: {
      oldIndex: gridSpotIndex,
      gridSpotIndex: gridSpotIndex
    },
    name: 'particle-' + Math.ceil(10000000 * Math.random())
  };

  this.particles.push(particle);
};

ParticleSystem.kill = function(particleName) {
  // Vanilla JS replacement for _.reject() and _.cloneDeep()
  this.particles = this.particles.filter(function(particle) {
    return particle.name !== particleName;
  });
};

ParticleSystem.move = function() {
  for (var i = 0; i < this.particles.length; i++) {
    var p = this.particles[i];

    // Save last position
    p.xLast = p.x;
    p.yLast = p.y;

    // Get attractor and grid spot
    var index = p.attractor.gridSpotIndex;
    var gridSpot = this.grid[index];

    // Maybe move attractor
    if (Math.random() < 0.5) {
      if (!gridSpot.isEdge) {
        // Get neighbor indices
        var topIndex = index - 1;
        var bottomIndex = index + 1;
        var leftIndex = index - this.gridSteps;
        var rightIndex = index + this.gridSteps;

        var neighbors = [
          this.grid[topIndex],
          this.grid[bottomIndex],
          this.grid[leftIndex],
          this.grid[rightIndex]
        ];

        // Vanilla JS replacement for _.maxBy()
        var chaos = 30;
        var maxFieldSpot = neighbors.reduce(function(max, spot) {
          var value = spot.field + chaos * Math.random();
          return value > (max.field + chaos * Math.random()) ? spot : max;
        });

        var potentialNewGridSpot = maxFieldSpot;

        // Check if spot is available
        if (potentialNewGridSpot.busyAge == 0 || potentialNewGridSpot.busyAge > 15) {
          p.ageSinceStuck = 0;
          p.attractor.oldIndex = index;
          p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex;
          gridSpot = potentialNewGridSpot;
          gridSpot.busyAge = 1;
        } else {
          p.ageSinceStuck++;
        }

      } else {
        p.ageSinceStuck++;
      }

      // Kill stuck particles
      if (p.ageSinceStuck == 10) {
        this.kill(p.name);
        continue;
      }
    }

    // Spring physics to attractor
    var k = 8;
    var visc = 0.4;
    var dx = p.x - gridSpot.x;
    var dy = p.y - gridSpot.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // Spring force
    var xAcc = -k * dx;
    var yAcc = -k * dy;

    p.xSpeed += xAcc;
    p.ySpeed += yAcc;

    // Viscosity damping
    p.xSpeed *= visc;
    p.ySpeed *= visc;

    // Store in particle
    p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);
    p.dist = dist;

    // Update position
    p.x += 0.1 * p.xSpeed;
    p.y += 0.1 * p.ySpeed;

    // Age
    p.age++;

    // Kill old particles
    if (p.age > this.lifespan) {
      this.kill(p.name);
      this.deathCount++;
    }
  }
};

ParticleSystem.initDraw = function() {
  this.ctx.beginPath();
  this.ctx.rect(0, 0, this.width, this.height);
  this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  this.ctx.fill();
  this.ctx.closePath();
};

ParticleSystem.draw = function() {
  this.drawnInLastFrame = 0;
  if (!this.particles.length) return false;

  // Fade effect - creates trails
  this.ctx.beginPath();
  this.ctx.rect(0, 0, this.width, this.height);
  this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Subtle fade for trails
  this.ctx.fill();
  this.ctx.closePath();

  for (var i = 0; i < this.particles.length; i++) {
    var p = this.particles[i];

    // Color with hue rotation over time
    var h = p.hue + this.stepCount / 30;
    var s = p.sat;
    var l = p.lum;
    var a = 1;

    // Transform data coordinates to canvas coordinates
    var last = this.dataXYtoCanvasXY(p.xLast, p.yLast);
    var now = this.dataXYtoCanvasXY(p.x, p.y);

    var attracSpot = this.grid[p.attractor.gridSpotIndex];
    var attracXY = this.dataXYtoCanvasXY(attracSpot.x, attracSpot.y);

    var oldAttracSpot = this.grid[p.attractor.oldIndex];
    var oldAttracXY = this.dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y);

    // Draw particle trail
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';

    this.ctx.moveTo(last.x, last.y);
    this.ctx.lineTo(now.x, now.y);

    this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
    this.ctx.stroke();
    this.ctx.closePath();

    // Draw attractor positions (subtle)
    this.ctx.beginPath();
    this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
    this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
    this.ctx.lineTo(attracXY.x, attracXY.y);
    this.ctx.arc(attracXY.x, attracXY.y, 1.5 * this.dataToImageRatio, 0, 2 * Math.PI, false);

    this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
    this.ctx.stroke();
    this.ctx.fill();

    this.ctx.closePath();

    this.drawnInLastFrame++;
  }
};

ParticleSystem.dataXYtoCanvasXY = function(x, y) {
  var zoom = 1.6;
  var xx = this.xC + x * zoom * this.dataToImageRatio;
  var yy = this.yC + y * zoom * this.dataToImageRatio;

  return {x: xx, y: yy};
};

// Handle window resize
ParticleSystem.resize = function() {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.xC = this.width / 2;
  this.yC = this.height / 2;
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  ParticleSystem.setup();

  // Animation loop
  var frame = function() {
    ParticleSystem.evolve();
    requestAnimationFrame(frame);
  };
  frame();

  // Handle resize
  window.addEventListener('resize', function() {
    ParticleSystem.resize();
  });
});
