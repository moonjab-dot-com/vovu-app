// js/db.js — Vovu DB + Auth helpers
// Must be loaded AFTER supabase-config.js (which sets window._supabase)

const sb = window._supabase;

// ── Shared constants ──────────────────────────────────────────────────

const ACTIVITY_ICONS = {
  cafe: 'coffee', food: 'utensils', gym: 'dumbbell', study: 'book-open',
  walk: 'footprints', movie: 'film', sports: 'trophy', offcampus: 'map-pin', other: 'music'
};
const ACTIVITY_LABELS = {
  cafe: 'Café', food: 'Dining hall', gym: 'Gym', study: 'Study',
  walk: 'Walk', movie: 'Movie', sports: 'Sports', offcampus: 'Off-campus', other: 'Party'
};
const TIME_LABELS = {
  morning: 'Morning (8–11am)', midday: 'Midday (11am–1pm)',
  'early-afternoon': 'Early afternoon (1–3pm)', afternoon: 'Afternoon (3–5pm)',
  dinner: 'Dinner (5–7pm)', evening: 'Evening (7–9pm)', late: 'Late (9pm+)'
};
const INTENT_LABELS = {
  things_together: 'Someone to do things with',
  study_partner:   'A study partner',
  off_phone:       'Just to get off my phone',
  new_friends:     'New friends, honestly'
};

// ── Auth ──────────────────────────────────────────────────────────────

const Auth = {
  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },
  async signOut() {
    await sb.auth.signOut();
    ['vovu_uid','vovu_email','vovu_campus','vovu_first_name','vovu_profile','vovu_toast']
      .forEach(k => localStorage.removeItem(k));
    window.location.href = './login.html';
  }
};

// ── DB ────────────────────────────────────────────────────────────────

const DB = {

  async getUser(userId) {
    const { data, error } = await sb.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async updateUser(userId, fields) {
    const { data, error } = await sb
      .from('users').update(fields).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  // Upsert the public.users row — creates it if it doesn't exist yet.
  // Call this instead of updateUser when the row may not exist (e.g. onboarding).
  // verified MUST be included: it is NOT NULL and has no default without the SQL migration.
  async upsertUser(userId, email, campus, extraFields = {}) {
    const { data, error } = await sb
      .from('users')
      .upsert(
        { id: userId, email, campus, verified: true, ...extraFields },
        { onConflict: 'email' }
      )
      .select().single();
    if (error) throw error;
    return data;
  },

  // Returns null (not throw) when profile row doesn't exist yet
  async getProfile(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async saveProfile(userId, profileData) {
    const { data, error } = await sb
      .from('profiles').upsert({ id: userId, ...profileData }).select().single();
    if (error) throw error;
    return data;
  },

  // Only public columns — never requests exact_location / exact_time
  // excludeUserId: pass current user's id to hide their own plans from Discover
  async getFeedPlans(campus, excludeUserId = null) {
    let query = sb
      .from('plans')
      .select('id, creator_id, campus, activity, zone, time_window, day, note, spots, is_active, expires_at, created_at')
      .eq('campus', campus)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (excludeUserId) {
      query = query.neq('creator_id', excludeUserId);
    }

    const { data, error } = await query.limit(30);
    if (error) throw error;
    return data || [];
  },

  async getProfilesBulk(userIds) {
    if (!userIds || !userIds.length) return [];
    // Batch into 100 at a time — 200+ UUIDs in a single .in() exceeds PostgREST URL limit
    const results = [];
    for (let i = 0; i < userIds.length; i += 100) {
      const { data, error } = await sb
        .from('profiles')
        .select('id, initial, activities, follow_through, openness, intent, timing, group_size, place_vibe, current_vibe, talk_listen, plan_style, duration, time_of_day')
        .in('id', userIds.slice(i, i + 100));
      if (error) throw error;
      if (data) results.push(...data);
    }
    return results;
  },

  async createPlan(planData) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    // Check max 2 active plans
    const { data: existing, error: countErr } = await sb
      .from('plans')
      .select('id')
      .eq('creator_id', planData.creator_id)
      .eq('is_active', true);
    if (countErr) throw new Error('Could not check existing plans: ' + countErr.message);
    if ((existing || []).length >= 2) {
      const e = new Error('MAX_PLANS'); e.code = 'MAX_PLANS'; throw e;
    }

    const { error } = await sb.from('plans').insert(planData);
    if (error) throw new Error(error.message || error.details || JSON.stringify(error));
    return true;
  },

  // Public fields only — private fields blocked by REVOKE for non-owner
  async getPlan(planId) {
    const { data, error } = await sb
      .from('plans')
      .select('id, creator_id, campus, activity, zone, time_window, note, spots, is_active, is_matched, expires_at, created_at')
      .eq('id', planId)
      .single();
    if (error) throw error;
    return data;
  },

  // Creator only — uses SECURITY DEFINER function to bypass REVOKE
  async getPlanPrivate(planId) {
    const { data, error } = await sb.rpc('get_plan_private', { p_plan_id: planId });
    if (error) throw error;
    return data && data[0] ? data[0] : null;
  },

  async getMyPlans(userId) {
    const { data, error } = await sb
      .from('plans')
      .select('id, activity, zone, time_window, day, spots, is_active, is_matched, expires_at, created_at')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getApplications(planId) {
    // Direct SELECT — allowed by "applications: creator read" policy
    const { data, error } = await sb
      .from('applications')
      .select('id, plan_id, applicant_id, status, created_at')
      .eq('plan_id', planId)
      .in('status', ['pending', 'yes_creator']);
    if (error) throw error;
    return data || [];
  },

  async getMyApplications(userId) {
    const { data, error } = await sb
      .from('applications')
      .select('id, plan_id, status, created_at')
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async applyToPlan(planId, applicantId) {
    const { error } = await sb
      .from('applications')
      .insert({ plan_id: planId, applicant_id: applicantId });
    if (error) throw new Error(error.message || error.details || JSON.stringify(error));
    return true;
  },

  async withdrawApplication(planId, applicantId) {
    const { error } = await sb
      .from('applications')
      .delete()
      .eq('plan_id', planId)
      .eq('applicant_id', applicantId)
      .eq('status', 'pending');
    if (error) throw error;
  },

  // Update a single application's status (used by poster and applicant for YES mechanic)
  async updateApplication(appId, status) {
    const { error } = await sb
      .from('applications')
      .update({ status })
      .eq('id', appId);
    if (error) throw error;
  },

  // Calls the SQL function that atomically creates match + declines others
  async createMatch(applicationId) {
    const { data, error } = await sb.rpc('create_match', { p_application_id: applicationId });
    if (error) throw error;
    return data; // UUID of new match row
  },

  async getMatch(matchId) {
    const { data, error } = await sb.from('matches').select('*').eq('id', matchId).single();
    if (error) throw error;
    return data;
  },

  async getMyMatches() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return [];
    const uid = session.user.id;
    const { data, error } = await sb
      .from('matches')
      .select('*')
      .or(`creator_id.eq.${uid},applicant_id.eq.${uid}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};
