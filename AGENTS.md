<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fintech Operations Console - Product Context

## What This Prototype Does

This is a prototype internal operations console demonstrating core functionality shared across three existing Retool apps:

1. **KYC Review Queue** - Customer verification case management with search, filtering, and approval workflows
2. **Refunds Dashboard** - Payment refund request processing with amount validation and approval rules
3. **Feature-Flag Admin Panel** - Feature flag management with user-based targeting and environment controls

## User Roles & Permissions

### Three User Personas (Mock Users)

1. **Jordan Lee (Support Agent)**
   - Role: `support`
   - Permissions:
     - Process refunds up to $500
     - Cannot approve high-risk KYC cases
     - Cannot modify production feature flags
     - Basic KYC actions (reject, request info, escalate)

2. **Priya Shah (Compliance Reviewer)**
   - Role: `compliance`
   - Permissions:
     - Approve high-risk KYC cases
     - Limited refund permissions (same as support)
     - Cannot modify production feature flags
     - Full KYC workflow capabilities

3. **Morgan Chen (Admin)**
   - Role: `admin`
   - Permissions:
     - Unlimited refund amounts
     - Approve high-risk KYC cases
     - Modify production feature flags
     - Full system access

### Authorization Rules
- **High-Risk KYC**: Only compliance and admin roles can approve
- **Refund Limits**: Support agents limited to $500, admin unlimited
- **Production Flags**: Only admin role can modify production environment flags
- **Production Reasons**: All production changes require a reason

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS
- **State Management**: React hooks with reactive auth service
- **Testing**: Jest with React Testing Library
- **Data**: In-memory mock data (no database)

### Project Structure
```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with navigation
├── page.tsx           # Dashboard home
├── kyc/page.tsx       # KYC review queue
├── refunds/page.tsx   # Refunds dashboard
└── feature-flags/     # Feature flag admin
components/
├── shared/            # Reusable UI components
├── layout/            # Navigation and user switcher
└── modules/           # Module-specific components
services/              # Business logic and mock APIs
types/                 # TypeScript domain types
lib/                   # Utilities and auth
__tests__/             # Unit tests
```

## Running the Project

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

The application runs on `http://localhost:3000` (or next available port).
