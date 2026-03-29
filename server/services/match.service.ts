// ============================================
// PawMate Backend - 매칭 서비스 (비즈니스 로직)
// server/services/match.service.ts
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Location {
  lat: number;
  lng: number;
}

export class MatchService {
  /**
   * Haversine 공식으로 반경 내 산책러 검색
   * PostGIS 없이 순수 SQL로 거리 계산
   */
  async findNearbyWalkers(location: Location, radiusKm: number, excludeUserId: string) {
    const earthRadiusKm = 6371;
    
    const users = await prisma.$queryRaw`
      SELECT 
        u.id, u.name, u."profileImage", u.rating, u."isOnline", u."lastActiveAt",
        p.name as "petName", p.breed as "petBreed", p.photo as "petPhoto", p.size as "petSize",
        (${earthRadiusKm} * acos(
          cos(radians(${location.lat})) * cos(radians(u.latitude))
          * cos(radians(u.longitude) - radians(${location.lng}))
          + sin(radians(${location.lat})) * sin(radians(u.latitude))
        )) AS distance
      FROM "User" u
      LEFT JOIN "Pet" p ON p."ownerId" = u.id
      WHERE u.id != ${excludeUserId}
        AND u.latitude IS NOT NULL
        AND u.longitude IS NOT NULL
      HAVING distance < ${radiusKm}
      ORDER BY distance ASC
      LIMIT 50
    `;

    return users;
  }

  async createMatchRequest(
    requesterId: string,
    targetId: string,
    options: { meetingPoint?: Location; scheduledAt: string; duration: number; message?: string }
  ) {
    return prisma.walkMatch.create({
      data: {
        requesterId,
        targetId,
        status: 'pending',
        meetingLat: options.meetingPoint?.lat,
        meetingLng: options.meetingPoint?.lng,
        scheduledAt: new Date(options.scheduledAt),
        duration: options.duration,
        message: options.message,
      },
      include: { requester: true, target: true },
    });
  }

  async acceptMatch(matchId: string, userId: string) {
    const match = await prisma.walkMatch.findFirst({
      where: { id: matchId, targetId: userId, status: 'pending' },
    });
    if (!match) return null;

    return prisma.walkMatch.update({
      where: { id: matchId },
      data: { status: 'accepted' },
      include: { requester: true, target: true },
    });
  }

  async declineMatch(matchId: string, userId: string) {
    await prisma.walkMatch.updateMany({
      where: { id: matchId, targetId: userId, status: 'pending' },
      data: { status: 'declined' },
    });
  }

  async rateWalk(matchId: string, reviewerId: string, rating: number, review?: string) {
    const walkReview = await prisma.walkReview.create({
      data: { matchId, reviewerId, rating, review },
    });

    // 매치 완료 처리
    await prisma.walkMatch.update({
      where: { id: matchId },
      data: { status: 'completed', completedAt: new Date() },
    });

    // 유저 평균 평점 업데이트
    const match = await prisma.walkMatch.findUnique({ where: { id: matchId } });
    if (match) {
      const targetId = match.requesterId === reviewerId ? match.targetId : match.requesterId;
      const avgRating = await prisma.walkReview.aggregate({
        where: { match: { OR: [{ requesterId: targetId }, { targetId }] } },
        _avg: { rating: true },
      });
      await prisma.user.update({
        where: { id: targetId },
        data: {
          rating: avgRating._avg.rating || 5.0,
          totalWalks: { increment: 1 },
        },
      });
    }

    return walkReview;
  }

  async getActiveMatches(userId: string) {
    return prisma.walkMatch.findMany({
      where: {
        OR: [{ requesterId: userId }, { targetId: userId }],
        status: { in: ['pending', 'accepted'] },
      },
      include: { requester: true, target: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getMatchHistory(userId: string, page: number, limit: number) {
    const [matches, total] = await Promise.all([
      prisma.walkMatch.findMany({
        where: {
          OR: [{ requesterId: userId }, { targetId: userId }],
          status: 'completed',
        },
        include: { requester: true, target: true, reviews: true },
        orderBy: { completedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walkMatch.count({
        where: {
          OR: [{ requesterId: userId }, { targetId: userId }],
          status: 'completed',
        },
      }),
    ]);
    return { matches, total };
  }
}
