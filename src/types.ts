export interface UserProfile {
  uid: string;
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: string;
  bio?: string;
  photoURL?: string;
  whatsappNumber: string;
  isPremium?: boolean;
  isVerified?: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Like {
  id?: string;
  fromUid: string;
  toUid: string;
  createdAt: any;
}

export interface Match {
  id?: string;
  users: string[]; // Array of two UIDs
  createdAt: any;
}

export interface Report {
  id?: string;
  reporterUid: string;
  reportedUid: string;
  reason: string;
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
