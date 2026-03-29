// ============================================
// PawMate Backend - 매칭 API
// server/routes/match.routes.ts
// ============================================

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { MatchService } from '../services/match.service';
import { NotificationService } from '../services/notification.service';

const router = Router();
const matchService = new MatchService();
const notificationService = new NotificationService();

// 근처 산책러 조회 (반경 기반)
router.get('/nearby', authMiddleware, async (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Location required' });

  const walkers = await matchService.findNearbyWalkers(
    { lat: Number(lat), lng: Number(lng) },
    Number(radius) || 2,
    req.userId!
  );
  res.json(walkers);
});

// 산책 매칭 요청
router.post('/request', authMiddleware, async (req: Request, res: Response) => {
  const { targetUserId, meetingPoint, scheduledAt, duration, message } = req.body;
  if (!targetUserId || !scheduledAt) {
    return res.status(400).json({ error: 'targetUserId and scheduledAt required' });
  }

  const match = await matchService.createMatchRequest(
    req.userId!, targetUserId,
    { meetingPoint, scheduledAt, duration: duration || 30, message }
  );

  await notificationService.sendPushNotification(targetUserId, {
    title: '🐾 새 산책 요청!',
    body: `${req.userName}님이 산책을 함께 하고 싶어합니다`,
    data: { matchId: match.id, type: 'walk_request' },
  });

  res.status(201).json(match);
});

// 매칭 수락
router.post('/:matchId/accept', authMiddleware, async (req: Request, res: Response) => {
  const match = await matchService.acceptMatch(req.params.matchId, req.userId!);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  await notificationService.sendPushNotification(match.requesterId, {
    title: '🎉 매칭 성사!',
    body: '산책 매칭이 수락되었습니다. 채팅에서 약속을 잡아보세요!',
    data: { matchId: match.id, type: 'match_accepted' },
  });

  res.json(match);
});

// 매칭 거절
router.post('/:matchId/decline', authMiddleware, async (req: Request, res: Response) => {
  await matchService.declineMatch(req.params.matchId, req.userId!);
  res.json({ success: true });
});

// 산책 완료 후 평점
router.post('/:matchId/rate', authMiddleware, async (req: Request, res: Response) => {
  const { rating, review } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating 1-5 required' });
  }

  const match = await matchService.rateWalk(req.params.matchId, req.userId!, rating, review);
  res.json(match);
});

// 활성 매칭 목록
router.get('/active', authMiddleware, async (req: Request, res: Response) => {
  const matches = await matchService.getActiveMatches(req.userId!);
  res.json(matches);
});

// 매칭 히스토리
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const result = await matchService.getMatchHistory(req.userId!, page, limit);
  res.json(result);
});

export default router;
