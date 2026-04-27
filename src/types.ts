export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  fbSession?: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  plan: 'free' | 'basic' | 'pro';
  expiresAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface FBGroup {
  id: string;
  userId: string;
  fbGroupId: string;
  name: string;
  memberCount?: number;
  category?: string;
  selected?: boolean;
  lastPostAt?: any;
}

export interface Campaign {
  id: string;
  userId: string;
  text: string;
  imageUrl?: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  groupIds: string[];
  delayMin: number;
  delayMax: number;
  repeatEvery?: number;
  processedCount: number;
  totalCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface ExecutionLog {
  id: string;
  userId: string;
  campaignId?: string;
  groupId?: string;
  groupName?: string;
  status: 'success' | 'error';
  message: string;
  timestamp: any;
}
