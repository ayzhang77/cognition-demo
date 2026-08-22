import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { MOCK_USERS, User, UserRole } from '../types/user';

const ROLE_COLORS: Record<UserRole, string> = {
  support: 'bg-green-500',
  compliance: 'bg-yellow-500',
  admin: 'bg-purple-500',
};

const ROLE_LABELS: Record<UserRole, string> = {
  support: 'Support Agent',
  compliance: 'Compliance Reviewer',
  admin: 'Admin',
};

@Component({
  selector: 'app-user-switcher',
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="isOpen.set(!isOpen())"
        class="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
      >
        <div
          class="w-10 h-10 {{ currentUser() ? roleColor(currentUser()!.role) : 'bg-gray-400' }} rounded-full flex items-center justify-center text-white font-semibold text-lg"
        >
          {{ currentUser()?.name?.charAt(0) || '?' }}
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-gray-900">{{ currentUser()?.name || 'Select User' }}</p>
          <p class="text-xs text-gray-600 capitalize font-medium">
            {{ currentUser() ? roleLabel(currentUser()!.role) : '' }}
          </p>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      @if (isOpen()) {
        <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
        <div class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div class="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <p class="text-sm font-semibold text-gray-900">Switch User</p>
            <p class="text-xs text-gray-600 mt-1">Simulate different roles and permissions</p>
          </div>
          <div class="p-2">
            @for (user of users; track user.id) {
              <button
                type="button"
                (click)="handleUserSwitch(user)"
                class="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors {{
                  isSelected(user)
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }}"
              >
                <div
                  class="w-10 h-10 {{ roleColor(user.role) }} rounded-full flex items-center justify-center text-white font-semibold text-lg"
                >
                  {{ user.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-600 capitalize font-medium">
                    {{ roleLabel(user.role) }}
                  </p>
                </div>
                @if (isSelected(user)) {
                  <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class UserSwitcher {
  private readonly authService = inject(AuthService);

  readonly users = MOCK_USERS;
  readonly currentUser = this.authService.currentUser;
  readonly isOpen = signal(false);

  roleColor(role: UserRole): string {
    return ROLE_COLORS[role];
  }

  roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }

  isSelected(user: User): boolean {
    return this.currentUser()?.id === user.id;
  }

  handleUserSwitch(user: User): void {
    this.authService.setCurrentUser(user);
    this.isOpen.set(false);
  }
}
