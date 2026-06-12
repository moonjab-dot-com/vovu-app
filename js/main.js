// main.js — Vovu interactions

// TEST MODE: remove these emails before launch
// TODO: delete TEST_EMAILS array before production
const TEST_EMAILS = [
  'moonjab.com@gmail.com',
  'foulardperu@gmail.com',
  'espanolsinfronteras1@gmail.com'
];

function isValidVovuEmail(email) {
  const lower = email.trim().toLowerCase();
  const isEdu  = lower.includes('@') && lower.endsWith('.edu');
  const isTest = TEST_EMAILS.includes(lower);
  return isEdu || isTest;
}

document.addEventListener('DOMContentLoaded', () => {

  // ── Lucide icons ─────────────────────────────
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // ── Navbar scroll border ─────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ── Scroll animations (.will-animate) ────────
  const scrollObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        entry.target.classList.add('animated'); // backwards compat
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.will-animate').forEach(el => scrollObs.observe(el));

  // ── Card entrance animations ──────────────────
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.card-enter').forEach(el => cardObs.observe(el));

  // ── Vibe bar animation on scroll ─────────────
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.bar-fill, .vibe-bar-fill').forEach(bar => {
          setTimeout(() => bar.classList.add('loaded'), 100);
        });
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.applicant-card, .card-preview, .profile-card-preview').forEach(el => {
    barObs.observe(el);
  });

  // ── Typewriter rotating word ──────────────────
  const rotatingEl = document.getElementById('rotating-word');
  if (rotatingEl) {
    const words = [
      'Going to the gym.',
      'Getting dinner.',
      'Grabbing coffee.',
      'Studying together.',
      'Walking at midnight.',
      'Doing absolutely nothing.',
    ];
    let wordIndex = 0;

    function typeChar(word, charIndex) {
      if (charIndex <= word.length) {
        rotatingEl.textContent = word.slice(0, charIndex);
        setTimeout(() => typeChar(word, charIndex + 1), 55);
      } else {
        setTimeout(() => deleteChar(word, word.length), 1800);
      }
    }

    function deleteChar(word, deleteIndex) {
      if (deleteIndex >= 0) {
        rotatingEl.textContent = word.slice(0, deleteIndex);
        setTimeout(() => deleteChar(word, deleteIndex - 1), 30);
      } else {
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(() => typeChar(words[wordIndex], 0), 300);
      }
    }

    setTimeout(() => typeChar(words[0], 0), 800);
  }

  // ── Stats count-up ────────────────────────────
  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      if (isNaN(target)) return;
      let startTime = null;
      const duration = 1400;

      function countUp(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(countUp);
      }

      requestAnimationFrame(countUp);
      statsObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => statsObs.observe(el));

  // ── Match name reveal ─────────────────────────
  const matchName = document.getElementById('match-name');
  const matchAvatar = document.getElementById('match-avatar');
  if (matchName) {
    setTimeout(() => {
      if (matchAvatar) {
        matchAvatar.style.transition = 'opacity 400ms ease';
        matchAvatar.style.opacity = '0';
        setTimeout(() => {
          matchAvatar.textContent = 'A';
          matchAvatar.style.opacity = '1';
        }, 400);
      }
      matchName.classList.add('reveal-name');
    }, 600);
  }

  // ── Demo card reveal (landing) ────────────────
  const demoName = document.getElementById('demo-name');
  if (demoName) {
    const demoObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => demoName.classList.add('reveal-name'), 400);
          demoObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    demoObs.observe(demoName);
  }

  // ── Login page ────────────────────────────────
  const emailInput = document.getElementById('email-input');
  if (emailInput) {
    const campusMap = {
      'kenyon.edu': 'Kenyon College', 'oberlin.edu': 'Oberlin College',
      'mit.edu': 'MIT', 'harvard.edu': 'Harvard University',
      'stanford.edu': 'Stanford University', 'yale.edu': 'Yale University',
      'columbia.edu': 'Columbia University', 'princeton.edu': 'Princeton University',
      'brown.edu': 'Brown University', 'dartmouth.edu': 'Dartmouth College',
      'cornell.edu': 'Cornell University', 'upenn.edu': 'University of Pennsylvania',
      'usc.edu': 'USC', 'ucla.edu': 'UCLA', 'nyu.edu': 'NYU',
      'umich.edu': 'University of Michigan', 'bu.edu': 'Boston University',
      'tufts.edu': 'Tufts University', 'swarthmore.edu': 'Swarthmore College',
      'amherst.edu': 'Amherst College', 'williams.edu': 'Williams College',
      'reed.edu': 'Reed College', 'carleton.edu': 'Carleton College',
      'middlebury.edu': 'Middlebury College', 'grinnell.edu': 'Grinnell College',
    };

    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim().toLowerCase();
      const confirmEl = document.getElementById('campus-confirm');
      const nameEl = document.getElementById('campus-name-text');
      const sendBtn = document.getElementById('send-btn');

      // TEST MODE: isValidVovuEmail allows test Gmail addresses — remove before launch
      if (isValidVovuEmail(val)) {
        const domain = val.split('@')[1];
        // TEST MODE: show "Test account" for whitelisted Gmail addresses
        const displayName = TEST_EMAILS.includes(val)
          ? 'Test account'
          : (campusMap[domain] || domain);
        if (nameEl) nameEl.textContent = displayName + ' detected';
        if (confirmEl) confirmEl.classList.remove('hidden');
        if (sendBtn) sendBtn.removeAttribute('disabled');
      } else {
        if (confirmEl) confirmEl.classList.add('hidden');
        if (sendBtn) sendBtn.setAttribute('disabled', '');
      }
    });
  }

  // ── Post form: time select ────────────────────
  const timeSelect = document.getElementById('time-select');
  if (timeSelect) timeSelect.addEventListener('change', checkPostReady);

  // ── Note textarea counter ─────────────────────
  const noteTextarea = document.getElementById('plan-note');
  if (noteTextarea) noteTextarea.addEventListener('input', updateNoteCounter);

});

// ── Login handler ───────────────────────────────
async function handleLogin() {
  const input     = document.getElementById('email-input');
  const errorEl   = document.getElementById('email-error');
  const loginForm = document.getElementById('login-form');
  const sentState = document.getElementById('sent-state');
  const sentEmail = document.getElementById('sent-email');
  const sendBtn   = document.getElementById('send-btn');
  if (!input) return;

  const email = input.value.trim();
  // TEST MODE: isValidVovuEmail allows test Gmail addresses — remove before launch
  if (!isValidVovuEmail(email)) {
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    if (errorEl) {
      errorEl.textContent = 'Please use your .edu email.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  // Disable button while sending
  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending…'; }
  if (errorEl) errorEl.classList.add('hidden');

  // Send magic link via Supabase
  const redirectTo = window.location.origin + window.location.pathname.replace('login.html', '') + 'verify.html';
  const { error } = await window._supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });

  if (error) {
    if (sendBtn) { sendBtn.disabled = false; sendBtn.innerHTML = '<i data-lucide="mail"></i> Send me a link'; if (typeof lucide !== 'undefined') lucide.createIcons(); }
    if (errorEl) {
      errorEl.textContent = error.message || 'Could not send link. Try again.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  // Success — store campus for later, show "check inbox" state
  localStorage.setItem('vovu_email',  email);
  localStorage.setItem('vovu_campus', email.split('@')[1]);
  if (sentEmail) sentEmail.textContent = email;
  if (loginForm) loginForm.classList.add('hidden');
  if (sentState) sentState.classList.remove('hidden');
}

// ── XSS escape — use for any user-generated content rendered via innerHTML ──
window.esc = function(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ── Toast ───────────────────────────────────────
window.showToast = function(message, type) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast visible';
  toast.style.background = type === 'error' ? '#dc2626' : 'var(--forest)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast hiding';
    setTimeout(() => { toast.className = 'toast'; }, 300);
  }, 3000);
};

// ── Feed: apply to plan ─────────────────────────
function markApplied(e, btn) {
  e.stopPropagation();
  btn.innerHTML = '<i data-lucide="check"></i> Applied';
  btn.classList.add('applied');
  btn.disabled = true;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  if (window.showToast) showToast('Applied anonymously');
}

// ── Post form ───────────────────────────────────
let postData = { activity: null, zone: null, spots: 1, day: null };

function selectActivity(btn, activity) {
  document.querySelectorAll('.post-activity-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  postData.activity = activity;
  checkPostReady();
}

function selectZone(chip) {
  document.querySelectorAll('.suggestion-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  postData.zone = chip.textContent.trim();
  const custom = document.getElementById('zone-custom');
  if (custom) custom.value = '';
  checkPostReady();
}

function selectSpot(btn, n) {
  document.querySelectorAll('.spot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  postData.spots = n;
}

function selectDay(day, btn) {
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  postData.day = day;
}

function getSelectedDay() {
  return postData.day;
}

function checkPostReady() {
  const submitBtn = document.getElementById('submit-plan-btn');
  if (!submitBtn) return;
  const timeEl = document.getElementById('time-select');
  const timeVal = timeEl ? timeEl.value : '';
  submitBtn.disabled = !(postData.activity && postData.zone && timeVal);
}

function submitPlan() {
  const form = document.getElementById('post-form');
  const success = document.getElementById('post-success');
  const bar = document.getElementById('submit-bar');
  const bottomNav = document.querySelector('.bottom-nav');
  if (form) form.classList.add('hidden');
  if (bar) bar.classList.add('hidden');
  if (bottomNav) bottomNav.classList.add('hidden');
  if (success) success.classList.remove('hidden');
}

function updateNoteCounter() {
  const ta = document.getElementById('plan-note');
  const counter = document.getElementById('note-counter');
  if (!ta || !counter) return;
  if (ta.value.length > 120) ta.value = ta.value.slice(0, 120);
  const n = ta.value.length;
  counter.textContent = n + '/120';
  counter.className = 'char-counter' + (n >= 100 ? ' danger' : n >= 80 ? ' warn' : '');
}

window.switchFeedTab = function(tab, btn) {
  document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const discoverEl = document.getElementById('discover-section');
  const yourPlansEl = document.getElementById('your-plans-section');
  const filterRow = document.getElementById('filter-row');
  if (tab === 'discover') {
    discoverEl?.classList.remove('hidden');
    yourPlansEl?.classList.add('hidden');
    filterRow?.classList.remove('hidden');
  } else {
    discoverEl?.classList.add('hidden');
    yourPlansEl?.classList.remove('hidden');
    filterRow?.classList.add('hidden');
  }
};

window.filterPlans = function(activity, btn) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('.plan-card');
  const OFF_CAMPUS_ZONES = ['off campus', 'off-campus', 'gambia', 'town', 'downtown', 'village'];
  cards.forEach(card => {
    let show = false;
    if (activity === 'all') {
      show = true;
    } else if (activity === 'off-campus') {
      const zone = (card.dataset.zone || '').toLowerCase();
      show = OFF_CAMPUS_ZONES.some(z => zone.includes(z)) || zone.startsWith('off');
    } else {
      show = card.dataset.activity === activity;
    }
    card.style.display = show ? '' : 'none';
  });
  const visible = Array.from(document.querySelectorAll('.plan-card')).filter(c => c.style.display !== 'none');
  const countEl = document.getElementById('plan-count');
  if (countEl) countEl.textContent = visible.length;
};

window.openPlan = function(role, planId) {
  if (role === 'seeker') {
    window.location.href = './plan-seeker.html?id=' + planId;
  } else {
    window.location.href = './plan-poster.html?id=' + planId;
  }
};

// Data deletion — runs if URL has ?delete=request
if (typeof window !== 'undefined' && window.location.search.includes('delete=request')) {
  var delEmail = prompt('Enter your .edu email to request account deletion:');
  if (delEmail && delEmail.trim()) {
    var sb = window._supabase;
    if (sb) {
      sb.from('waitlist').upsert({
        email: delEmail.trim(),
        campus: 'DELETION_REQUEST',
        created_at: new Date().toISOString()
      }).then(function () {
        alert(
          'Deletion request received.\n' +
          'We will delete your account and all data within 30 days\n' +
          'and confirm by email to ' + delEmail.trim() + '.'
        );
      }).catch(function () {
        alert('Request logged. Email privacy@vovu.app to confirm.');
      });
    } else {
      alert('To request deletion, email privacy@vovu.app from your .edu address.');
    }
  }
}
