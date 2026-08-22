import { Component } from '@angular/core';
import { Card } from '../shared/card';

/** Placeholder for the port of `app/kyc/page.tsx`. */
@Component({
  selector: 'app-kyc',
  imports: [Card],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">KYC Review Queue</h1>
      <app-card>
        <p class="text-gray-600">This page has not been migrated yet.</p>
      </app-card>
    </div>
  `,
})
export class Kyc {}
