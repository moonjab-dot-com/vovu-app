// onboarding.js — 22-step vibe profile form
// Problem 4: fresh vs ?edit=true detection
// Problem 5: saves to Supabase on final step
// Problem 6: steps 20–22 are now single-select (no free text anywhere)

const STEPS = [
  {
    id: 1, group: 'A', key: 'activities', type: 'multi-select-grid',
    illustration: './public/Post-It-To-Do-Notes--Streamline-Dhaka.png',
    question: 'What do you actually like doing?',
    sub: 'Be honest. These filter your feed forever. Skip parties? You\'ll never see a party plan.',
    callout: { icon: 'lock', text: 'These filter your feed forever.' },
    options: [
      { key: 'cafe',      icon: 'coffee',    label: 'Café' },
      { key: 'food',      icon: 'utensils',  label: 'Dining hall' },
      { key: 'gym',       icon: 'dumbbell',  label: 'Gym' },
      { key: 'study',     icon: 'book-open', label: 'Study' },
      { key: 'walk',      icon: 'footprints',label: 'Walk' },
      { key: 'movie',     icon: 'film',      label: 'Movie' },
      { key: 'sports',    icon: 'trophy',    label: 'Sports' },
      { key: 'offcampus', icon: 'map-pin',   label: 'Off-campus' },
      { key: 'party',     icon: 'music',     label: 'Party' },
    ],
    required: true, minSelections: 1,
  },
  {
    id: 2, group: 'B', key: 'group_size', type: 'single-select',
    illustration: './public/About-Our-Team-1--Streamline-Barcelona.png',
    question: 'How many people do you prefer?',
    options: [
      { key: '1on1',  label: 'Just the two of us' },
      { key: 'small', label: 'Small group (2–3)' },
      { key: 'either',label: 'I adapt to anything' },
      { key: 'large', label: 'The more the merrier' },
    ],
  },
  {
    id: 3, group: 'B', key: 'place_vibe', type: 'single-select',
    illustration: './public/Digital-Nomad-Working-Near-Beach--Streamline-Seoul.png',
    question: 'Your kind of place',
    sub: 'Where do you actually feel comfortable?',
    options: [
      { key: 'quiet',   label: 'Quiet and calm' },
      { key: 'chill',   label: 'Low-key, laid back' },
      { key: 'anywhere',label: 'Honestly anywhere' },
      { key: 'loud',    label: 'Loud, buzzing energy' },
    ],
  },
  {
    id: 4, group: 'B', key: 'plan_style', type: 'single-select',
    illustration: './public/Shipping--Streamline-Dhaka.png',
    question: 'How do you usually make plans?',
    options: [
      { key: 'lastminute', label: 'Last minute — text me now' },
      { key: 'dayof',      label: 'Same day is fine' },
      { key: 'ahead',      label: 'Day before is ideal' },
      { key: 'planahead',  label: 'I like planning ahead' },
    ],
  },
  {
    id: 5, group: 'B', key: 'duration', type: 'single-select',
    illustration: './public/Patience--Streamline-Dhaka.png',
    question: 'How long do you usually hang out?',
    options: [
      { key: 'quick',  label: 'Quick — 30 minutes' },
      { key: 'medium', label: 'Medium — 1 to 2 hours' },
      { key: 'long',   label: 'Long — I like to linger' },
    ],
  },
  {
    id: 6, group: 'C', key: 'timing', type: 'multi-select',
    illustration: './public/Space--Streamline-Seoul.png',
    question: 'When are you usually free?',
    sub: 'Pick all that apply.',
    options: [
      { key: 'morning',   label: 'Early morning' },
      { key: 'between',   label: 'Between classes' },
      { key: 'afternoon', label: 'Afternoons' },
      { key: 'evening',   label: 'Evenings' },
      { key: 'latenight', label: 'Late night' },
      { key: 'weekends',  label: 'Weekends mostly' },
    ],
    minSelections: 1,
  },
  {
    id: 7, group: 'C', key: 'time_of_day', type: 'single-select',
    question: 'You\'re more of a…',
    options: [
      { key: 'morning', label: 'Morning person' },
      { key: 'depends', label: 'Honestly depends on the day' },
      { key: 'night',   label: 'Night owl' },
    ],
  },
  {
    id: 8, group: 'C', key: 'best_days', type: 'multi-select',
    question: 'Best days for spontaneous plans?',
    options: [
      { key: 'mon', label: 'Monday' },
      { key: 'tue', label: 'Tuesday' },
      { key: 'wed', label: 'Wednesday' },
      { key: 'thu', label: 'Thursday' },
      { key: 'fri', label: 'Friday' },
      { key: 'sat', label: 'Saturday' },
      { key: 'sun', label: 'Sunday' },
    ],
    minSelections: 1,
  },
  {
    id: 9, group: 'D', key: 'openness', type: 'slider',
    illustration: './public/I-Have-A-Question--Streamline-Dhaka.png',
    question: 'How open are you to meeting someone completely new?',
    sub: 'Shown as a bar on your anonymous card. No numbers — just a vibe.',
    min: 1, max: 5, leftLabel: 'A little nervous', rightLabel: 'Love meeting people',
  },
  {
    id: 10, group: 'D', key: 'follow_through', type: 'slider',
    illustration: './public/Evaluate-Performance-Employee-Team--Streamline-Seoul.png',
    question: 'How often do you actually follow through on plans?',
    sub: 'Be honest. This also shows as a bar on your card.',
    min: 1, max: 5, leftLabel: 'I bail a lot', rightLabel: 'Always show up',
  },
  {
    id: 11, group: 'D', key: 'intent', type: 'single-select',
    illustration: './public/Searching-1--Streamline-Dhaka.png',
    question: 'What are you actually looking for?',
    sub: 'This is the most important question. Be real.',
    options: [
      { key: 'things_together', label: 'Someone to do things with' },
      { key: 'study_partner',   label: 'A study partner specifically' },
      { key: 'off_phone',       label: 'Just to get off my phone' },
      { key: 'new_friends',     label: 'New friends, honestly' },
    ],
  },
  {
    id: 12, group: 'D', key: 'energy_level', type: 'single-select',
    question: 'Your energy level this semester',
    options: [
      { key: 'alot',  label: 'Going through a lot right now' },
      { key: 'okay',  label: 'Doing okay' },
      { key: 'great', label: 'Honestly feeling great' },
    ],
  },
  {
    id: 13, group: 'D', key: 'talk_listen', type: 'single-select',
    illustration: './public/Digital-Service-Call-Center--Streamline-Dhaka.png',
    question: 'With someone new, you\'re more likely to…',
    options: [
      { key: 'listen',   label: 'Listen mostly' },
      { key: 'talk',     label: 'Talk mostly' },
      { key: 'balanced', label: 'Pretty balanced' },
    ],
  },
  {
    id: 14, group: 'D', key: 'recharge', type: 'single-select',
    illustration: './public/Space--Streamline-Seoul.png',
    question: 'After hanging out, you usually want…',
    options: [
      { key: 'more',   label: 'To do it again soon' },
      { key: 'alone',  label: 'Some time alone to recharge' },
      { key: 'either', label: 'Depends on the person' },
    ],
  },
  {
    id: 15, group: 'D', key: 'silence', type: 'single-select',
    question: 'How do you feel about silence with someone you just met?',
    options: [
      { key: 'love',    label: 'Love comfortable silence' },
      { key: 'prefer',  label: 'Prefer to keep talking' },
      { key: 'neutral', label: 'No real preference' },
    ],
  },
  {
    id: 16, group: 'E', key: 'distance', type: 'single-select',
    question: 'How far would you go for a plan?',
    options: [
      { key: 'nearby',    label: 'My side of campus' },
      { key: 'anywhere',  label: 'Anywhere on campus' },
      { key: 'offcampus', label: 'Off-campus too' },
    ],
  },
  {
    id: 17, group: 'E', key: 'notice', type: 'single-select',
    question: 'How much notice do you need?',
    options: [
      { key: 'none',    label: 'None — text me right now' },
      { key: 'hour',    label: 'An hour' },
      { key: 'hours',   label: 'A few hours' },
      { key: 'nextday', label: 'Next day preferably' },
    ],
  },
  {
    id: 18, group: 'E', key: 'group_pref', type: 'single-select',
    illustration: './public/About-Our-Team-1--Streamline-Barcelona.png',
    question: 'Plans you\'re most likely to actually show up to',
    options: [
      { key: 'one_on_one', label: '1-on-1 hangouts' },
      { key: 'small',      label: 'Small group (3–5)' },
      { key: 'any',        label: 'Any size honestly' },
    ],
  },
  {
    id: 19, group: 'F', key: 'interests', type: 'multi-select',
    illustration: './public/Post-It-To-Do-Notes--Streamline-Dhaka.png',
    question: 'Things you\'d talk about for hours',
    sub: 'Pick up to 3.',
    options: [
      { key: 'music',    label: 'Music' },
      { key: 'film',     label: 'Film' },
      { key: 'books',    label: 'Books' },
      { key: 'sports',   label: 'Sports' },
      { key: 'tech',     label: 'Tech' },
      { key: 'art',      label: 'Art' },
      { key: 'food',     label: 'Food' },
      { key: 'politics', label: 'Politics' },
      { key: 'gaming',   label: 'Gaming' },
      { key: 'wellness', label: 'Wellness' },
      { key: 'travel',   label: 'Travel' },
      { key: 'fashion',  label: 'Fashion' },
      { key: 'science',  label: 'Science' },
    ],
    maxSelections: 3, minSelections: 1,
  },

  // ── PROBLEM 6: Steps 20–22 are now single-select. Zero free text. ──

  {
    id: 20, group: 'F', key: 'current_vibe', type: 'single-select',
    illustration: './public/Faq--Streamline-Dhaka.png',
    question: 'Your current vibe this semester',
    sub: 'This shows on your anonymous card.',
    options: [
      { key: 'Chaotic but thriving',    label: 'Chaotic but thriving' },
      { key: 'Tired but present',       label: 'Tired but present' },
      { key: 'Stressed but okay',       label: 'Stressed but okay' },
      { key: 'Surprisingly good',       label: 'Surprisingly good' },
      { key: 'Just surviving finals',   label: 'Just surviving finals' },
      { key: 'Social and energized',    label: 'Social and energized' },
      { key: 'Quiet and focused',       label: 'Quiet and focused' },
      { key: 'Figuring things out',     label: 'Figuring things out' },
      { key: 'Low-key and content',     label: 'Low-key and content' },
      { key: 'Ready for something new', label: 'Ready for something new' },
    ],
  },
  {
    id: 21, group: 'F', key: 'surprised_self', type: 'single-select',
    illustration: './public/I-Have-A-Question--Streamline-Dhaka.png',
    question: 'Last thing you did that surprised yourself',
    sub: 'Shown only to your match as a conversation starter.',
    options: [
      { key: 'Stayed in the library until 2am and loved it',   label: 'Stayed in the library until 2am and loved it' },
      { key: "Said yes to something I'd normally skip",         label: "Said yes to something I'd normally skip" },
      { key: 'Made a friend in the most random place',         label: 'Made a friend in the most random place' },
      { key: 'Discovered I actually like running',             label: 'Discovered I actually like running' },
      { key: 'Cooked a real meal instead of dining hall',      label: 'Cooked a real meal instead of dining hall' },
      { key: 'Read a book for fun (not class)',                 label: 'Read a book for fun (not class)' },
      { key: 'Had a conversation that changed my perspective', label: 'Had a conversation that changed my perspective' },
      { key: "Explored a part of campus I'd never seen",       label: "Explored a part of campus I'd never seen" },
      { key: 'Went to an event alone and had a great time',    label: 'Went to an event alone and had a great time' },
      { key: 'Realized I needed more sleep than I thought',    label: 'Realized I needed more sleep than I thought' },
    ],
  },
  {
    id: 22, group: 'F', key: 'semester_goal', type: 'single-select',
    illustration: './public/Leadership--Streamline-Dhaka.png',
    question: 'One thing you want to do before this semester ends',
    sub: 'Your match sees this after you connect.',
    options: [
      { key: 'Try that place everyone keeps recommending',   label: 'Try that place everyone keeps recommending' },
      { key: 'Pull an all-nighter (at least once)',          label: 'Pull an all-nighter (at least once)' },
      { key: "Go to an event I wouldn't normally attend",    label: "Go to an event I wouldn't normally attend" },
      { key: 'Make at least one new real friend',            label: 'Make at least one new real friend' },
      { key: 'Explore somewhere off-campus',                 label: 'Explore somewhere off-campus' },
      { key: 'Find my favorite study spot',                  label: 'Find my favorite study spot' },
      { key: "Have a meal that isn't dining hall",           label: "Have a meal that isn't dining hall" },
      { key: 'Join something new, even for one meeting',     label: 'Join something new, even for one meeting' },
      { key: "Have a conversation I've been avoiding",       label: "Have a conversation I've been avoiding" },
      { key: 'Do something completely spontaneous',          label: 'Do something completely spontaneous' },
    ],
  },
];

let obStep = 0;
const obAnswers = {};

function renderStep(stepIndex) {
  const step = STEPS[stepIndex];
  const wrapper = document.getElementById('ob-wrapper');
  if (!wrapper) return;

  const pct = ((stepIndex + 1) / STEPS.length * 100).toFixed(1);
  const prog = document.getElementById('ob-progress');
  if (prog) prog.style.width = pct + '%';

  const label = document.getElementById('ob-step-label');
  if (label) label.textContent = (stepIndex + 1) + ' of ' + STEPS.length;

  const backBtn = document.getElementById('ob-back');
  if (backBtn) backBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';

  let html = '<div class="ob-step step-enter">';

  if (step.illustration) {
    html += `<img src="${step.illustration}" width="120" height="120"
      class="ob-illustration fade-up" loading="lazy"
      style="object-fit:contain;display:block;margin:0 auto 24px"
      onerror="this.style.display='none'">`;
  }

  if (step.callout) {
    html += `<div class="ob-callout">
      <i data-lucide="${step.callout.icon}"></i>
      <span>${step.callout.text}</span>
    </div>`;
  }

  html += `<h2 class="ob-question fade-up-d1">${step.question}</h2>`;
  if (step.sub) html += `<p class="ob-sub fade-up-d2">${step.sub}</p>`;

  if (step.type === 'single-select') {
    html += '<div class="ob-options">';
    step.options.forEach(opt => {
      const sel = obAnswers[step.key] === opt.key ? 'selected' : '';
      html += `<button class="ob-option ${sel}"
        data-key="${step.key}" data-value="${opt.key}"
        onclick="obSelectSingle(this)">
        ${opt.icon ? `<i data-lucide="${opt.icon}"></i>` : ''}
        ${opt.label}
      </button>`;
    });
    html += '</div>';

  } else if (step.type === 'multi-select') {
    const selArr = obAnswers[step.key] || [];
    html += '<div class="ob-options">';
    step.options.forEach(opt => {
      const sel = selArr.includes(opt.key) ? 'selected' : '';
      html += `<button class="ob-option ${sel}"
        data-key="${step.key}" data-value="${opt.key}"
        onclick="obSelectMulti(this, ${step.maxSelections || 99})">
        ${opt.label}
      </button>`;
    });
    html += '</div>';
    if (step.maxSelections) {
      html += `<p class="ob-counter-note" id="sel-counter">
        ${selArr.length}/${step.maxSelections} selected
      </p>`;
    }

  } else if (step.type === 'multi-select-grid') {
    const selArr = obAnswers[step.key] || [];
    html += '<div class="ob-grid">';
    step.options.forEach(opt => {
      const sel = selArr.includes(opt.key) ? 'selected' : '';
      html += `<button class="ob-grid-item ${sel}"
        data-key="${step.key}" data-value="${opt.key}"
        onclick="obSelectGrid(this)">
        ${opt.icon ? `<i data-lucide="${opt.icon}"></i>` : ''}
        <span>${opt.label}</span>
        <div class="grid-check"><i data-lucide="check"></i></div>
      </button>`;
    });
    html += '</div>';
    const count = (obAnswers[step.key] || []).length;
    html += `<p class="ob-counter-note" id="grid-counter">
      ${count > 0 ? count + ' selected' : 'Select at least one'}
    </p>`;

  } else if (step.type === 'slider') {
    const val = obAnswers[step.key] !== undefined ? obAnswers[step.key] : 3;
    if (obAnswers[step.key] === undefined) obAnswers[step.key] = 3;
    html += `<div class="ob-slider-wrap">
      <input type="range" class="ob-slider" id="slider-${step.key}"
        min="${step.min}" max="${step.max}" value="${val}" step="1"
        oninput="obUpdateSlider('${step.key}', this.value)">
      <div class="slider-dots" id="dots-${step.key}">
        ${[1,2,3,4,5].map(n =>
          `<div class="slider-dot ${n <= val ? 'filled' : ''}" data-n="${n}"></div>`
        ).join('')}
      </div>
      <div class="slider-labels">
        <span>${step.leftLabel}</span>
        <span>${step.rightLabel}</span>
      </div>
    </div>`;
  }

  html += '</div>';
  wrapper.innerHTML = html;
  if (typeof lucide !== 'undefined') lucide.createIcons();
  obUpdateNextButton(step);
}

function obSelectSingle(btn) {
  const key = btn.dataset.key;
  const val = btn.dataset.value;
  btn.closest('.ob-options').querySelectorAll('.ob-option')
    .forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  obAnswers[key] = val;
  obUpdateNextButton(STEPS[obStep]);
}

function obSelectMulti(btn, maxSel) {
  const key = btn.dataset.key;
  const val = btn.dataset.value;
  if (!obAnswers[key]) obAnswers[key] = [];

  if (btn.classList.contains('selected')) {
    btn.classList.remove('selected');
    obAnswers[key] = obAnswers[key].filter(v => v !== val);
  } else {
    if (obAnswers[key].length >= maxSel) return;
    btn.classList.add('selected');
    obAnswers[key].push(val);
  }

  const counter = document.getElementById('sel-counter');
  if (counter && maxSel < 99) counter.textContent = obAnswers[key].length + '/' + maxSel + ' selected';
  obUpdateNextButton(STEPS[obStep]);
}

function obSelectGrid(btn) {
  const key = btn.dataset.key;
  const val = btn.dataset.value;
  if (!obAnswers[key]) obAnswers[key] = [];

  if (btn.classList.contains('selected')) {
    btn.classList.remove('selected');
    obAnswers[key] = obAnswers[key].filter(v => v !== val);
  } else {
    btn.classList.add('selected');
    obAnswers[key].push(val);
  }

  const counter = document.getElementById('grid-counter');
  const n = obAnswers[key].length;
  if (counter) counter.textContent = n > 0 ? n + ' selected' : 'Select at least one';
  if (typeof lucide !== 'undefined') lucide.createIcons();
  obUpdateNextButton(STEPS[obStep]);
}

function obUpdateSlider(key, value) {
  obAnswers[key] = parseInt(value);
  const dotsEl = document.getElementById('dots-' + key);
  if (!dotsEl) return;
  dotsEl.querySelectorAll('.slider-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < parseInt(value));
  });
  obUpdateNextButton(STEPS[obStep]);
}

function obUpdateNextButton(step) {
  const nextBtn = document.getElementById('ob-next');
  if (!nextBtn) return;
  let ready = false;

  if (step.type === 'slider') {
    ready = true;
  } else if (step.type === 'single-select') {
    ready = !!obAnswers[step.key];
  } else if (step.type === 'multi-select' || step.type === 'multi-select-grid') {
    const min = step.minSelections || 1;
    ready = (obAnswers[step.key] || []).length >= min;
  }

  nextBtn.disabled = !ready;
  if (obStep === STEPS.length - 1) {
    nextBtn.innerHTML = 'Enter Vovu <i data-lucide="arrow-right"></i>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// ── PROBLEM 5: Save to Supabase on final step ─────────────────────────

async function obNext() {
  if (obStep === STEPS.length - 1) {
    const btn = document.getElementById('ob-next');
    btn.disabled = true;
    btn.innerHTML = 'Saving… <span class="spinner" style="width:18px;height:18px;border-width:2px;border-color:rgba(255,239,179,0.35);border-top-color:var(--butter);"></span>';

    try {
      // 1. Fresh session — never use cache
      const { data: { session }, error: sessErr } = await window._supabase.auth.getSession();
      if (sessErr || !session) {
        window.location.href = './login.html';
        return;
      }

      const uid        = session.user.id;
      const email      = session.user.email;
      const campus     = email.split('@')[1];
      const emailUser  = email.split('@')[0];
      const firstName  = emailUser.split('.')[0].charAt(0).toUpperCase()
                       + emailUser.split('.')[0].slice(1);
      const initial    = firstName.charAt(0).toUpperCase();

      console.log('Saving onboarding for:', uid, email);

      // 2. Upsert user row — must succeed before profile save
      //    first_name + verified: both NOT NULL, both required
      const { error: userErr } = await window._supabase
        .from('users')
        .upsert(
          { id: uid, email, campus, first_name: firstName, verified: true },
          { onConflict: 'id', ignoreDuplicates: false }
        );

      if (userErr) {
        console.error('User upsert failed:', userErr);
        throw new Error('Could not save your account: ' + userErr.message);
      }

      // 3. Build and save profile — every answer mapped explicitly
      const profileData = {
        id:             uid,
        activities:     obAnswers.activities     || [],
        group_size:     obAnswers.group_size      || null,
        place_vibe:     obAnswers.place_vibe      || null,
        plan_style:     obAnswers.plan_style      || null,
        duration:       obAnswers.duration        || null,
        timing:         obAnswers.timing          || [],
        time_of_day:    obAnswers.time_of_day     || null,
        best_days:      obAnswers.best_days       || [],
        openness:       parseInt(obAnswers.openness)       || 3,
        follow_through: parseInt(obAnswers.follow_through) || 3,
        intent:         obAnswers.intent          || null,
        energy_level:   obAnswers.energy_level    || null,
        talk_listen:    obAnswers.talk_listen     || null,
        recharge:       obAnswers.recharge        || null,
        silence:        obAnswers.silence         || null,
        distance:       obAnswers.distance        || null,
        notice:         obAnswers.notice          || null,
        group_pref:     obAnswers.group_pref      || null,
        interests:      obAnswers.interests       || [],
        current_vibe:   obAnswers.current_vibe    || null,
        surprised_self: obAnswers.surprised_self  || null,
        semester_goal:  obAnswers.semester_goal   || null,
        initial:        initial,
      };

      console.log('Profile to save:', profileData);

      const { error: profileErr } = await window._supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id', ignoreDuplicates: false });

      if (profileErr) {
        console.error('Profile save failed:', profileErr);
        throw new Error('Could not save your profile: ' + profileErr.message);
      }

      // 4. Cache to localStorage
      localStorage.setItem('vovu_uid',        uid);
      localStorage.setItem('vovu_email',      email);
      localStorage.setItem('vovu_campus',     campus);
      localStorage.setItem('vovu_first_name', firstName);
      localStorage.setItem('vovu_profile',    JSON.stringify(profileData));
      localStorage.removeItem('vovu_onboarding_answers');

      // 5. Done
      window.location.href = './feed.html';

    } catch (err) {
      console.error('Onboarding save error:', err);
      btn.disabled = false;
      btn.innerHTML = 'Enter Vovu <i data-lucide="arrow-right"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      // Alert so the user knows it failed — not a silent swallow
      alert('Could not save your profile.\n\n' + err.message + '\n\nPlease try again.');
    }

    return;
  }

  obStep = Math.min(obStep + 1, STEPS.length - 1);
  renderStep(obStep);
  window.scrollTo(0, 0);
}

function obBack() {
  if (obStep === 0) return;
  obStep = Math.max(obStep - 1, 0);
  renderStep(obStep);
  window.scrollTo(0, 0);
}

// ── PROBLEM 4: Fresh vs ?edit=true detection ──────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const isEdit = new URLSearchParams(window.location.search).has('edit');

  if (!isEdit) {
    // Fresh onboarding — start completely blank
    localStorage.removeItem('vovu_profile');
    localStorage.removeItem('vovu_onboarding_answers');
    // obAnswers is already {} — nothing pre-selected
  } else {
    // Edit mode — restore saved answers from localStorage
    const saved = JSON.parse(localStorage.getItem('vovu_profile') || '{}');
    Object.assign(obAnswers, saved);

    // Also try Supabase if available
    if (typeof Auth !== 'undefined') {
      try {
        const session = await Auth.getSession();
        if (session) {
          const profile = await DB.getProfile(session.user.id);
          if (profile) Object.assign(obAnswers, profile);
        }
      } catch (e) { /* silent fallback */ }
    }
  }

  // Auth check — redirect if not signed in
  if (typeof Auth !== 'undefined') {
    const session = await Auth.getSession();
    if (!session) { window.location.href = './login.html'; return; }
    window.currentUser = {
      id:     session.user.id,
      email:  session.user.email,
      campus: localStorage.getItem('vovu_campus') || session.user.email.split('@')[1]
    };
  }

  renderStep(obStep);
});
