import './style.css'
import './contact.js'

console.log('Main JS loaded');

setupContactFAB();
setupMobileMenu();
playIntroAnimation();

function playIntroAnimation() {
  // Only run if the elements exist
  const introOverlay = document.getElementById('intro-overlay');
  const introLogo = document.getElementById('intro-logo');
  const headerLogoLink = document.querySelector('.logo');
  const headerLogoImg = document.querySelector('.logo img');

  if (!introOverlay || !introLogo || !headerLogoLink || !headerLogoImg) return;

  // Reset session on logo click
  headerLogoLink.addEventListener('click', () => {
    sessionStorage.removeItem('introPlayed');
  });

  // Check if we've already played the intro in this session
  if (sessionStorage.getItem('introPlayed')) {
    introOverlay.style.display = 'none'; // Instant hide
    headerLogoImg.style.opacity = '1';   // Instant show
    introOverlay.remove();
    return;
  }

  // Mark as played for next time
  sessionStorage.setItem('introPlayed', 'true');

  // 1. Wait for initial fade-in of the large logo
  setTimeout(() => {
    // Ensure the header logo is visible before the overlay fades
    headerLogoImg.style.opacity = '1';

    // 4. Animate: Just fade out the overlay
    const overlayAnimation = introOverlay.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration: 800,
      fill: 'forwards'
    });

    // 5. Cleanup after animation
    overlayAnimation.onfinish = () => {
      // Remove the overlay from DOM
      introOverlay.remove();
    };

  }, 1500); // Wait 1.5s for the initial appearance
}

function setupMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav-links');

  if (btn && nav) {
    btn.addEventListener('click', () => {
      nav.classList.toggle('active');
      const expanded = btn.getAttribute('aria-expanded') === 'true' || false;
      btn.setAttribute('aria-expanded', !expanded);
      btn.textContent = expanded ? '☰' : '✕'; // Toggle icon (simple text for now)
    });
  }
}

function setupContactFAB() {
  const fabHTML = `
    <div class="fab-container">
      <div class="fab-options">
        <a href="https://wa.me/919037085405" target="_blank" class="fab-option whatsapp" aria-label="WhatsApp">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
          <span class="tooltip">WhatsApp</span>
        </a>
        <a href="tel:+919037085405" class="fab-option call" aria-label="Call">
          <span class="material-symbols-outlined">call</span>
          <span class="tooltip">Call Us</span>
        </a>
      </div>
      <button class="fab-toggle" aria-label="Contact Us">
        <span class="material-symbols-outlined icon-open">chat</span>
        <span class="material-symbols-outlined icon-close">close</span>
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', fabHTML);

  const fabContainer = document.querySelector('.fab-container');
  const fabToggle = document.querySelector('.fab-toggle');

  if (fabContainer && fabToggle) {
    fabToggle.addEventListener('click', () => {
      fabContainer.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!fabContainer.contains(e.target) && fabContainer.classList.contains('active')) {
        fabContainer.classList.remove('active');
      }
    });
  }
}
