// js/db.js — Vovu DB + Auth helpers
// Must be loaded AFTER supabase-config.js (which sets window._supabase)

const sb = window._supabase;

// ── Shared constants ──────────────────────────────────────────────────

const ACTIVITY_ICONS = {
  cafe: 'coffee', food: 'utensils', gym: 'dumbbell', study: 'book-open',
  walk: 'footprints', movie: 'film', sports: 'trophy', offcampus: 'map-pin', other: 'plus'
};
const ACTIVITY_LABELS = {
  cafe: 'Café', food: 'Dining hall', gym: 'Gym', study: 'Study',
  walk: 'Walk', movie: 'Movie', sports: 'Sports', offcampus: 'Off-campus', other: 'Other'
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
    localStorage.removeItem('vovu_email');
    localStorage.removeItem('vovu_campus');
    localStorage.removeItem('vovu_profile');
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
  async getFeedPlans(campus) {
    const { data, error } = await sb
      .from('plans')
      .select('id, creator_id, campus, activity, zone, time_window, note, spots, is_active, expires_at, created_at')
      .eq('campus', campus)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getProfilesBulk(userIds) {
    if (!userIds || !userIds.length) return [];
    const { data, error } = await sb
      .from('profiles')
      .select('id, initial, activities, follow_through, openness, intent, timing, group_size, place_vibe, current_vibe, talk_listen')
      .in('id', userIds);
    if (error) throw error;
    return data || [];
  },

  async createPlan(planData) {
    // Enforce max 2 active plans per user
    const { count, error: countErr } = await sb
      .from('plans')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', planData.creator_id)
      .eq('is_active', true);
    if (countErr) throw countErr;
    if (count >= 2) { const e = new Error('MAX_PLANS'); e.code = 'MAX_PLANS'; throw e; }
    const { data, error } = await sb.from('plans').insert(planData).select().single();
    if (error) throw error;
    return data;
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
      .select('id, activity, zone, time_window, spots, is_active, is_matched, expires_at, created_at')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getApplications(planId) {
    const { data, error } = await sb
      .from('applications')
      .select('id, applicant_id, status, created_at')
      .eq('plan_id', planId)
      .in('status', ['pending', 'yes_creator'])
      .order('created_at', { ascending: true });
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
    const { data, error } = await sb
      .from('applications')
      .insert({ plan_id: planId, applicant_id: applicantId })
      .select().single();
    if (error) throw error;
    return data;
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
  }
};
