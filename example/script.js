const CONFIG = {
  timeZone: "Europe/Zagreb",
  timeUpdateInterval: 1000
};
class AnimationManager {
  constructor() {
    this.backgroundImage = document.getElementById("backgroundImage");
    this.projectItems = document.querySelectorAll(".project-item");
    this.portfolioContainer = document.querySelector(".portfolio-container");
    this.currentActiveIndex = -1;
    this.originalTexts = new Map();
    this.debounceTimeout = null;
    this.idleAnimation = null;
    this.isIdle = true;
    this.idleTimer = null;
    this.projectItems.forEach((item) => {
      const textElements = item.querySelectorAll(".hover-text");
      const texts = Array.from(textElements).map((el) => el.textContent);
      this.originalTexts.set(item, texts);
    });
  }
  initializeAnimations() {
    this.preloadImages();
    this.projectItems.forEach((item, index) => {
      this.addEventListeners(item, index);
    });
    const container = document.querySelector(".portfolio-container");
    container.addEventListener("mouseleave", () => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.clearActiveStates();
      this.hideBackgroundImage();
      this.startIdleTimer();
    });
    this.animateEntrance();
  }
  animateEntrance() {
    gsap.fromTo(
      this.projectItems,
      { opacity: 0 },
      {
        opacity: 1,
        stagger: 0.08,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => this.startIdleTimer()
      }
    );
  }
  preloadImages() {
    this.projectItems.forEach((item) => {
      const imageUrl = item.dataset.image;
      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
      }
    });
  }
  addEventListeners(item, index) {
    const textElements = item.querySelectorAll(".hover-text");
    const imageUrl = item.dataset.image;
    const originalTexts = this.originalTexts.get(item);
    const handleMouseEnter = () => {
      this.stopIdleAnimation();
      this.stopIdleTimer();
      this.isIdle = false;
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      if (this.currentActiveIndex === index) return;
      this.updateActiveStates(index);
      textElements.forEach((element, i) => {
        gsap.killTweensOf(element);
        gsap.to(element, {
          duration: 0.8,
          scrambleText: {
            text: originalTexts[i],
            chars: "qwerty1337h@ck3r",
            revealDelay: 0.3,
            speed: 0.4
          }
        });
      });
      if (imageUrl) {
        this.showBackgroundImage(imageUrl);
      }
    };
    const handleMouseLeave = () => {
      this.debounceTimeout = setTimeout(() => {
        textElements.forEach((element, i) => {
          gsap.killTweensOf(element);
          element.textContent = originalTexts[i];
        });
      }, 50);
    };
    item.addEventListener("mouseenter", handleMouseEnter);
    item.addEventListener("mouseleave", handleMouseLeave);
  }
  updateActiveStates(activeIndex) {
    this.currentActiveIndex = activeIndex;
    this.portfolioContainer.classList.add("has-active");
    this.projectItems.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
  clearActiveStates() {
    this.currentActiveIndex = -1;
    this.portfolioContainer.classList.remove("has-active");
    this.projectItems.forEach((item) => {
      item.classList.remove("active");
      const textElements = item.querySelectorAll(".hover-text");
      const originalTexts = this.originalTexts.get(item);
      textElements.forEach((element, i) => {
        gsap.killTweensOf(element);
        element.textContent = originalTexts[i];
      });
    });
    this.startIdleTimer();
  }
  showBackgroundImage(imageUrl) {
    // Reset transform and transition
    this.backgroundImage.style.transition = "none";
    this.backgroundImage.style.transform = "translate(-50%, -50%) scale(1.2)";
    // Set the background image and show it
    this.backgroundImage.style.backgroundImage = `url(${imageUrl})`;
    this.backgroundImage.style.opacity = "1";
    // Force browser to acknowledge the scale reset before animating
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Re-enable transition and animate to scale 1.0
        this.backgroundImage.style.transition =
          "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        this.backgroundImage.style.transform =
          "translate(-50%, -50%) scale(1.0)";
      });
    });
  }
  hideBackgroundImage() {
    this.backgroundImage.style.opacity = "0";
  }
  startIdleTimer() {
    this.stopIdleTimer();
    this.idleTimer = setTimeout(() => {
      if (this.currentActiveIndex === -1) {
        this.isIdle = true;
        this.startIdleAnimation();
      }
    }, 3000);
  }
  stopIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
  startIdleAnimation() {
    if (this.idleAnimation) return;
    this.idleAnimation = gsap.timeline({
      repeat: -1,
      repeatDelay: 2
    });
    const columnElements = {
      artists: [...this.projectItems].map((item) =>
        item.querySelector(".artist")
      ),
      albums: [...this.projectItems].map((item) =>
        item.querySelector(".album")
      ),
      categories: [...this.projectItems].map((item) =>
        item.querySelector(".category")
      ),
      labels: [...this.projectItems].map((item) =>
        item.querySelector(".label")
      ),
      years: [...this.projectItems].map((item) => item.querySelector(".year"))
    };
    const totalRows = this.projectItems.length;
    const columnStartDelay = 0.25;
    const rowDelay = 0.05;
    const hideShowGap = totalRows * rowDelay * 0.5;
    this.projectItems.forEach((item, rowIndex) => {
      const hideTime = 0 + rowIndex * rowDelay;
      const showTime = 0 + hideShowGap + rowIndex * rowDelay;
      this.idleAnimation.call(
        () => {
          item.classList.add("counter-hidden");
        },
        [],
        hideTime
      );
      this.idleAnimation.call(
        () => {
          item.classList.remove("counter-hidden");
        },
        [],
        showTime
      );
    });
    Object.keys(columnElements).forEach((columnName, columnIndex) => {
      const elements = columnElements[columnName];
      const columnStart = (columnIndex + 1) * columnStartDelay;
      elements.forEach((element, rowIndex) => {
        const hideTime = columnStart + rowIndex * rowDelay;
        this.idleAnimation.to(
          element,
          {
            duration: 0.1,
            opacity: 0.05,
            ease: "power2.inOut"
          },
          hideTime
        );
      });
      elements.forEach((element, rowIndex) => {
        const showTime = columnStart + hideShowGap + rowIndex * rowDelay;
        this.idleAnimation.to(
          element,
          {
            duration: 0.1,
            opacity: 1,
            ease: "power2.inOut"
          },
          showTime
        );
      });
    });
  }
  stopIdleAnimation() {
    if (this.idleAnimation) {
      this.idleAnimation.kill();
      this.idleAnimation = null;
      gsap.set([...document.querySelectorAll(".project-data")], {
        opacity: 1
      });
      this.projectItems.forEach((item) => {
        item.classList.remove("counter-hidden");
      });
    }
  }
}
class TimeDisplay {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw new Error(`Element with id '${elementId}' not found.`);
    }
  }
  start() {
    this.updateDisplay();
    setInterval(() => this.updateDisplay(), CONFIG.timeUpdateInterval);
  }
  updateDisplay() {
    const { hours, minutes, dayPeriod } = this.getCurrentTime();
    const timeString = `${hours}<span class="time-blink">:</span>${minutes} ${dayPeriod}`;
    this.element.innerHTML = timeString;
  }
  getCurrentTime() {
    const now = new Date();
    const options = {
      timeZone: CONFIG.timeZone,
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(now);
    return {
      hours: parts.find((part) => part.type === "hour").value,
      minutes: parts.find((part) => part.type === "minute").value,
      dayPeriod: parts.find((part) => part.type === "dayPeriod").value
    };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const animationManager = new AnimationManager();
  animationManager.initializeAnimations();
  const timeDisplay = new TimeDisplay("current-time");
  timeDisplay.start();
});