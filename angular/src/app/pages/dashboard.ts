import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from '../shared/card';

interface DashboardStat {
  title: string;
  value: string;
  href: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Card],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Operations Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        @for (stat of stats; track stat.title) {
          <a [routerLink]="stat.href">
            <app-card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">{{ stat.title }}</p>
                  <p class="text-3xl font-bold text-gray-900 mt-2">{{ stat.value }}</p>
                </div>
                <div
                  class="w-12 h-12 {{ stat.color }} rounded-lg flex items-center justify-center text-white"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </app-card>
          </a>
        }
      </div>

      <app-card className="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a routerLink="/kyc">
            <button
              type="button"
              class="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <p class="font-medium">Review KYC Cases</p>
              <p class="text-sm text-blue-600">Process pending verifications</p>
            </button>
          </a>
          <a routerLink="/refunds">
            <button
              type="button"
              class="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <p class="font-medium">Process Refunds</p>
              <p class="text-sm text-green-600">Handle refund requests</p>
            </button>
          </a>
          <a routerLink="/feature-flags">
            <button
              type="button"
              class="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <p class="font-medium">Manage Feature Flags</p>
              <p class="text-sm text-purple-600">Configure feature rollouts</p>
            </button>
          </a>
        </div>
      </app-card>

      <app-card>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Environment</span>
            <span class="font-medium">Development</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Version</span>
            <span class="font-medium">1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Status</span>
            <span class="font-medium text-green-600">Operational</span>
          </div>
        </div>
      </app-card>
    </div>
  `,
})
export class Dashboard {
  readonly stats: DashboardStat[] = [
    { title: 'KYC Cases', value: '5', href: '/kyc', color: 'bg-blue-500' },
    { title: 'Refund Requests', value: '6', href: '/refunds', color: 'bg-green-500' },
    { title: 'Feature Flags', value: '5', href: '/feature-flags', color: 'bg-purple-500' },
  ];
}
