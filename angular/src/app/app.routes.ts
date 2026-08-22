import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard';
import { FeatureFlags } from './pages/feature-flags';
import { Kyc } from './pages/kyc';
import { Refunds } from './pages/refunds';

export const routes: Routes = [
  { path: '', component: Dashboard, title: 'Operations Console' },
  { path: 'kyc', component: Kyc, title: 'KYC Review Queue' },
  { path: 'refunds', component: Refunds, title: 'Refunds Dashboard' },
  { path: 'feature-flags', component: FeatureFlags, title: 'Feature Flag Administration' },
  { path: '**', redirectTo: '' },
];
