// ============================================
// PawMate - 타입 정의
// types/index.ts
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  location: Location;
  neighborhood: string;
  pets: Pet[];
  walkPreferences: WalkPreferences;
  rating: number;
  totalWalks: number;
  joinedAt: string;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  species: 'dog' | 'cat' | 'other';
  age: number;
  weight: number;
  size: 'small' | 'medium' | 'large';
  temperament: 'calm' | 'energetic' | 'shy' | 'friendly' | 'aggressive';
  photo: string;
  vaccinated: boolean;
  neutered: boolean;
  description: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface NearbyWalker {
  id: string;
  name: string;
  profileImage: string;
  petName: string;
  petBreed: string;
  petPhoto: string;
  petSize: Pet['size'];
  distance: number;
  isOnline: boolean;
  rating: number;
  lastActive: string;
}

export interface WalkMatch {
  id: string;
  requesterId: string;
  targetId: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  meetingPoint: Location;
  scheduledAt: string;
  duration: number;
  route?: WalkRoute;
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface WalkRoute {
  id: string;
  name: string;
  distance: number;
  estimatedDuration: number;
  waypoints: Location[];
  parks: NearbyPlace[];
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: 'park' | 'vet' | 'petshop' | 'cafe';
  location: Location;
  rating: number;
  distance: number;
}

export interface WalkPreferences {
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredDuration: number;
  maxDistance: number;
  petSizePreference: Pet['size'][];
}

export interface MatchPreferences {
  meetingPoint?: Location;
  scheduledAt: string;
  duration: number;
  message?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'system';
  createdAt: string;
  readAt?: string;
}
