export interface HistoryItem {
  id: string;
  count: number;
  date: string;
  target?: number;
}

export interface QuoteResponse {
  text: string;
  source?: string;
}
