import { ActivityType, ActivityMeta } from './types'

export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  cafe:      {
    label: 'Café',
    icon: '☕',
    zone_suggestions: [
      'Near the village coffee shop',
      'Campus café area',
      'Student union building',
    ],
  },
  food:      {
    label: 'Dining hall',
    icon: '🍽️',
    zone_suggestions: [
      'Main dining hall area',
      'North campus dining',
      'South campus dining',
    ],
  },
  gym:       {
    label: 'Gym',
    icon: '🏋️',
    zone_suggestions: [
      'Campus rec center',
      'Athletic complex',
      'Fitness center',
    ],
  },
  study:     {
    label: 'Study',
    icon: '📚',
    zone_suggestions: [
      'Main library area',
      'Academic building',
      'Campus study spaces',
    ],
  },
  walk:      {
    label: 'Walk',
    icon: '🚶',
    zone_suggestions: [
      'Campus loop',
      'Main path',
      'Campus gardens',
    ],
  },
  movie:     {
    label: 'Movie',
    icon: '🎬',
    zone_suggestions: [
      'Campus common room',
      'Student center lounge',
      'North campus lounge',
    ],
  },
  sports:    {
    label: 'Sports',
    icon: '🏃',
    zone_suggestions: [
      'Athletic fields',
      'Rec center courts',
      'Campus courts',
    ],
  },
  offcampus: {
    label: 'Off-campus',
    icon: '🗺️',
    zone_suggestions: [
      'Town center area',
      'Near campus village',
      'Downtown area',
    ],
  },
}

export const CAMPUS_DOMAINS: Record<string, string> = {
  'kenyon.edu':     'Kenyon College',
  'oberlin.edu':    'Oberlin College',
  'denison.edu':    'Denison University',
  'grinnell.edu':   'Grinnell College',
  'wooster.edu':    'College of Wooster',
  'upenn.edu':      'University of Pennsylvania',
  'ohio-state.edu': 'Ohio State University',
}

export const TIME_WINDOWS = [
  '8–9am', '9–10am', '10–11am', '11am–12pm',
  '12–1pm', '1–2pm', '2–3pm', '3–4pm',
  '4–5pm', '5–6pm', '6–7pm', '7–8pm',
  '8–9pm', '9–10pm', '10–11pm',
]

export const ONBOARDING_ACTIVITIES = [
  { key: 'cafe',      label: 'Café / coffee',       icon: '☕' },
  { key: 'food',      label: 'Dining hall meals',    icon: '🍽️' },
  { key: 'gym',       label: 'Gym / workout',        icon: '🏋️' },
  { key: 'study',     label: 'Studying together',    icon: '📚' },
  { key: 'walk',      label: 'Walks / outdoor',      icon: '🚶' },
  { key: 'movie',     label: 'Movie / show',         icon: '🎬' },
  { key: 'sports',    label: 'Sports / pickup',      icon: '🏃' },
  { key: 'offcampus', label: 'Off-campus exploring', icon: '🗺️' },
]
