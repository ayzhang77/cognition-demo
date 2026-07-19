export type Environment = 'development' | 'staging' | 'production';
export type FlagState = 'enabled' | 'disabled' | 'rollout';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  environment: Environment;
  state: FlagState;
  rolloutPercentage: number;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  auditHistory: FeatureFlagAuditEvent[];
}

export interface FeatureFlagAuditEvent {
  id: string;
  action: 'enabled' | 'disabled' | 'rollout_updated' | 'environment_changed';
  userId: string;
  userName: string;
  timestamp: Date;
  previousState?: {
    state?: FlagState;
    rolloutPercentage?: number;
    environment?: Environment;
  };
  newState: {
    state: FlagState;
    rolloutPercentage: number;
    environment: Environment;
  };
  reason: string;
}

export type FlagAction = 'enable' | 'disable' | 'update_rollout';
