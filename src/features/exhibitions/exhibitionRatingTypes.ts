export type RatingTotals = { average: number | null; vote_count: number };
export type RatingState = RatingTotals & { my_rating: number | null; can_rate: boolean; unavailable_reason?: string | null };
export type WorkRatingSummary = RatingTotals & { exhibition_id: string; year: number };
