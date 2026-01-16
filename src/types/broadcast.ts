export type MatchStatus = 'LIVE' | 'HT' | 'FT' | 'NS' | 'POSTPONED';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute?: string;
  league: string;
  startTime?: string;
}

export type AlertType = 'GOAL' | 'RED';

export interface Alert {
  id: string;
  type: AlertType;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  text: string;
  timestamp: number;
  minute: string;
}

export interface BroadcastData {
  matches: Match[];
  alerts: Alert[];
  lastUpdated: number;
}

export interface LeagueGroup {
  league: string;
  matches: Match[];
}
