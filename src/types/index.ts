export interface RateLimitRecord {
	count: number;
	resetTime: number;
	firstRequest: number;
}