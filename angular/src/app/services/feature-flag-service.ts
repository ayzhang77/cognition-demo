import { Injectable } from '@angular/core';
import { FeatureFlag, FlagAction, FeatureFlagAuditEvent, Environment } from '../types/feature-flag';
import { MOCK_FEATURE_FLAGS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
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
      enabledUserIds?: string[];
      environment?: Environment;
    }
  ): Promise<FeatureFlag> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const flag = this.flags.find(f => f.id === flagId);
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    const previousState = {
      state: flag.state,
      enabledUserIds: [...flag.enabledUserIds],
      environment: flag.environment
    };

    let auditAction: FeatureFlagAuditEvent['action'];

    switch (action) {
      case 'enable':
        flag.state = 'enabled';
        flag.enabledUserIds = ['1', '2', '3']; // Enable for all users
        auditAction = 'enabled';
        break;
      case 'disable':
        flag.state = 'disabled';
        flag.enabledUserIds = [];
        auditAction = 'disabled';
        break;
      case 'update_user_targeting':
        flag.state = 'user_targeted';
        flag.enabledUserIds = params?.enabledUserIds || flag.enabledUserIds;
        auditAction = 'user_targeting_updated';
        break;
    }

    if (params?.environment) {
      flag.environment = params.environment;
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
        enabledUserIds: flag.enabledUserIds,
        environment: flag.environment
      },
      reason
    };

    flag.auditHistory.push(auditEvent);

    return flag;
  }

  isFlagEnabledForUser(flag: FeatureFlag, userId: string): boolean {
    if (flag.state === 'disabled') return false;
    if (flag.state === 'enabled') return true;
    if (flag.state === 'user_targeted') return flag.enabledUserIds.includes(userId);
    return false;
  }
}
