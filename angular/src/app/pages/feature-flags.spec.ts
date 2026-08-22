import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFlags } from './feature-flags';
import { AuthService } from '../services/auth-service';
import { FeatureFlagService } from '../services/feature-flag-service';
import { FeatureFlag } from '../types/feature-flag';
import { MOCK_USERS } from '../types/user';

function productionFlag(): FeatureFlag {
  return {
    id: 'FLAG-TEST',
    name: 'test_flag',
    description: 'Test flag',
    environment: 'production',
    state: 'disabled',
    enabledUserIds: [],
    lastModifiedBy: '1',
    lastModifiedAt: new Date('2024-01-01T00:00:00Z'),
    auditHistory: [],
  };
}

describe('FeatureFlags', () => {
  let fixture: ComponentFixture<FeatureFlags>;
  let component: FeatureFlags;
  let performAction: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FeatureFlags] }).compileComponents();

    // Spied so the shared root-provided service's flag list is never mutated by tests.
    performAction = spyOn(TestBed.inject(FeatureFlagService), 'performAction').and.resolveTo(
      productionFlag()
    );
    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[0]); // Support
    fixture = TestBed.createComponent(FeatureFlags);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads flags from the service', async () => {
    const flags = await TestBed.inject(FeatureFlagService).getFlags();
    expect(component.flags.length).toBe(flags.length);
  });

  it('rejects production changes for non-admins', async () => {
    component.selectedFlag = productionFlag();
    component.editModal = {
      isOpen: true,
      action: 'enable',
      enabledUserIds: [],
      environment: 'production',
      reason: 'Rollout',
    };

    await component.handleFlagAction();

    expect(component.error).toBe('Production changes require Admin role');
    expect(performAction).not.toHaveBeenCalled();
  });

  it('requires a reason for production changes', async () => {
    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[2]); // Admin
    component.selectedFlag = productionFlag();
    component.editModal = {
      isOpen: true,
      action: 'enable',
      enabledUserIds: [],
      environment: 'production',
      reason: '  ',
    };

    await component.handleFlagAction();

    expect(component.error).toBe('Production changes require a reason');
    expect(performAction).not.toHaveBeenCalled();
  });

  it('performs the action and resets the edit modal', async () => {
    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[2]); // Admin
    component.selectedFlag = productionFlag();
    component.editModal = {
      isOpen: true,
      action: 'update_user_targeting',
      enabledUserIds: ['1'],
      environment: 'production',
      reason: 'Gradual rollout',
    };

    await component.handleFlagAction();

    expect(performAction).toHaveBeenCalledWith(
      'FLAG-TEST',
      'update_user_targeting',
      MOCK_USERS[2].id,
      MOCK_USERS[2].name,
      'Gradual rollout',
      { enabledUserIds: ['1'], environment: 'production' }
    );
    expect(component.editModal).toEqual({
      isOpen: false,
      action: 'enable',
      enabledUserIds: [],
      environment: 'development',
      reason: '',
    });
    expect(component.selectedFlag).toBeNull();
    expect(component.error).toBeNull();
  });

  it('disables production actions and shows the unauthorized state for non-admins', () => {
    component.selectedFlag = productionFlag();
    expect(component.selectedFlagProductionBlocked).toBe(true);

    component.openEditModal('enable');
    expect(component.editProductionBlocked).toBe(true);
    expect(component.editModalTitle).toBe('Enable Flag');
    expect(component.reasonPlaceholder).toBe('Required for production changes...');

    TestBed.inject(AuthService).setCurrentUser(MOCK_USERS[2]); // Admin
    expect(component.selectedFlagProductionBlocked).toBe(false);
    expect(component.editProductionBlocked).toBe(false);
  });

  it('labels enabled users based on flag state', () => {
    const flag = productionFlag();
    expect(component.enabledUsersLabel([], flag)).toBe('None');
    expect(component.enabledUsersLabel([], { ...flag, state: 'enabled' })).toBe('All Users');
    expect(
      component.enabledUsersLabel(['1', '2'], { ...flag, state: 'user_targeted' })
    ).toBe('Jordan Lee, Priya Shah');
  });

  it('toggles targeted users', () => {
    component.openEditModal('update_user_targeting');
    component.selectedFlag = productionFlag();
    component.toggleUser('2', true);
    expect(component.editModal.enabledUserIds).toEqual(['2']);
    component.toggleUser('2', false);
    expect(component.editModal.enabledUserIds).toEqual([]);
  });
});
