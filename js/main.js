// main.js — all page interactions

// =============================================
// WAITLIST (index.html)
// =============================================

function handleWaitlist(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('waitlist-email');
  const errorEl   = document.getElementById('waitlist-error');
  const form      = document.getElementById('waitlist-form');
  const success   = document.getElementById('success-state');
  if (!emailInput) return;

  const email = emailInput.value.trim();
  if (!email.includes('@') || !email.toLowerCase().endsWith('.edu')) {
    emailInput.classList.remove('shake');
    void emailInput.offsetWidth;
    emailInput.classList.add('shake');
    if (errorEl) { errorEl.textContent = 'Please use your .edu email address.'; errorEl.classList.remove('hidden'); }
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');
  const list = JSON.parse(localStorage.getItem('vovu_waitlist') || '[]');
  list.push({ email, campus: email.split('@')[1], ts: Date.now() });
  localStorage.setItem('vovu_waitlist', JSON.stringify(list));
  if (form)    form.classList.add('hidden');
  if (success) success.classList.remove('hidden');
}

// =============================================
// LOGIN (login.html)
// =============================================

const campusMap = {
  'kenyon.edu': 'Kenyon College',
  'oberlin.edu': 'Oberlin College',
  'mit.edu': 'MIT',
  'harvard.edu': 'Harvard University',
  'stanford.edu': 'Stanford University',
  'yale.edu': 'Yale University',
  'columbia.edu': 'Columbia University',
  'princeton.edu': 'Princeton University',
  'brown.edu': 'Brown University',
  'dartmouth.edu': 'Dartmouth College',
  'cornell.edu': 'Cornell University',
  'upenn.edu': 'University of Pennsylvania',
  'usc.edu': 'USC',
  'ucla.edu': 'UCLA',
  'umich.edu': 'University of Michigan',
  'nyu.edu': 'NYU',
  'bu.edu': 'Boston University',
  'northeastern.edu': 'Northeastern University',
  'tufts.edu': 'Tufts University',
  'williams.edu': 'Williams College',
  'amherst.edu': 'Amherst College',
  'swarthmore.edu': 'Swarthmore College',
  'brynmawr.edu': 'Bryn Mawr College',
  'haverford.edu': 'Haverford College',
  'reed.edu': 'Reed College',
  'carleton.edu': 'Carleton College',
  'middlebury.edu': 'Middlebury College',
};

function onEmailInput() {
  const input   = document.getElementById('email-input');
  const confirm = document.getElementById('campus-confirm');
  const nameEl  = document.getElementById('campus-name-text');
  if (!input || !confirm) return;
  const email = input.value.trim().toLowerCase();
  if (email.includes('@') && email.endsWith('.edu')) {
    const domain = email.split('@')[1];
    if (nameEl) nameEl.textContent = (campusMap[domain] || domain) + ' detected';
    confirm.classList.remove('hidden');
  } else {
    confirm.classList.add('hidden');
  }
}

function handleLogin() {
  const input     = document.getElementById('email-input');
  const errorEl   = document.getElementById('email-error');
  const loginForm = document.getElementById('login-form');
  const sentState = document.getElementById('sent-state');
  const sentEmail = document.getElementById('sent-email');
  if (!input) return;

  const email = input.value.trim();
  if (!email.includes('@') || !email.toLowerCase().endsWith('.edu')) {
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    if (errorEl) { errorEl.textContent = 'Please use your .edu email.'; errorEl.classList.remove('hidden'); }
    return;
  }

  localStorage.setItem('vovu_email',  email);
  localStorage.setItem('vovu_campus', email.split('@')[1]);
  if (sentEmail)  sentEmail.textContent = email;
  if (loginForm)  loginForm.classList.add('hidden');
  if (sentState)  sentState.classList.remove('hidden');
}

// =============================================
// ONBOARDING (onboarding.html)
// =============================================

let currentStep = 1;
const totalSteps = 8;
const answers = {};

function showStep(n) {
  document.querySelectorAll('.step-content').forEach(s => s.classList.remove('active'));
  const step = document.getElementById('step-' + n);
  if (step) step.classList.add('active');

  const progress = document.getElementById('progress');
  if (progress) progress.style.width = (n / totalSteps * 100) + '%';

  const stepNum = document.getElementById('step-num');
  if (stepNum) stepNum.textContent = n;

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.textContent = n === totalSteps ? 'Enter Vovu →' : 'Continue →';
}

function nextStep() {
  if (currentStep === totalSteps) {
    const profile = JSON.parse(localStorage.getItem('vovu_profile') || '{}');
    Object.assign(profile, answers);
    localStorage.setItem('vovu_profile', JSON.stringify(profile));
    window.location.href = './feed.html';
    return;
  }
  currentStep = Math.min(currentStep + 1, totalSteps);
  showStep(currentStep);
}

function prevStep() {
  currentStep = Math.max(currentStep - 1, 1);
  showStep(currentStep);
}

function selectOption(btn, key, value) {
  const group = btn.closest('.options-group');
  if (group) group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  answers[key] = value;
}

function toggleActivity(btn, activity) {
  btn.classList.toggle('selected');
  if (!answers.activities) answers.activities = [];
  const idx = answers.activities.indexOf(activity);
  if (idx === -1) answers.activities.push(activity);
  else answers.activities.splice(idx, 1);
  const counter = document.getElementById('activity-counter');
  if (counter) {
    const n = answers.activities.length;
    counter.textContent = n + ' selected';
    counter.className = 'activity-counter' + (n > 0 ? ' has-selection' : '');
  }
}

function toggleTime(btn, time) {
  btn.classList.toggle('selected');
  if (!answers.times) answers.times = [];
  const idx = answers.times.indexOf(time);
  if (idx === -1) answers.times.push(time);
  else answers.times.splice(idx, 1);
}

function updateSlider(input, dotContainerId, key) {
  answers[key] = parseInt(input.value);
  const container = document.getElementById(dotContainerId);
  if (!container) return;
  const dots = container.querySelectorAll('.dot');
  dots.forEach((dot, i) => dot.classList.toggle('filled', i < parseInt(input.value)));
}

// =============================================
// FEED (feed.html)
// =============================================

function markApplied(e, btn) {
  e.stopPropagation();
  btn.textContent = '✓ Applied';
  btn.classList.add('applied');
  btn.disabled = true;
}

// =============================================
// POST (post.html)
// =============================================

let postData = { activity: null, zone: null };

function selectActivity(btn, activity) {
  document.querySelectorAll('.post-activity-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  postData.activity = activity;
  checkPostReady();
}

function selectZone(chip) {
  document.querySelectorAll('.suggestion-chip').forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
  postData.zone = chip.textContent;
  const customInput = document.getElementById('zone-custom');
  if (customInput) customInput.value = '';
  checkPostReady();
}

function selectSpot(btn, n) {
  document.querySelectorAll('.spot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  postData.spots = n;
}

function checkPostReady() {
  const submitBtn = document.getElementById('submit-plan-btn');
  if (!submitBtn) return;
  const timeEl  = document.getElementById('time-select');
  const timeVal = timeEl ? timeEl.value : '';
  submitBtn.disabled = !(postData.activity && postData.zone && timeVal);
}

function submitPlan() {
  const form    = document.getElementById('post-form');
  const success = document.getElementById('post-success');
  const bar     = document.getElementById('submit-bar');
  if (form)    form.classList.add('hidden');
  if (bar)     bar.classList.add('hidden');
  if (success) success.classList.remove('hidden');
}

function updateNoteCounter() {
  const textarea = document.getElementById('plan-note');
  const counter  = document.getElementById('note-counter');
  if (!textarea || !counter) return;
  if (textarea.value.length > 120) textarea.value = textarea.value.slice(0, 120);
  const n = textarea.value.length;
  counter.textContent = n + '/120';
  counter.className = 'char-counter' + (n >= 100 ? ' danger' : n >= 80 ? ' warn' : '');
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Onboarding
  if (document.getElementById('steps-wrapper')) showStep(1);

  // Waitlist form
  const waitlistForm = document.getElementById('waitlist-form');
  if (waitlistForm) waitlistForm.addEventListener('submit', handleWaitlist);

  // Login email input
  const emailInput = document.getElementById('email-input');
  if (emailInput) emailInput.addEventListener('input', onEmailInput);

  // Post time select
  const timeSelect = document.getElementById('time-select');
  if (timeSelect) timeSelect.addEventListener('change', checkPostReady);

  // Note textarea counter
  const noteTextarea = document.getElementById('plan-note');
  if (noteTextarea) noteTextarea.addEventListener('input', updateNoteCounter);
});
