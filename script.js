/* ═══════════════════════════════════════════════════════
   HER'S CO-LIVING — SCRIPT.JS
   Premium Women's Co-Living Landing Page
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── DARK / LIGHT MODE ─────────────────────────────────
   Persists preference via localStorage.
   Toggles 'dark' class on <html> element.
─────────────────────────────────────────────────────── */
const ThemeManager = (() => {
  const HTML        = document.documentElement;
  const TOGGLE_BTN  = document.getElementById('theme-toggle');
  const ICON_SUN    = document.getElementById('icon-sun');
  const ICON_MOON   = document.getElementById('icon-moon');
  const STORAGE_KEY = 'hers-theme';

  const DARK  = 'dark';
  const LIGHT = 'light';

  function applyTheme(theme) {
    if (theme === DARK) {
      HTML.classList.add(DARK);
      ICON_SUN.classList.remove('hidden');
      ICON_MOON.classList.add('hidden');
    } else {
      HTML.classList.remove(DARK);
      ICON_SUN.classList.add('hidden');
      ICON_MOON.classList.remove('hidden');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function init() {
    if (!TOGGLE_BTN) return;

    // Load saved preference, fall back to system preference
    const saved   = localStorage.getItem(STORAGE_KEY);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (systemDark ? DARK : LIGHT);

    applyTheme(initial);

    TOGGLE_BTN.addEventListener('click', () => {
      const current = HTML.classList.contains(DARK) ? DARK : LIGHT;
      applyTheme(current === DARK ? LIGHT : DARK);
    });
  }

  return { init };
})();


/* ─── MOBILE MENU ───────────────────────────────────────
   Toggles mobile navigation drawer.
─────────────────────────────────────────────────────── */
const MobileMenu = (() => {
  const BTN           = document.getElementById('mobile-menu-btn');
  const MENU          = document.getElementById('mobile-menu');
  const OPEN_CLASS    = 'mobile-menu-open';
  const CLOSED_CLASS  = 'mobile-menu-closed';
  const MENU_OPEN_CLS = 'menu-open';

  let isOpen = false;

  function open() {
    isOpen = true;
    MENU.classList.replace(CLOSED_CLASS, OPEN_CLASS);
    BTN.classList.add(MENU_OPEN_CLS);
    BTN.setAttribute('aria-expanded', 'true');
  }

  function close() {
    isOpen = false;
    MENU.classList.replace(OPEN_CLASS, CLOSED_CLASS);
    BTN.classList.remove(MENU_OPEN_CLS);
    BTN.setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function init() {
    if (!BTN || !MENU) return;

    BTN.addEventListener('click', toggle);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !BTN.contains(e.target) && !MENU.contains(e.target)) {
        close();
      }
    });

    // Close on resize (going to desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && isOpen) close();
    });
  }

  return { init, close };
})();

// Expose close function globally for inline onclick handlers
function closeMobileMenu() {
  MobileMenu.close();
}


/* ─── FAQ ACCORDION ─────────────────────────────────────
   Smooth expand / collapse with proper ARIA.
─────────────────────────────────────────────────────── */
const FAQAccordion = (() => {
  function init() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content');
      const icon    = item.querySelector('.faq-icon');

      if (!trigger || !content || !icon) return;

      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Close all other open items
        items.forEach((otherItem) => {
          if (otherItem === item) return;
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon    = otherItem.querySelector('.faq-icon');

          if (otherTrigger && otherContent && otherIcon) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherContent.classList.remove('is-open');
            otherIcon.classList.remove('rotated');
            
            // Wait for transition then hide if needed
            setTimeout(() => {
              if (!otherContent.classList.contains('is-open')) {
                otherContent.classList.add('hidden');
              }
            }, 400);
          }
        });

        // Toggle current
        if (isExpanded) {
          trigger.setAttribute('aria-expanded', 'false');
          content.classList.remove('is-open');
          icon.classList.remove('rotated');
          
          setTimeout(() => {
            if (!content.classList.contains('is-open')) {
              content.classList.add('hidden');
            }
          }, 400);
        } else {
          trigger.setAttribute('aria-expanded', 'true');
          content.classList.remove('hidden');
          // Force reflow
          content.offsetHeight;
          content.classList.add('is-open');
          icon.classList.add('rotated');
        }
      });
    });
  }

  return { init };
})();


/* ─── SMOOTH SCROLL ─────────────────────────────────────
   Enhanced anchor scrolling with header offset.
─────────────────────────────────────────────────────── */
const SmoothScroll = (() => {
  function init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const headerHeight = document.getElementById('main-header')?.offsetHeight || 80;
        const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }

  return { init };
})();


/* ─── SCROLL EFFECTS ────────────────────────────────────
   Header shadow, active nav link, back-to-top visibility.
─────────────────────────────────────────────────────── */
const ScrollEffects = (() => {
  const header    = document.getElementById('main-header');
  const backToTop = document.getElementById('back-to-top');
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollY = window.scrollY;

    // Header shadow
    if (header) {
      header.classList.toggle('scrolled', scrollY > 20);
    }

    // Back to top visibility
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 400);
    }

    // Active nav link highlighting
    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop    = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentSection);
    });
  }

  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Run once on init
  }

  return { init };
})();


/* ─── INTERSECTION OBSERVER — REVEAL ────────────────────
   Animates elements into view as they enter the viewport.
─────────────────────────────────────────────────────── */
const RevealOnScroll = (() => {
  const TARGETS = [
    '.amenity-card',
    '.room-card',
    '.faq-item',
    '#about .grid > div',
    '#why-us .flex.gap-4',
  ];

  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    // Add reveal class to cards and items
    TARGETS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        el.classList.add('reveal');
        // Stagger delay for grid children
        el.style.transitionDelay = `${i * 0.08}s`;
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  return { init };
})();


/* ─── BACK TO TOP BUTTON ────────────────────────────────
   Injects and wires up a back-to-top button.
─────────────────────────────────────────────────────── */
const BackToTop = (() => {
  function init() {
    // Create button if not already in markup
    if (!document.getElementById('back-to-top')) {
      const btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
        </svg>
      `;
      document.body.appendChild(btn);

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  return { init };
})();


/* ─── IMAGE LAZY LOAD ───────────────────────────────────
   Enhances all lazy images with a fade-in transition.
─────────────────────────────────────────────────────── */
const ImageLoader = (() => {
  function init() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach((img) => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';

      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', () => {
          img.style.opacity = '1';
        });
        img.addEventListener('error', () => {
          img.style.opacity = '1';
        });
      }
    });
  }

  return { init };
})();


/* ─── COUNTER ANIMATION ─────────────────────────────────
   Animates numeric stats in the hero when they come into view.
─────────────────────────────────────────────────────── */
const CounterAnimation = (() => {
  function animateValue(el, start, end, duration, suffix) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current  = Math.round(start + (end - start) * eased);

      el.textContent = current + (suffix || '');

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function init() {
    // Find stat numbers in hero
    const statEls = document.querySelectorAll('.hero-text .font-display.text-3xl');
    if (!statEls.length) return;

    const stats = [
      { el: statEls[0], end: 100, suffix: '%' },
      { el: statEls[1], end: 24,  suffix: '/7' },
      { el: statEls[2], end: 50,  suffix: '+' },
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          stats.forEach(({ el, end, suffix }) => {
            animateValue(el, 0, end, 1200, suffix);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    if (statEls[0]) observer.observe(statEls[0]);
  }

  return { init };
})();


/* ─── STICKY HEADER SHRINK ──────────────────────────────
   Slightly shrinks header on scroll for polish.
─────────────────────────────────────────────────────── */
const HeaderShrink = (() => {
  const header = document.getElementById('main-header');
  const nav    = header?.querySelector('nav');

  function init() {
    if (!header || !nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.height = '64px';
      } else {
        nav.style.height = '';
      }
    }, { passive: true });
  }

  return { init };
})();


/* ─── INIT ALL MODULES ──────────────────────────────────
   Boot everything once the DOM is ready.
─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  MobileMenu.init();
  FAQAccordion.init();
  SmoothScroll.init();
  ScrollEffects.init();
  RevealOnScroll.init();
  BackToTop.init();
  ImageLoader.init();
  CounterAnimation.init();
  HeaderShrink.init();
});
