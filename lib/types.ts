export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  welcome_email_sent: boolean
  created_at: string
}

export interface Journey {
  id: string
  owner_id: string
  title: string
  description: string | null
  start_location: string | null
  end_location: string | null
  start_date: string | null
  end_date: string | null
  share_token: string
  created_at: string
  updated_at: string
  owner?: Profile
  stops?: Stop[]
  member_role?: 'owner' | 'admin' | 'viewer'
  post_count?: number
}

export interface Stop {
  id: string
  journey_id: string
  name: string
  lat: number
  lng: number
  order_index: number
  reached_at: string | null
  created_at: string
}

export interface JourneyMember {
  id: string
  journey_id: string
  user_id: string
  role: 'admin' | 'viewer'
  invited_by: string | null
  created_at: string
  profile?: Profile
}

export interface Post {
  id: string
  journey_id: string
  author_id: string
  stop_id: string | null
  type: 'photo' | 'blog'
  title: string | null
  content: string | null
  media_url: string | null
  custom_location_name: string | null
  custom_lat: number | null
  custom_lng: number | null
  created_at: string
  updated_at: string
  author?: Profile
  stop?: Stop
  comments?: Comment[]
  comment_count?: number
  post_likes?: { user_id: string }[]
}

export interface JourneyInvite {
  id: string
  journey_id: string
  email: string
  role: 'admin' | 'viewer'
  invited_by: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: Profile
}

export type NewStop = {
  name: string
  lat: number
  lng: number
}
