// nav.js — page-level setup, scroll animations, match reveal

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');

  // Scroll-triggered animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.will-animate').forEach(el => {
    observer.observe(el);
  });

  // Match page reveal
  const matchName = document.getElementById('match-name');
  if (matchName) {
    setTimeout(() => {
      matchName.style.opacity = '1';
      matchName.classList.add('reveal-name');
      const questionMark = document.querySelector('.avatar-them');
      if (questionMark) questionMark.textContent = 'A';
    }, 600);
  }

  // Landing page demo card reveal
  const demoName = document.getElementById('demo-name');
  if (demoName) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            demoName.classList.add('reveal-name');
            demoName.style.opacity = '1';
          }, 400);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    revealObserver.observe(demoName);
  }

  // Navbar scroll border
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // Rotating hero text
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
      }, 200);
    }, 2500);
  }

  // Stats count-up
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        if (isNaN(target)) return;
        let start = null;
        const duration = 1200;
        const step = timestamp => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          el.textContent = Math.floor(progress * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => statsObserver.observe(el));
});
