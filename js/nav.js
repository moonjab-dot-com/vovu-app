// nav.js — page-level setup: scroll animations, match reveal, stats count-up

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');

  // Scroll-triggered .will-animate elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animated');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.will-animate').forEach(el => observer.observe(el));

  // Match page — blur reveal
  const matchName   = document.getElementById('match-name');
  const matchAvatar = document.getElementById('match-avatar');
  if (matchName) {
    setTimeout(() => {
      matchName.classList.add('reveal-name');
      if (matchAvatar) {
        matchAvatar.style.transition = 'opacity 400ms ease';
        matchAvatar.style.opacity = '0';
        setTimeout(() => { matchAvatar.textContent = 'A'; matchAvatar.style.opacity = '1'; }, 400);
      }
    }, 600);
  }

  // Landing page demo card reveal (blur when scrolled into view)
  const demoName = document.getElementById('demo-name');
  if (demoName) {
    const demoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => demoName.classList.add('reveal-name'), 400);
          demoObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    demoObserver.observe(demoName);
  }

  // Navbar scroll border (landing)
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Rotating hero text (landing)
  const words = [
    'Going to the gym.',
    'Getting dinner.',
    'Grabbing coffee.',
    'Studying together.',
    'Walking at midnight.',
  ];
  const rotating = document.getElementById('rotating-word');
  if (rotating) {
    let i = 0;
    setInterval(() => {
      rotating.style.opacity = '0';
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotating.textContent = words[i];
        rotating.style.opacity = '1';
      }, 300);
    }, 2500);
  }

  // Stats count-up (landing)
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      if (isNaN(target)) return;
      let start    = null;
      const dur    = 1200;
      const step   = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.floor(p * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => statsObserver.observe(el));
});
