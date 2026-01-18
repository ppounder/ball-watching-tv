export type ChannelMode = 'OFF_AIR' | 'NONE_MATCHDAY' | 'MATCHDAY' | 'LIVE' | 'POST_MATCHDAY';

export interface ChannelState {
  mode: ChannelMode;
}

export interface NowBundle {
  channel_state: ChannelState;
  // Add other fields from the bundle as needed
}

export interface SchedulerData {
  mode: ChannelMode;
  lastUpdated: string;
}
