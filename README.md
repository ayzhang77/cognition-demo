# Fintech Operations Console Prototype

A prototype demonstrating an internal operations console built to evaluate whether a Series C fintech company could replace Retool with a lightweight, internally owned solution.

## What This Prototype Does

This is a focused internal web application that demonstrates the core functionality shared across three existing Retool apps:

1. **KYC Review Queue** - Customer verification case management with search, filtering, and approval workflows
2. **Refunds Dashboard** - Payment refund request processing with amount validation and approval rules
3. **Feature-Flag Admin Panel** - Feature flag management with user-based targeting and environment controls

The prototype demonstrates shared platform capabilities including:

- Mock authentication with user role switching
- Role-based access control (RBAC)
- Reusable UI components (tables, filters, modals, audit logs)
- Consistent navigation and design
- Audit events for all sensitive mutations
- Confirmation dialogs for high-impact actions
- Loading, success, empty, and error states
- Clean separation between UI and mock backend services

## How to Install and Run

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`

### User Personas

The prototype includes three mock users that can be switched via the user switcher in the top-right corner:

- **Jordan Lee (Support Agent)** - Can process refunds up to $500, cannot approve high-risk KYC cases, cannot modify production flags
- **Priya Shah (Compliance Reviewer)** - Can approve high-risk KYC cases, limited refund permissions, cannot modify production flags
- **Morgan Chen (Admin)** - Full permissions including unlimited refunds, production flag changes, and all KYC actions
