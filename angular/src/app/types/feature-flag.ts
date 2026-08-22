export type Environment = 'development' | 'staging' | 'production';
export type FlagState = 'enabled' | 'disabled' | 'user_targeted';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  state: FlagState;
  enabledUserIds: string[]; // Array of user IDs who have the flag enabled
  lastModifiedBy: string;
  lastModifiedAt: Date;
  auditHistory: FeatureFlagAuditEvent[];
}

export interface FeatureFlagAuditEvent {
  id: string;
  action: 'enabled' | 'disabled' | 'user_targeting_updated' | 'environment_changed';
  userId: string;
  userName: string;
  timestamp: Date;
  previousState?: {
    state?: FlagState;
    enabledUserIds?: string[];
    environment?: Environment;
  };
  newState: {
    state: FlagState;
    enabledUserIds: string[];
    environment: Environment;
  };
  reason: string;
}

export type FlagAction = 'enable' | 'disable' | 'update_user_targeting';
