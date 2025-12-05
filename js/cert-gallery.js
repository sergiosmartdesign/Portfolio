/**
 * Certificate Gallery with Card Carousel
 * Based on GSAP card carousel with customizations
 * Uses capsule glow effect from About section
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const config = {
    cardWidth: 150,
    cardHeight: 150 * 1.414, // Certificate aspect ratio
    rotationRange: 15, // degrees
    spacing: 30,
    dragEnabled: true,
  };

  // Get elements - support both embedded and overlay gallery
  const gallery = document.querySelector('.cert-gallery-embedded') || document.querySelector('.cert-gallery');
  const cardsContainer = document.querySelector('.cert-gallery-embedded .cards') || document.querySelector('.cert-gallery .cards');
  const cards = document.querySelectorAll('.cert-gallery-embedded .cards li').length > 0
    ? document.querySelectorAll('.cert-gallery-embedded .cards li')
    : document.querySelectorAll('.cert-gallery .cards li');
  const prevBtn = document.querySelector('.cert-gallery-embedded .prev') || document.querySelector('.cert-gallery .prev');
  const nextBtn = document.querySelector('.cert-gallery-embedded .next') || document.querySelector('.cert-gallery .next');
  const closeBtn = document.querySelector('.cert-gallery .close-btn');

  if (!cardsContainer || cards.length === 0) {
    console.warn('Certificate gallery elements not found');
    return;
  }

  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  /**
   * Update card positions and styles
   */
  function updateCards() {
    cards.forEach((card, index) => {
      const relativeIndex = index - currentIndex;
      const absIndex = Math.abs(relativeIndex);

      // Calculate position
      const xOffset = relativeIndex * config.spacing;
      const zOffset = -absIndex * 50;
      const rotation = relativeIndex * config.rotationRange;

      // Calculate scale and opacity based on distance from center
      const scale = Math.max(0.7, 1 - absIndex * 0.1);
      const opacity = absIndex <= 2 ? 1 : 0;

      // Apply transforms
      card.style.transform = `
        translateX(${xOffset}px)
        translateZ(${zOffset}px)
        rotateY(${rotation}deg)
        scale(${scale})
      `;
      card.style.opacity = opacity;
      card.style.zIndex = cards.length - absIndex;
      card.style.transition = isDragging ? 'none' : 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

      // Remove/add active class
      if (relativeIndex === 0) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  /**
   * Go to next card
   */
  function nextCard() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCards();
  }

  /**
   * Go to previous card
   */
  function prevCard() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCards();
  }

  /**
   * Go to specific card index
   */
  function goToCard(index) {
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    updateCards();
  }

  /**
   * Handle drag start
   */
  function handleDragStart(e) {
    if (!config.dragEnabled) return;

    isDragging = true;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    currentX = startX;

    cardsContainer.style.cursor = 'grabbing';
    cards.forEach(card => card.classList.add('dragging'));
  }

  /**
   * Handle drag move
   */
  function handleDragMove(e) {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = currentX - startX;

    // Add temporary offset to cards
    cards.forEach((card, index) => {
      const relativeIndex = index - currentIndex;
      const xOffset = relativeIndex * config.spacing + diff;
      const zOffset = -Math.abs(relativeIndex) * 50;
      const rotation = relativeIndex * config.rotationRange + (diff / 10);
      const scale = Math.max(0.7, 1 - Math.abs(relativeIndex) * 0.1);

      card.style.transform = `
        translateX(${xOffset}px)
        translateZ(${zOffset}px)
        rotateY(${rotation}deg)
        scale(${scale})
      `;
    });
  }

  /**
   * Handle drag end
   */
  function handleDragEnd() {
    if (!isDragging) return;

    const diff = currentX - startX;
    const threshold = 50; // Minimum drag distance to trigger card change

    if (diff > threshold) {
      prevCard();
    } else if (diff < -threshold) {
      nextCard();
    } else {
      updateCards(); // Reset to current position
    }

    isDragging = false;
    cardsContainer.style.cursor = 'grab';
    cards.forEach(card => card.classList.remove('dragging'));
  }

  /**
   * Handle card click
   */
  function handleCardClick(e) {
    const card = e.currentTarget;
    const index = Array.from(cards).indexOf(card);

    if (index !== currentIndex) {
      goToCard(index);
    }
  }

  /**
   * Close gallery
   */
  function closeGallery() {
    if (gallery) {
      gallery.classList.add('hidden');
    }
  }

  /**
   * Open gallery
   */
  function openGallery() {
    if (gallery) {
      gallery.classList.remove('hidden');
      updateCards();
    }
  }

  // Event Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', prevCard);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', nextCard);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeGallery);
  }

  // Drag events on container
  cardsContainer.addEventListener('mousedown', handleDragStart);
  cardsContainer.addEventListener('mousemove', handleDragMove);
  cardsContainer.addEventListener('mouseup', handleDragEnd);
  cardsContainer.addEventListener('mouseleave', handleDragEnd);

  // Touch events
  cardsContainer.addEventListener('touchstart', handleDragStart, { passive: false });
  cardsContainer.addEventListener('touchmove', handleDragMove, { passive: false });
  cardsContainer.addEventListener('touchend', handleDragEnd);

  // Click events on cards
  cards.forEach(card => {
    card.addEventListener('click', handleCardClick);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (gallery.classList.contains('hidden')) return;

    if (e.key === 'ArrowLeft') {
      prevCard();
    } else if (e.key === 'ArrowRight') {
      nextCard();
    } else if (e.key === 'Escape') {
      closeGallery();
    }
  });

  // Initialize
  updateCards();

  // Expose API for external control
  window.certGallery = {
    next: nextCard,
    prev: prevCard,
    goTo: goToCard,
    open: openGallery,
    close: closeGallery,
    getCurrentIndex: () => currentIndex,
  };
});
