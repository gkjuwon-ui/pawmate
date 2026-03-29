// ============================================
// PawMate - 홈 스크린
// screens/HomeScreen.tsx
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { APP_SLOGAN } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { NearbyWalker, Pet } from '../types';
import { matchingService } from '../services/matchingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const [nearbyWalkers, setNearbyWalkers] = useState<NearbyWalker[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 800, useNativeDriver: true,
    }).start();
    loadNearbyWalkers();
  }, []);

  const loadNearbyWalkers = async () => {
    setRefreshing(true);
    const walkers = await matchingService.getNearbyWalkers(user?.location);
    setNearbyWalkers(walkers);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNearbyWalkers} />}
    >
      {/* Hero Section with awful slogan */}
      <LinearGradient colors={['#FF6B35', '#FF8F5E', '#FFB088']} style={styles.hero}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.heroTitle}>🐾 PawMate</Text>
          <Text style={styles.heroSlogan}>{APP_SLOGAN}</Text>
          <Text style={styles.heroSubtext}>
            {/* 이 슬로건 진짜 별로다... 마케팅부 뭐하냐 */}
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Quick Match Button */}
      <TouchableOpacity style={styles.quickMatchBtn}>
        <LinearGradient
          colors={['#FF6B35', '#E85D26']}
          style={styles.quickMatchGradient}
        >
          <Ionicons name="paw" size={28} color="#FFF" />
          <Text style={styles.quickMatchText}>지금 산책 갈 사람 찾기</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Nearby Walkers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 근처 산책러 🚶‍♂️🐕</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyWalkers.map((walker) => (
            <WalkerCard key={walker.id} walker={walker} />
          ))}
        </ScrollView>
      </View>

      {/* Today's Walk Stats */}
      <View style={styles.statsContainer}>
        <StatCard icon="footsteps" value="2,847" label="오늘 걸음수" />
        <StatCard icon="time" value="45분" label="산책 시간" />
        <StatCard icon="heart" value="3" label="새 친구" />
      </View>
    </ScrollView>
  );
}

function WalkerCard({ walker }: { walker: NearbyWalker }) {
  return (
    <TouchableOpacity style={styles.walkerCard}>
      <Image source={{ uri: walker.petPhoto }} style={styles.walkerPetImage} />
      <View style={styles.walkerInfo}>
        <Text style={styles.walkerName}>{walker.name}</Text>
        <Text style={styles.walkerPet}>
          {walker.petName} ({walker.petBreed})
        </Text>
        <Text style={styles.walkerDistance}>{walker.distance}m 거리</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: walker.isOnline ? '#22C55E' : '#94A3B8' }]} />
    </TouchableOpacity>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#FF6B35" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  hero: {
    paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  heroSlogan: { fontSize: 16, color: '#FFE4D6', fontWeight: '500', lineHeight: 24 },
  heroSubtext: { fontSize: 13, color: '#FFD4BE', marginTop: 4 },
  quickMatchBtn: { marginHorizontal: 24, marginTop: -24, borderRadius: 20, overflow: 'hidden', elevation: 8 },
  quickMatchGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 12,
  },
  quickMatchText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  walkerCard: {
    width: SCREEN_WIDTH * 0.65, backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    marginRight: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12,
  },
  walkerPetImage: { width: '100%', height: 160, borderRadius: 16, marginBottom: 12 },
  walkerInfo: { gap: 4 },
  walkerName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  walkerPet: { fontSize: 14, color: '#64748B' },
  walkerDistance: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  statusDot: { position: 'absolute', top: 20, right: 20, width: 12, height: 12, borderRadius: 6 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 32, gap: 12, marginBottom: 32 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});
