export type ActivityType =
  | 'cafe' | 'food' | 'gym' | 'study'
  | 'walk' | 'movie' | 'sports' | 'offcampus'

export interface User {
  id: string
  email: string
  campus: string
  first_name: string | null
  verified: boolean
  created_at: string
}

export interface Profile {
  id: string
  group_size: '1on1' | 'small' | 'either' | 'large'
  place_vibe: 'quiet' | 'chill' | 'anywhere' | 'loud'
  plan_style: 'lastminute' | 'dayof' | 'ahead' | 'planahead'
  activities: ActivityType[]
  timing: string[]
  follow_through: number
  openness: number
  duration: 'quick' | 'medium' | 'long'
  comfort_level: 'alot' | 'okay' | 'social'
  updated_at: string
}

export interface Plan {
  id: string
  creator_id: string
  campus: string
  activity: ActivityType
  zone: string
  time_window: string
  note: string | null
  spots: number
  exact_location: string | null
  exact_time: string | null
  is_active: boolean
  is_matched: boolean
  expires_at: string
  created_at: string
  applicant_count?: number
  already_applied?: boolean
}

export interface Applicant {
  id: string
  applicant_id: string
  status: 'pending' | 'yes_creator' | 'matched' | 'declined'
  initial: string
  activities: ActivityType[]
  follow_through: number
  openness: number
  is_me: boolean
}

export interface Match {
  id: string
  plan_id: string
  creator_id: string
  applicant_id: string
  activity: string
  exact_location: string
  exact_time: string
  created_at: string
  match_first_name: string
  match_email: string
}

export interface ActivityMeta {
  label: string
  icon: string
  zone_suggestions: string[]
}
