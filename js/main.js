/* ============================================================
   HAPPY KIDS HIGH SCHOOL
   Main JavaScript — redesigned
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initScrollReveal();
  initDashboard();
  initFAQ();
  initGalleryLightbox();
  initContactForm();
  initBranches();
  initAchievements();
  initLucideIcons();
});

/* ============================================================
   STICKY NAVBAR + TOP BAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const topBar = document.getElementById('topBar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (topBar) {
      if (currentScroll > lastScroll && currentScroll > 120) {
        topBar.classList.add('hidden');
      } else {
        topBar.classList.remove('hidden');
      }
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ============================================================
   MOBILE DRAWER
   ============================================================ */
function initMobileDrawer() {
  const toggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileOverlay');
  const closeBtn = document.getElementById('mobileDrawerClose');

  if (!toggle || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  // Keyboard-accessible nav items
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // Mobile nav items switch panels
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.getAttribute('data-panel');
      if (panel) {
        window.switchToPanel && window.switchToPanel(panel);
        closeDrawer();
      }
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.style.getPropertyValue('--delay') || '0s';
        entry.target.style.transitionDelay = delay;
        requestAnimationFrame(() => {
          entry.target.classList.add('revealed');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   DASHBOARD PANEL NAVIGATION
   ============================================================ */
function initDashboard() {
  const panels = document.querySelectorAll('.dashboard-panel');
  const navLinks = document.querySelectorAll('.nav-link[data-panel]');
  const logo = document.querySelector('.navbar-logo');
  const footerLinks = document.querySelectorAll('.footer-links a[data-panel]');
  const ctaButtons = document.querySelectorAll('[data-panel]:not(.nav-link):not(.mobile-nav-item):not(.navbar-logo):not(.footer-links a)');
  let currentPanel = 'home';
  let isTransitioning = false;

  if (!panels.length) return;

  // Initial state — show home panels
  panels.forEach(p => {
    if (p.dataset.panel === 'home') {
      p.classList.add('active');
      p.style.display = '';
    } else {
      p.classList.remove('active');
      p.style.display = 'none';
    }
  });

  function switchToPanel(panelName, clickedLink) {
    if (isTransitioning || !panelName || panelName === currentPanel) return;
    isTransitioning = true;

    const currentEls = document.querySelectorAll(`.dashboard-panel[data-panel="${currentPanel}"]`);
    const targetEls = document.querySelectorAll(`.dashboard-panel[data-panel="${panelName}"]`);

    if (!targetEls.length) {
      isTransitioning = false;
      return;
    }

    // Immediately reset the scroll position to the top, synchronously with the
    // panel swap (same frame, so no visible jump). This guarantees a new panel
    // never opens at the previous page's scroll position — the previous
    // behaviour only attempted a smooth scroll after the transition, which
    // could be cancelled by layout shifts (panel swap / lazy images), leaving
    // the page stuck at the old scroll offset.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Fade out current panels
    currentEls.forEach(el => {
      el.classList.remove('active');
      el.classList.add('exit');
    });

    setTimeout(() => {
      currentEls.forEach(el => {
        el.classList.remove('exit');
        el.style.display = 'none';
      });

      // Fade in target panels
      targetEls.forEach(el => {
        el.style.display = '';
        el.classList.remove('exit');
        void el.offsetWidth;
        el.classList.add('active');
      });

      currentPanel = panelName;

      // Update nav active states
      navLinks.forEach(l => l.classList.remove('active'));
      const match = clickedLink || document.querySelector(`.nav-link[data-panel="${panelName}"]`);
      if (match) match.classList.add('active');

      // Update mobile nav active states
      document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-panel') === panelName);
      });

      // Update footer links
      footerLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-panel') === panelName);
      });

      // Scroll behaviour
      if (panelName === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
          const navbar = document.getElementById('navbar');
          const topBar = document.getElementById('topBar');
          const offset = (navbar ? navbar.offsetHeight : 76) + (topBar && !topBar.classList.contains('hidden') ? topBar.offsetHeight : 0) + 8;
          const targetPos = dashboard.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, targetPos), behavior: 'smooth' });
        }
      }

      // Re-trigger reveal animations inside newly shown panels
      targetEls.forEach(el => reTriggerReveals(el));

      isTransitioning = false;
    }, 420);
  }

  window.switchToPanel = switchToPanel;

  // Nav link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchToPanel(link.getAttribute('data-panel'), link);
    });
  });

  // Logo click / key → home
  if (logo) {
    const goHome = () => {
      const homeLink = document.querySelector('.nav-link[data-panel="home"]');
      switchToPanel('home', homeLink);
    };
    logo.addEventListener('click', goHome);
    logo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goHome();
      }
    });
  }

  // CTA buttons (hero, section CTAs)
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const panelName = btn.getAttribute('data-panel');
      if (!panelName) return;
      const navLink = document.querySelector(`.nav-link[data-panel="${panelName}"]`);
      switchToPanel(panelName, navLink || undefined);
    });
  });

  // Footer links
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const panelName = link.getAttribute('data-panel');
      if (!panelName) return;
      const navLink = document.querySelector(`.nav-link[data-panel="${panelName}"]`);
      switchToPanel(panelName, navLink || undefined);
    });
  });

  // Deep link support via hash (#about, #gallery, ...)
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    const target = document.querySelector(`.dashboard-panel[id="${initialHash}"]`);
    if (target && target.dataset.panel && target.dataset.panel !== 'home') {
      setTimeout(() => {
        const navLink = document.querySelector(`.nav-link[data-panel="${target.dataset.panel}"]`);
        switchToPanel(target.dataset.panel, navLink || undefined);
      }, 600);
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const target = document.querySelector(`.dashboard-panel[id="${hash}"]`);
      if (target && target.dataset.panel && target.dataset.panel !== currentPanel) {
        const navLink = document.querySelector(`.nav-link[data-panel="${target.dataset.panel}"]`);
        switchToPanel(target.dataset.panel, navLink || undefined);
      }
    }
  });
}

function reTriggerReveals(container) {
  const els = container.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  els.forEach((el, i) => {
    el.classList.remove('revealed');
    const delay = el.style.getPropertyValue('--delay') || '0s';
    setTimeout(() => {
      el.classList.add('revealed');
    }, 300 + (i * 60));
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(faq => faq.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ============================================================
   GALLERY LIGHTBOX (with prev/next)
   ============================================================ */
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const counter = document.getElementById('lightboxCounter');

  if (!lightbox) return;

  let images = [];
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateImage() {
    const item = images[currentIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function goPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  function goNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  // Gallery items open lightbox (click + keyboard)
  document.querySelectorAll('.gallery-item').forEach(item => {
    const openItem = () => {
      const allItems = [...document.querySelectorAll('.gallery-item')];
      images = allItems.map(el => ({
        src: el.querySelector('img') ? el.querySelector('img').src : '',
        alt: el.querySelector('img') ? el.querySelector('img').alt : ''
      }));
      const img = item.querySelector('img');
      currentIndex = Math.max(0, images.findIndex(g => g.src === (img ? img.src : '')));
      openLightbox(currentIndex);
    };
    item.addEventListener('click', openItem);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openItem();
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });
}

/* ============================================================
   CONTACT FORM — opens email client with pre-filled message
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Single persistent status element (avoids stacking duplicates)
  let status = form.querySelector('.form-status');
  if (!status) {
    status = document.createElement('div');
    status.className = 'form-status success';
    form.appendChild(status);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    const subject = encodeURIComponent(`Enquiry from ${name} — Happy Kids High School`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`
    );

    // Open the visitor's email client — the school address is pre-filled.
    window.location.href = `mailto:info@happykidshs.edu.in?subject=${subject}&body=${body}`;

    // Show a friendly confirmation
    status.textContent = 'Thank you! Your email app should open with your message ready to send. Prefer WhatsApp? Chat with us anytime.';
    status.style.display = 'block';

    clearTimeout(form._statusTimer);
    form._statusTimer = setTimeout(() => {
      status.style.display = 'none';
    }, 9000);
  });
}

/* ============================================================
   BRANCHES / CAMPUSES
   ------------------------------------------------------------
   To add real campus details when the school confirms them:
   1. Drop a photo into  images/campuses/campus-N.jpg
   2. Set the matching campus's `image` field below
   3. Fill in `location`, `curriculum`, `classes`, `description`
   4. Optionally set a dedicated `phone` / `email` per campus
   (Empty fields automatically fall back to the central office.)
   ============================================================ */
const CENTRAL_PHONE = '+91 79975 99852';
const CENTRAL_EMAIL = 'info@happykidshs.edu.in';

const branchData = [
  {
    id: 'campus-1',
    name: 'Campus 1',
    // image: 'images/campuses/campus-1.jpg',   // main campus photo lives in images/opt/campus-sm.jpg
    location: 'Main Campus — Shakarajupalle Village, Sidhout Block, Y.S.R. Kadapa District, A.P.',
    curriculum: 'CBSE & State Board (SSC)',
    classes: 'Nursery – Class 10',
    badge: 'Main Campus',
    description: 'Our home campus — a recognized, co-educational school serving the community of Shakarajupalle and surrounding areas since our founding.',
    note: 'Campus 1 is our main campus. Further facility details will be added soon.'
  },
  {
    id: 'campus-2',
    name: 'Campus 2',
    // image: 'images/campuses/campus-2.jpg',
    // phone: '',
    // email: '',
    location: '',
    curriculum: '',
    classes: '',
    badge: 'Growing Soon',
    description: 'We are expanding to serve more families. Contact our central office for the latest updates on this campus.',
    note: 'This campus is under planning. Details will be shared as they are confirmed.'
  },
  {
    id: 'campus-3',
    name: 'Campus 3',
    // image: 'images/campuses/campus-3.jpg',
    // phone: '',
    // email: '',
    location: '',
    curriculum: '',
    classes: '',
    badge: 'Growing Soon',
    description: 'We are expanding to serve more families. Contact our central office for the latest updates on this campus.',
    note: 'This campus is under planning. Details will be shared as they are confirmed.'
  },
  {
    id: 'campus-4',
    name: 'Campus 4',
    // image: 'images/campuses/campus-4.jpg',
    // phone: '',
    // email: '',
    location: '',
    curriculum: '',
    classes: '',
    badge: 'Growing Soon',
    description: 'We are expanding to serve more families. Contact our central office for the latest updates on this campus.',
    note: 'This campus is under planning. Details will be shared as they are confirmed.'
  },
  {
    id: 'campus-5',
    name: 'Campus 5',
    // image: 'images/campuses/campus-5.jpg',
    // phone: '',
    // email: '',
    location: '',
    curriculum: '',
    classes: '',
    badge: 'Growing Soon',
    description: 'We are expanding to serve more families. Contact our central office for the latest updates on this campus.',
    note: 'This campus is under planning. Details will be shared as they are confirmed.'
  }
];

/* Fallback text helpers — show real detail when provided, honest placeholder otherwise */
const orPending = (value, pending) => (value && value.trim()) ? value : pending;

/* Escape user-supplied values before injecting into innerHTML (staff will edit branchData) */
const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* Single source of truth for what each campus displays.
   Returns escaped display strings + a resolved image path. */
function branchDisplay(branch) {
  return {
    name: esc(branch.name),
    location: esc(orPending(branch.location, 'Location details to be confirmed by the central office.')),
    curriculum: esc(orPending(branch.curriculum, 'Curriculum details to be confirmed')),
    classes: esc(orPending(branch.classes, 'Classes to be confirmed')),
    description: esc(branch.description || ''),
    note: esc(branch.note || 'Details will be shared as they are confirmed.'),
    phone: orPending(branch.phone, CENTRAL_PHONE),
    email: orPending(branch.email, CENTRAL_EMAIL),
    image: branch.image || (branch.id === 'campus-1' ? 'images/opt/campus-sm.jpg' : ''),
    imageLarge: branch.image || (branch.id === 'campus-1' ? 'images/opt/campus.jpg' : '')
  };
}

function initBranches() {
  const grid = document.getElementById('branchesGrid');
  if (!grid) return;

  branchData.forEach((branch, index) => {
    const card = document.createElement('div');
    card.className = 'branch-card reveal-up';
    card.style.setProperty('--delay', `${0.1 * (index + 1)}s`);

    const d = branchDisplay(branch);
    const imageContent = d.image
      ? `<img src="${d.image}" alt="${d.name}" loading="lazy">`
      : `<i data-lucide="building-2"></i>`;

    card.innerHTML = `
      <div class="branch-card-image">${imageContent}</div>
      <div class="branch-card-body">
        <h3>${d.name}</h3>
        <p class="branch-detail"><i data-lucide="map-pin"></i> ${d.location}</p>
        <p class="branch-detail"><i data-lucide="book"></i> ${d.curriculum}</p>
        <p class="branch-detail"><i data-lucide="users"></i> ${d.classes}</p>
        <button class="branch-view-btn" data-branch-id="${branch.id}">View Campus Details <i data-lucide="arrow-right"></i></button>
      </div>
    `;

    card.querySelector('.branch-view-btn').addEventListener('click', () => {
      openBranchModal(branch.id);
    });

    grid.appendChild(card);
  });

  refreshIcons();

  // Reveal cards once in view
  setTimeout(() => {
    const reveals = grid.querySelectorAll('.reveal-up');
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 150 + (i * 90));
    });
  }, 120);
}

function openBranchModal(branchId) {
  const branch = branchData.find(b => b.id === branchId);
  if (!branch) return;

  const modal = document.getElementById('branchModal');
  const content = document.getElementById('branchModalContent');
  const overlay = document.getElementById('branchModalOverlay');
  const closeBtn = document.getElementById('branchModalClose');

  if (!modal || !content) return;

  // Bind close handlers once (modal is a static element in the HTML)
  if (!modal._closeBound) {
    modal._closeBound = true;
    modal._closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };
    if (closeBtn) closeBtn.addEventListener('click', modal._closeModal);
    if (overlay) overlay.addEventListener('click', modal._closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal._closeModal();
      }
    });
  }

  const d = branchDisplay(branch);
  const heroImage = d.imageLarge
    ? `<div class="modal-hero"><img src="${d.imageLarge}" alt="${d.name}"><div class="modal-hero-title">${d.name}</div></div>`
    : `<div class="modal-hero" style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); display:flex; align-items:flex-end;"><div class="modal-hero-title">${d.name}</div></div>`;

  content.innerHTML = `
    ${heroImage}
    <div class="modal-body">
      <p class="modal-desc">${d.description}</p>
      <div class="modal-details-grid">
        <div class="modal-detail-card">
          <h5>Location</h5>
          <p>${d.location}</p>
        </div>
        <div class="modal-detail-card">
          <h5>Curriculum</h5>
          <p>${d.curriculum}</p>
        </div>
        <div class="modal-detail-card">
          <h5>Classes</h5>
          <p>${d.classes}</p>
        </div>
        <div class="modal-detail-card">
          <h5>Contact</h5>
          <p><a href="tel:${d.phone.replace(/[^\d+]/g, '')}">${esc(d.phone)}</a></p>
          <p class="detail-note"><a href="mailto:${d.email}">${esc(d.email)}</a></p>
        </div>
        <div class="modal-detail-card">
          <h5>Campus Notes</h5>
          <p class="detail-note">${d.note}</p>
        </div>
      </div>
      <div class="modal-actions">
        <a href="https://wa.me/${d.phone.replace(/\D/g, '')}" target="_blank" rel="noopener" class="btn btn-accent">
          <i data-lucide="message-circle"></i> WhatsApp the Office
        </a>
        <a href="javascript:void(0)" class="btn btn-primary" data-panel="admissions">
          Apply Now <i data-lucide="arrow-right"></i>
        </a>
      </div>
    </div>
  `;

  // Wire panel buttons inside modal
  content.querySelectorAll('[data-panel]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const panelName = btn.getAttribute('data-panel');
      if (modal._closeModal) modal._closeModal();
      if (window.switchToPanel) {
        const navLink = document.querySelector(`.nav-link[data-panel="${panelName}"]`);
        window.switchToPanel(panelName, navLink || undefined);
      }
    });
  });

  refreshIcons();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ============================================================
   ACHIEVEMENTS
   ------------------------------------------------------------
   To add real results / competition wins when confirmed:
   1. Add entries to achievementsData.results / .competitions
   2. Each entry: { title, detail }
   Empty lists render an honest "to be published" note instead.
   ============================================================ */
const achievementsData = {
  // Real, verifiable school facts — already filled in
  recognitions: [
    { title: 'Recognized Institution', detail: 'A private unaided school recognized by the relevant education authorities.', icon: 'badge-check' },
    { title: 'Trusted in YSR Kadapa', detail: 'A trusted name for secondary education in the YSR Kadapa region.', icon: 'award' },
    { title: 'Nursery to Class 10', detail: 'Serving the rural community with a complete academic journey.', icon: 'graduation-cap' },
    { title: 'Community School', detail: 'Operational and growing — committed to quality education for local families.', icon: 'heart-handshake' }
  ],
  // Add real entries here as they are confirmed, e.g.:
  // results: [
  //   { title: 'Class X — 100% pass', detail: 'Academic year 2025–26 · State Board results' },
  //   { title: 'District top ranks', detail: 'Achieved by our Class X students' }
  // ],
  results: [],
  // competitions: [
  //   { title: 'District Science Fair — 1st Prize', detail: 'Science exhibition 2025' },
  //   { title: 'Inter-school Quiz — Winners', detail: 'Quiz competition 2025' }
  // ],
  competitions: []
};

function initAchievements() {
  const recognitionsGrid = document.getElementById('recognitionsGrid');
  const resultsList = document.getElementById('resultsList');
  const competitionsList = document.getElementById('competitionsList');

  if (recognitionsGrid) {
    recognitionsGrid.innerHTML = achievementsData.recognitions.map((r, i) => `
      <div class="recognition-card reveal-up" style="--delay: ${0.1 * (i + 1)}s">
        <div class="recognition-icon"><i data-lucide="${r.icon || 'award'}"></i></div>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.detail)}</p>
      </div>
    `).join('');
    // Reveal recognition cards once in view
    const reveals = recognitionsGrid.querySelectorAll('.reveal-up');
    reveals.forEach(el => {
      const delay = el.style.getPropertyValue('--delay') || '0s';
      el.style.transitionDelay = delay;
      el.classList.add('revealed');
    });
  }

  if (resultsList) renderAchievementList(resultsList, achievementsData.results, 'clipboard-check',
    'Board results will be published here after each academic year.');
  if (competitionsList) renderAchievementList(competitionsList, achievementsData.competitions, 'trophy',
    'Competition wins and awards will be added as they are achieved.');

  refreshIcons();
}

function renderAchievementList(container, items, icon, emptyText) {
  if (!items || !items.length) {
    container.innerHTML = `
      <div class="achievement-empty">
        <i data-lucide="info"></i>
        <p>${esc(emptyText)}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="achievement-item">
      <div class="achievement-item-icon"><i data-lucide="${icon}"></i></div>
      <div class="achievement-item-text">
        <strong>${esc(item.title)}</strong>
        <span>${esc(item.detail)}</span>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   LUCIDE ICONS
   ============================================================ */
function initLucideIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

/* Re-create icons after dynamic content is injected.
   Lucide skips elements already converted to <svg>, so a full pass is safe. */
function refreshIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}
