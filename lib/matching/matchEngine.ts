import { getDatabase } from '../db/mongodb';
import { TechnicianDoc, ServiceCategory, UrgencyLevel } from '../types';

export interface MatchedTechnician {
  id: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  experienceYears: number;
  serviceArea: string;
  distanceKm: number;
  estimatedArrival: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  availability: string;
  emergencyAvailable: boolean;
  score: number;
  bio: string;
  skills: string[];
}

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function matchTechnicians(params: {
  category: ServiceCategory;
  coordinates?: [number, number]; // [lng, lat]
  urgency: UrgencyLevel;
  limit?: number;
}): Promise<MatchedTechnician[]> {
  const { category, coordinates, urgency, limit = 5 } = params;
  const db = await getDatabase();

  // ONLY VERIFIED technicians
  const query: any = {
    verificationStatus: 'VERIFIED',
    services: category,
  };

  const rawTechnicians = (await db
    .collection<TechnicianDoc>('technicians')
    .find(query)
    .toArray()) as TechnicianDoc[];

  if (rawTechnicians.length === 0) {
    return [];
  }

  // Customer center fallback: Gulberg, Lahore
  const custLng = coordinates && coordinates.length === 2 ? coordinates[0] : 74.3436;
  const custLat = coordinates && coordinates.length === 2 ? coordinates[1] : 31.5204;

  const scoredList: MatchedTechnician[] = rawTechnicians.map((tech) => {
    const techLng = tech.location?.coordinates?.[0] ?? 74.3436;
    const techLat = tech.location?.coordinates?.[1] ?? 31.5204;
    const distanceKm = calculateDistanceKm(custLng, custLat, techLng, techLat);

    // Score calculation
    let score = 40; // Base service match

    // Availability score
    if (tech.availability === 'AVAILABLE_NOW') {
      score += 25;
    } else if (tech.availability === 'AVAILABLE_LATER') {
      score += 12;
    } else {
      score += 0;
    }

    // Distance score: closer = higher score (max 20 points)
    const distanceScore = Math.max(0, 20 - distanceKm * 1.5);
    score += distanceScore;

    // Rating score (max 15 points: 5 stars * 3)
    score += (tech.rating || 4.5) * 3;

    // Experience score (max 10 points)
    score += Math.min(tech.experienceYears || 2, 10);

    // Emergency boost
    if (urgency === 'EMERGENCY') {
      if (tech.emergencyAvailable && tech.availability === 'AVAILABLE_NOW') {
        score += 30; // Strong priority for instant emergency dispatch
      } else if (!tech.emergencyAvailable) {
        score -= 20;
      }
    }

    // Estimate arrival time based on distance & availability
    let estimatedArrival = 'Within 45–60 mins';
    if (tech.availability === 'AVAILABLE_NOW') {
      if (distanceKm <= 3) estimatedArrival = '15–25 mins';
      else if (distanceKm <= 7) estimatedArrival = '25–40 mins';
      else estimatedArrival = '40–60 mins';
    } else {
      estimatedArrival = 'Scheduled (Today, in 2-3 hours)';
    }

    return {
      id: tech._id!.toString(),
      name: tech.name,
      phone: tech.phone,
      profilePhoto: tech.profilePhoto,
      rating: tech.rating || 5.0,
      reviewCount: tech.reviewCount || 0,
      completedJobs: tech.completedJobs || 0,
      experienceYears: tech.experienceYears || 3,
      serviceArea: tech.serviceArea || 'Lahore',
      distanceKm,
      estimatedArrival,
      estimatedPriceMin: tech.priceEstimateMin || 1500,
      estimatedPriceMax: tech.priceEstimateMax || 3000,
      availability: tech.availability,
      emergencyAvailable: !!tech.emergencyAvailable,
      score: Math.round(score),
      bio: tech.bio || 'Verified professional technician.',
      skills: tech.skills || [],
    };
  });

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  // Return between 3 and 5 technicians if available
  return scoredList.slice(0, Math.max(3, Math.min(scoredList.length, limit)));
}
