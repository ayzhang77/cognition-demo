import { FeatureFlag, FlagAction, FeatureFlagAuditEvent, Environment } from '../types/feature-flag';
import { MOCK_FEATURE_FLAGS } from './mock-data';

class FeatureFlagService {
  private flags: FeatureFlag[] = [...MOCK_FEATURE_FLAGS];

  async getFlags(filters?: {
    environment?: string;
    state?: string;
  }): Promise<FeatureFlag[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.flags;

    if (filters?.environment) {
      filtered = filtered.filter(f => f.environment === filters.environment);
    }

    if (filters?.state) {
      filtered = filtered.filter(f => f.state === filters.state);
    }

    return filtered.sort((a, b) => b.lastModifiedAt.getTime() - a.lastModifiedAt.getTime());
  }

  async getFlagById(id: string): Promise<FeatureFlag | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.flags.find(f => f.id === id) || null;
  }

  async performAction(
    flagId: string,
    action: FlagAction,
    userId: string,
    userName: string,
    reason: string,
    params?: {
      rolloutPercentage?: number;
      environment?: string;
    }
  ): Promise<FeatureFlag> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const flag = this.flags.find(f => f.id === flagId);
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    const previousState = {
      state: flag.state,
      rolloutPercentage: flag.rolloutPercentage,
      environment: flag.environment
    };

    let auditAction: FeatureFlagAuditEvent['action'];

    switch (action) {
      case 'enable':
        flag.state = 'enabled';
        flag.rolloutPercentage = 100;
        auditAction = 'enabled';
        break;
      case 'disable':
        flag.state = 'disabled';
        flag.rolloutPercentage = 0;
        auditAction = 'disabled';
        break;
      case 'update_rollout':
        flag.state = 'rollout';
        flag.rolloutPercentage = params?.rolloutPercentage || flag.rolloutPercentage;
        auditAction = 'rollout_updated';
        break;
    }

    if (params?.environment) {
      flag.environment = params.environment as Environment;
      auditAction = 'environment_changed';
    }

    flag.lastModifiedBy = userId;
    flag.lastModifiedAt = new Date();

    const auditEvent: FeatureFlagAuditEvent = {
      id: `AUDIT-${Date.now()}`,
      action: auditAction,
      userId,
      userName,
      timestamp: new Date(),
      previousState,
      newState: {
        state: flag.state,
        rolloutPercentage: flag.rolloutPercentage,
        environment: flag.environment
      },
      reason
    };

    flag.auditHistory.push(auditEvent);

    return flag;
  }

  canModifyProduction(userRole: string): boolean {
    return userRole === 'admin';
  }
}

export const featureFlagService = new FeatureFlagService();
