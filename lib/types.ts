import { ObjectId } from 'mongodb';

export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export type ServiceCategory = 'plumbing' | 'electrical' | 'ac_repair';

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type AvailabilityStatus = 'AVAILABLE_NOW' | 'AVAILABLE_LATER' | 'BUSY' | 'OFFLINE';

export type UrgencyLevel = 'NORMAL' | 'EMERGENCY';

export type BookingStatus =
  | 'REQUESTED'
  | 'TECHNICIAN_SELECTED'
  | 'AWAITING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'INSPECTION'
  | 'PRICE_PENDING'
  | 'PRICE_APPROVED'
  | 'PRICE_REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentMethod = 'CASH' | 'DIGITAL';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  profileImage?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export interface TechnicianDoc {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  services: ServiceCategory[];
  skills: string[];
  experienceYears: number;
  cnic: string;
  certifications?: string[];
  verificationStatus: VerificationStatus;
  verificationDocuments?: {
    cnicFront?: string;
    cnicBack?: string;
    certificate?: string;
    adminNotes?: string;
  };
  rating: number;
  reviewCount: number;
  completedJobs: number;
  serviceArea: string; // e.g. "Gulberg, Lahore", "DHA & Cantt", "Johar Town"
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address: string;
  };
  availability: AvailabilityStatus;
  emergencyAvailable: boolean;
  priceEstimateMin: number;
  priceEstimateMax: number;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequestDoc {
  _id?: ObjectId;
  customerId: ObjectId;
  customerName: string;
  customerPhone: string;
  serviceCategory: ServiceCategory;
  problemType: string;
  description: string;
  images?: string[];
  location: {
    address: string;
    area: string;
    city: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  urgency: UrgencyLevel;
  aiAnalysis?: {
    suggestedCategory: string;
    possibleIssue: string;
    suggestedNextStep: string;
    professionalRecommended: boolean;
    urgencySuggestion: UrgencyLevel;
    disclaimer: string;
    safetyWarning?: string;
  };
  status: 'PENDING' | 'MATCHED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDoc {
  _id?: ObjectId;
  bookingCode: string;
  customerId: ObjectId;
  customerName: string;
  customerPhone: string;
  technicianId: ObjectId;
  technicianName: string;
  technicianPhone: string;
  serviceRequestId: ObjectId;
  serviceCategory: ServiceCategory;
  problemType: string;
  description: string;
  urgency: UrgencyLevel;
  address: string;
  status: BookingStatus;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  finalPrice?: number;
  commissionRate: number; // e.g. 0.15
  commissionAmount?: number;
  technicianAmount?: number;
  scheduledAt?: Date;
  acceptedAt?: Date;
  arrivedAt?: Date;
  inspectionAt?: Date;
  priceSubmittedAt?: Date;
  priceApprovedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  paidAt?: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDoc {
  _id?: ObjectId;
  bookingId: ObjectId;
  customerId: ObjectId;
  customerName: string;
  technicianId: ObjectId;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

export interface DisputeDoc {
  _id?: ObjectId;
  bookingId: ObjectId;
  bookingCode: string;
  raisedById: ObjectId;
  raisedByName: string;
  raisedByRole: UserRole;
  category: 'POOR_SERVICE' | 'PRICE_DISAGREEMENT' | 'INCOMPLETE_REPAIR' | 'PROPERTY_DAMAGE' | 'BEHAVIOR' | 'OTHER';
  description: string;
  evidenceUrls?: string[];
  status: DisputeStatus;
  adminResolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDoc {
  _id?: ObjectId;
  userId: ObjectId;
  role: UserRole;
  title: string;
  message: string;
  type: 'BOOKING_UPDATE' | 'PRICE_QUOTE' | 'VERIFICATION_UPDATE' | 'DISPUTE_UPDATE' | 'PAYMENT' | 'SYSTEM';
  link?: string;
  read: boolean;
  createdAt: Date;
}

export interface AdminSettingsDoc {
  _id?: ObjectId;
  commissionRate: number; // e.g. 0.15 (15%)
  launchCity: string; // "Lahore"
  emergencyFeeMultiplier: number;
  supportedCategories: string[];
  contactPhone: string;
  contactEmail: string;
  updatedAt: Date;
  auditLogs?: Array<{
    adminId: string;
    action: string;
    targetId?: string;
    details: string;
    timestamp: Date;
  }>;
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AiConversationDoc {
  _id?: ObjectId;
  userId: ObjectId;
  messages: AiChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
