export type UserRole = 'Farmer' | 'Wild Collector' | 'KYC Admin';

export type UserVerificationStatus = 'NOT_SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  isAdmin?: boolean;
  verificationStatus?: UserVerificationStatus;
  kisanId?: string; // Aadhaar / Kisan Credit Card / Forest Harvest Permit ID
  idDocumentUrl?: string;
  landDocumentUrl?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verificationRemarks?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'KYC_SUBMITTED' | 'KYC_APPROVED' | 'KYC_REJECTED' | 'BATCH_CREATED';
  read: boolean;
  createdAt: string;
}

export type BatchStatus = 'COLLECTED';

export interface HerbBatch {
  batchId: string;
  herbName: string;
  species: string;
  collectorId: string;
  collectorName?: string;
  collectorRole?: UserRole;
  collectionDate: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  status: BatchStatus;
  createdAt: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  password?: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface CreateBatchDTO {
  herbName: string;
  species: string;
  collectorId: string;
  collectionDate: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
}

export interface EkycSubmissionDTO {
  userId: string;
  kisanId: string;
  idDocumentUrl: string;
  landDocumentUrl?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
