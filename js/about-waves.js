// Wave Animation for About Section
// Inspired by warm color palette

class Utils {
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static mapRange(value, inputMin, inputMax, outputMin, outputMax, clamp) {
        if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
            return outputMin;
        } else {
            var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
            if (clamp) {
                if (outputMax < outputMin) {
                    if (outVal < outputMax) outVal = outputMax;
                    else if (outVal > outputMin) outVal = outputMin;
                } else {
                    if (outVal > outputMax) outVal = outputMax;
                    else if (outVal < outputMin) outVal = outputMin;
                }
            }
            return outVal;
        }
    }
}

Utils.simplex = new SimplexNoise('warm-waves');

class AboutWaves {
    constructor() {
        this.config = {
            bgColor: '#1a0000', // Very dark red
            // Warm color palette matching your design
            colorSchema: [
                '#9B2226', // Dark red (from your palette)
                '#AE2012', // Red (from your palette)
                '#BB3E03', // Red-orange (from your palette)
                '#CA6702', // Dark orange (from your palette)
                '#EE9B00', // Orange (from your palette)
                '#E9D8A6', // Beige (from your palette)
                '#ff3c00', // Main about section color
                '#ff6b35', // Lighter orange
            ],
            numOfLayers: 8,
            revealDuration: 1.0, // Duration in seconds for each layer to fade in
            revealStagger: 0.3  // Delay between each layer reveal in seconds
        };

        this.canvas = document.getElementById('aboutCanvas');

        if (!this.canvas) {
            console.warn('About canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.shadowCanvas = document.createElement('canvas');
        this.shadowCtx = this.shadowCanvas.getContext('2d');

        this.timestamp = 0;
        this.startTime = null;
        this.animationFrame = null;
        this.hasStarted = false; // Track if animation has been triggered

        this.setUpVars();
        this.setUpListeners();
        this.setUpIntersectionObserver();
        this.update();
    }

    setUpVars() {
        this.canvas.width = this.shadowCanvas.width = this.wWidth = window.innerWidth;
        this.canvas.height = this.shadowCanvas.height = this.wHeight = window.innerHeight;
        this.wCenterX = this.wWidth / 2;
        this.wCenterY = this.wHeight / 2;
        this.wHypot = Math.hypot(this.wWidth, this.wHeight);
        this.wMin = Math.min(this.wWidth, this.wHeight);

        this.angle = Math.PI * 0.25;
        this.layers = this.getLayers();
    }

    getLayers() {
        const layers = [];
        let currColorId = 0;

        for (let lid = 0; lid <= this.config.numOfLayers; lid++) {
            layers.push({
                id: lid,
                progress: 1 - (lid / this.config.numOfLayers),
                color: this.config.colorSchema[currColorId],
                opacity: 0, // Start invisible
                revealDelay: lid * this.config.revealStagger // Stagger the reveal
            });

            currColorId++;

            if (currColorId >= this.config.colorSchema.length) {
                currColorId = 0;
            }
        }

        return layers;
    }

    setUpListeners() {
        window.addEventListener('resize', () => {
            this.setUpVars();
        });
    }

    setUpIntersectionObserver() {
        // Create observer to trigger animation when about section is visible
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Trigger animation when section becomes visible (at least 20% visible)
                if (entry.isIntersecting && entry.intersectionRatio > 0.2 && !this.hasStarted) {
                    this.startRevealAnimation();
                }
            });
        }, {
            threshold: 0.2 // Trigger when 20% of the section is visible
        });

        observer.observe(aboutSection);
    }

    startRevealAnimation() {
        this.hasStarted = true;
        // Reset all layers to invisible
        this.layers.forEach(layer => {
            layer.opacity = 0;
        });
        // Reset start time to trigger the reveal from now
        this.startTime = null;
    }

    drawLayer(ctx, layer) {
        // Skip if layer is not visible yet
        if (layer.opacity <= 0) return;

        const segmentBaseSize = 10;
        const segmentCount = Math.round(this.wHypot / segmentBaseSize);
        const segmentSize = this.wHypot / segmentCount;
        const waveAmplitude = segmentSize * 5; // Increased amplitude for more dramatic waves
        const noiseZoom = 0.025; // Slightly tighter noise for smoother waves

        ctx.save();
        ctx.globalAlpha = layer.opacity; // Apply opacity for fade-in effect
        ctx.translate(this.wCenterX, this.wCenterY);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(-this.wHypot / 2, this.wHypot / 2 - (this.wHypot * layer.progress));
        ctx.lineTo(-this.wHypot / 2, this.wHypot / 2);
        ctx.lineTo(this.wHypot / 2, this.wHypot / 2);
        ctx.lineTo(this.wHypot / 2, this.wHypot / 2 - (this.wHypot * layer.progress));

        for (let sid = 1; sid <= segmentCount; sid++) {
            const n = Utils.simplex.noise3D(sid * noiseZoom, layer.id * 0.5, this.timestamp);
            const heightOffset = n * waveAmplitude;

            ctx.lineTo(
                (this.wHypot / 2) - (sid * segmentSize),
                this.wHypot / 2 - (this.wHypot * layer.progress) + heightOffset
            );
        }

        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
        ctx.restore();
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.config.bgColor;
        ctx.fillRect(0, 0, this.wWidth, this.wHeight);
        ctx.restore();

        this.layers.forEach(layer => this.drawLayer(ctx, layer));
    }

    update(t) {
        if (t) {
            // Only start timer if animation has been triggered
            if (this.hasStarted && !this.startTime) {
                this.startTime = t;
            }

            this.timestamp = t / 5000;
            this.angle += 0.0005; // Slower rotation for smoother effect

            let shiftNeeded = false;

            this.layers.forEach(layer => {
                // Only run reveal animation if hasStarted is true
                if (this.hasStarted && this.startTime) {
                    const elapsedTime = (t - this.startTime) / 1000; // Convert to seconds

                    // Update reveal opacity with fade-in animation
                    const revealStartTime = layer.revealDelay;
                    const revealEndTime = revealStartTime + this.config.revealDuration;

                    if (elapsedTime >= revealStartTime) {
                        if (elapsedTime >= revealEndTime) {
                            layer.opacity = 1;
                        } else {
                            // Ease-in-out animation for smooth fade
                            const progress = (elapsedTime - revealStartTime) / this.config.revealDuration;
                            layer.opacity = progress < 0.5
                                ? 2 * progress * progress
                                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                        }
                    }
                }

                layer.progress += 0.0008; // Slower wave movement

                if (layer.progress > 1 + (1 / (this.layers.length - 1))) {
                    layer.progress = 0;
                    shiftNeeded = true;
                }
            });

            if (shiftNeeded) {
                this.layers.push(this.layers.shift());
            }

            this.draw(this.shadowCtx);
        }

        this.ctx.clearRect(0, 0, this.wWidth, this.wHeight);
        this.ctx.drawImage(this.shadowCanvas, 0, 0);

        this.animationFrame = window.requestAnimationFrame(this.update.bind(this));
    }

    destroy() {
        if (this.animationFrame) {
            window.cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AboutWaves();
    });
} else {
    new AboutWaves();
}
