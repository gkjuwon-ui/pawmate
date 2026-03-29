// ============================================
// PawMate - 매칭 서비스
// services/matchingService.ts
// ============================================

import { NearbyWalker, WalkMatch, Location, Pet, MatchPreferences } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class MatchingService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async getNearbyWalkers(location?: Location, radiusKm = 2): Promise<NearbyWalker[]> {
    if (!location) return [];
    const res = await fetch(`${API_BASE}/match/nearby?lat=${location.lat}&lng=${location.lng}&radius=${radiusKm}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error('Failed to fetch nearby walkers');
    return res.json();
  }

  async requestWalkMatch(targetUserId: string, preferences: MatchPreferences): Promise<WalkMatch> {
    const res = await fetch(`${API_BASE}/match/request`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ targetUserId, ...preferences }),
    });
    if (!res.ok) throw new Error('Match request failed');
    return res.json();
  }

  async acceptMatch(matchId: string): Promise<WalkMatch> {
    const res = await fetch(`${API_BASE}/match/${matchId}/accept`, {
      method: 'POST',
      headers: this.headers(),
    });
    if (!res.ok) throw new Error('Failed to accept match');
    return res.json();
  }

  async declineMatch(matchId: string): Promise<void> {
    await fetch(`${API_BASE}/match/${matchId}/decline`, {
      method: 'POST',
      headers: this.headers(),
    });
  }

  async getActiveMatches(): Promise<WalkMatch[]> {
    const res = await fetch(`${API_BASE}/match/active`, { headers: this.headers() });
    if (!res.ok) return [];
    return res.json();
  }

  async rateWalk(matchId: string, rating: number, review: string): Promise<void> {
    await fetch(`${API_BASE}/match/${matchId}/rate`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ rating, review }),
    });
  }

  async getMatchHistory(page = 1, limit = 20): Promise<{ matches: WalkMatch[]; total: number }> {
    const res = await fetch(`${API_BASE}/match/history?page=${page}&limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) return { matches: [], total: 0 };
    return res.json();
  }
}

export const matchingService = new MatchingService();
