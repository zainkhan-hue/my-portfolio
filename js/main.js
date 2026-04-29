/* =============================================
   MAIN.JS — Navigation, Scroll, Interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ── Hamburger menu ────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  // Close menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // ── Active nav link on scroll ─────────────────
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const highlightNav = () => {
    const scrollY = window.scrollY;
    sections.forEach(section => {
      const sectionTop    = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId     = section.getAttribute('id');
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navItems.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.style.color = 'var(--neon-blue)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav);

  // ── Scroll reveal ─────────────────────────────
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .skill-category, .project-card, .timeline-card, .timeline-item, .stat-box, .stack-icon, .contact-item'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0) translateX(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach((el, index) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
    revealObserver.observe(el);
  });

  // ── Skill bar animation ───────────────────────
  const skillBars = document.querySelectorAll('.skill-fill');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar   = entry.target;
        const width = bar.getAttribute('data-width');
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 200);
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => skillObserver.observe(bar));

  // ── Contact form ──────────────────────────────
  const contactForm = document.getElementById('contactForm');
  const formStatus  = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = '⚠ Please fill in all required fields.';
        formStatus.style.color = 'var(--neon-orange)';
        return;
      }

      // Simulate send
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'SENDING...';
      btn.disabled    = true;

      setTimeout(() => {
        formStatus.textContent = '✓ Message sent! I\'ll get back to you soon.';
        formStatus.style.color = 'var(--neon-green)';
        contactForm.reset();
        btn.textContent = 'SEND MESSAGE ✈';
        btn.disabled    = false;
      }, 1500);
    });
  }

  // ── Typing effect for hero pre-title ─────────
  const preTitle = document.querySelector('.hero-pre-title');
  if (preTitle) {
    const messages = [
      '▶ INITIALIZING PROFILE...',
      '▶ LOADING SKILLS...',
      '▶ GAME ON.',
    ];
    let msgIndex  = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const current = messages[msgIndex];
      if (!isDeleting) {
        preTitle.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(typeEffect, 2000);
          return;
        }
      } else {
        preTitle.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          msgIndex   = (msgIndex + 1) % messages.length;
        }
      }
      setTimeout(typeEffect, isDeleting ? 50 : 80);
    };

    setTimeout(typeEffect, 1000);
  }

  // ── Neon flicker on logo ──────────────────────
  const logoText = document.querySelector('.logo-text');
  if (logoText) {
    setInterval(() => {
      if (Math.random() < 0.05) {
        logoText.style.opacity = '0.5';
        setTimeout(() => { logoText.style.opacity = '1'; }, 80);
      }
    }, 500);
  }

  // ── Parallax on hero grid ─────────────────────
  const heroGrid = document.querySelector('.hero-bg-grid');
  if (heroGrid) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroGrid.style.transform = `translateY(${scrolled * 0.3}px)`;
    });
  }

  // ── Add stagger delay to project cards ───────
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });

  // ── Add stagger delay to stack icons ─────────
  document.querySelectorAll('.stack-icon').forEach((icon, i) => {
    icon.style.transitionDelay = `${i * 0.05}s`;
  });

  console.log('%c PLAYER ONE — Portfolio Loaded ', 'background:#00f0ff;color:#000;font-size:14px;font-weight:bold;padding:6px 12px;');
});
