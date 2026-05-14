export type EntryType = 'anime' | 'manga' | 'manhwa';

export type EntryStatus = 
  | 'watching' 
  | 'reading' 
  | 'completed' 
  | 'plan_to_watch' 
  | 'dropped'
  | 'rewatching'
  | 'rereading'
  | 'caught_up'
  | 'plan_to_read';


export type Priority = 'high' | 'medium' | 'low';

export interface Entry {
  id: string;
  title: string;
  type: EntryType;
  status: EntryStatus;
  cover_art?: string;
  genres?: string[];
  current_progress: number;
  total_progress?: number;
  priority?: Priority;
  source?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  rewatch_count: number;
  description?: string;
  season?: string;
  duration?: number;
  format?: string;
}

export interface SearchResult {
  title: string;
  cover_art: string;
  total_progress?: number;
  genres: string[];
  type: EntryType;
}
 