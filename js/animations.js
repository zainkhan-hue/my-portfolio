/* =============================================
   ANIMATIONS.JS — Extra visual effects
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Neon cursor trail ─────────────────────────
  const trail = [];
  const maxTrail = 12;

  document.addEventListener('mousemove', (e) => {
    trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (trail.length > maxTrail) trail.shift();

    trail.forEach((dot, i) => {
      let el = document.getElementById(`trail-${i}`);
      if (!el) {
        el = document.createElement('div');
        el.id = `trail-${i}`;
        el.style.cssText = `
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          z-index: 9998;
          transition: opacity 0.3s ease;
        `;
        document.body.appendChild(el);
      }
      const size  = (i / maxTrail) * 8 + 2;
      const alpha = (i / maxTrail) * 0.4;
      el.style.width   = `${size}px`;
      el.style.height  = `${size}px`;
      el.style.left    = `${dot.x - size / 2}px`;
      el.style.top     = `${dot.y - size / 2}px`;
      el.style.background = `rgba(0, 240, 255, ${alpha})`;
      el.style.boxShadow  = `0 0 ${size}px rgba(0, 240, 255, ${alpha})`;
    });
  });

  // ── Section entrance animations ───────────────
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.section').forEach(sec => {
    sec.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    sectionObserver.observe(sec);
  });

  // ── Glitch effect on hero name ────────────────
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    setInterval(() => {
      if (Math.random() < 0.03) {
        heroName.style.textShadow = `
          3px 0 #ff0044,
          -3px 0 #00f0ff,
          0 0 20px rgba(0, 240, 255, 0.8)
        `;
        setTimeout(() => {
          heroName.style.textShadow = '';
        }, 100);
      }
    }, 800);
  }

  // ── Neon border pulse on cards ────────────────
  document.querySelectorAll('.project-card, .timeline-card, .skill-category').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.15), inset 0 0 15px rgba(0, 240, 255, 0.03)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '';
    });
  });

  // ── Floating basketball bounce in footer ──────
  const footerBalls = document.querySelectorAll('.footer-ball');
  footerBalls.forEach((ball, i) => {
    ball.style.animation = `bounce ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`;
  });

  // ── Counter animation for stat boxes ─────────
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        if (text.includes('%')) {
          const target = parseInt(text);
          let current  = 0;
          const step   = target / 40;
          const timer  = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.round(current) + '%';
          }, 30);
        }
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => {
    statObserver.observe(el);
  });

  // ── Typing cursor blink on section titles ─────
  document.querySelectorAll('.section-title').forEach(title => {
    title.addEventListener('mouseenter', () => {
      title.style.letterSpacing = '4px';
      title.style.transition    = 'letter-spacing 0.3s ease';
    });
    title.addEventListener('mouseleave', () => {
      title.style.letterSpacing = '';
    });
  });

  // ── Random neon flicker on tags ───────────────
  setInterval(() => {
    const tags = document.querySelectorAll('.tag');
    if (tags.length === 0) return;
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    randomTag.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.5)';
    randomTag.style.borderColor = 'rgba(0, 240, 255, 0.7)';
    setTimeout(() => {
      randomTag.style.boxShadow   = '';
      randomTag.style.borderColor = '';
    }, 300);
  }, 2000);

  // ── Smooth scroll with offset for fixed nav ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Stack icon color on hover ─────────────────
  const iconColors = {
    'fa-html5':       '#e34c26',
    'fa-css3-alt':    '#264de4',
    'fa-js-square':   '#f7df1e',
    'fa-python':      '#3572A5',
    'fa-react':       '#61dafb',
    'fa-github':      '#ffffff',
    'fa-node-js':     '#68a063',
    'fa-database':    '#00f0ff',
  };

  document.querySelectorAll('.stack-icon').forEach(icon => {
    const i = icon.querySelector('i');
    if (!i) return;
    const cls = Array.from(i.classList).find(c => iconColors[c]);
    if (!cls) return;
    icon.addEventListener('mouseenter', () => {
      i.style.color      = iconColors[cls];
      i.style.textShadow = `0 0 12px ${iconColors[cls]}`;
    });
    icon.addEventListener('mouseleave', () => {
      i.style.color      = '';
      i.style.textShadow = '';
    });
  });

});
