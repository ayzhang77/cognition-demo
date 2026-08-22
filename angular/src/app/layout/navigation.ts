import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { cn } from '../lib/utils';

interface NavItem {
  href: string;
  label: string;
}

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-gray-900">Ops Console</h1>
            </div>
            <div class="flex gap-4">
              @for (item of navItems; track item.href) {
                <a
                  [routerLink]="item.href"
                  routerLinkActive
                  #link="routerLinkActive"
                  [routerLinkActiveOptions]="{ exact: true }"
                  [class]="linkClasses(link.isActive)"
                >
                  {{ item.label }}
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class Navigation {
  readonly navItems: NavItem[] = [
    { href: '/', label: 'Dashboard' },
    { href: '/kyc', label: 'KYC Review' },
    { href: '/refunds', label: 'Refunds' },
    { href: '/feature-flags', label: 'Feature Flags' },
  ];

  linkClasses(isActive: boolean): string {
    return cn(
      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    );
  }
}
