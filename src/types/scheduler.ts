// Channel modes that control the overall page layout
export type ChannelMode = 'OFF_AIR' | 'NONE_MATCHDAY' | 'MATCHDAY' | 'LIVE' | 'POST_MATCHDAY' | 'NEWS' | 'PODCAST';

// Schedule item types
export type ScheduleItemType = 'NEWS' | 'LIVE' | 'PODCAST' | 'SHOW' | 'BREAK';

// Channel state from the bundle
export interface ChannelState {
  mode: ChannelMode;
}

// Current position in the schedule
export interface NowState {
  current_schedule_item_id: string | null;
  next_schedule_item_id: string | null;
  current_block_id?: string | null;
}

// News payload shape
export interface NewsPayload {
  scope: string; // "general" | "premier_league" | "championship" | etc.
}

// Podcast payload shape
export interface PodcastPayload {
  show_key: string; // e.g., "full_kit_shankers"
}

// Live payload shape
export interface LivePayload {
  fixture_ids?: number[];
}

// Schedule item (items in the daily schedule)
export interface ScheduleItem {
  schedule_item_id: string;
  schedule_item_type: ScheduleItemType;
  title?: string;
  scheduled_for_uk?: string; // ISO timestamp
  payload?: NewsPayload | PodcastPayload | LivePayload | Record<string, unknown>;
}

// Live block (SHOW_BLOCK) with fixture children
export interface LiveBlock {
  schedule_item_id: string;
  block_id?: string;
  children?: {
    fixture_ids: number[];
  };
}

// Full now_bundle structure from Redis
export interface NowBundle {
  channel_state: ChannelState;
  now: NowState;
  items: ScheduleItem[];
  blocks: LiveBlock[];
}

// Response from the get-scheduler-state edge function
export interface SchedulerData {
  mode: ChannelMode;
  bundle: NowBundle | null;
  lastUpdated: string;
  error?: string;
}

// Fixture data from Redis fixture:<id> keys
export interface FixtureData {
  fixture_id: number;
  competition_id: number;
  competition_name: string;
  kickoff_utc: string;
  timestamp: number;
  status_short: string;
  status_long: string;
  elapsed: number | null;
  home_team_name: string;
  home_team_logo: string;
  home_goals: number | null;
  away_team_name: string;
  away_team_logo: string;
  away_goals: number | null;
}
