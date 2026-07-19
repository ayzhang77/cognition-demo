<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Fintech Operations Console - Product Context

## Product Overview

This is a prototype internal operations console built to evaluate whether a Series C fintech company could replace Retool with a lightweight, internally owned solution. The prototype demonstrates core functionality shared across three existing Retool apps used by operations teams.

**Primary Goal**: Demonstrate that core Retool functionality can be replicated with better alignment to fintech security requirements and long-term maintainability.

**Target Users**: Operations teams including support agents, compliance reviewers, and administrators.

**Key Differentiator**: Strong engineering capabilities, strict security/compliance requirements, need for custom business logic.

## Architecture Context

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS
- **State Management**: React hooks with reactive auth service
- **Testing**: Jest with React Testing Library
- **Data**: In-memory mock data (no database)

### Architecture Pattern
- **Service Layer Pattern**: Business logic encapsulated in service classes (KYCService, RefundService, FeatureFlagService)
- **Clean Separation**: UI components, domain types, services, and authorization layers are separate
- **Mock API Boundaries**: Services simulate backend API calls with delays and error handling
- **Reactive Auth**: Centralized auth service with subscription pattern for real-time user updates

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

## User Roles & Permissions

### Three User Personas (Mock Users)

1. **Jordan Lee (Support Agent)**
   - Role: `support`
   - Color: Green
   - Permissions:
     - Process refunds up to $500
     - Cannot approve high-risk KYC cases
     - Cannot modify production feature flags
     - Basic KYC actions (reject, request info, escalate)

2. **Priya Shah (Compliance Reviewer)**
   - Role: `compliance`
   - Color: Yellow
   - Permissions:
     - Approve high-risk KYC cases
     - Limited refund permissions (same as support)
     - Cannot modify production feature flags
     - Full KYC workflow capabilities

3. **Morgan Chen (Admin)**
   - Role: `admin`
   - Color: Purple
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

## Component Context

### 1. KYC Review Queue (`app/kyc/page.tsx`)

**Purpose**: Customer verification case management for fintech compliance.

**Key Features**:
- Search by customer name, email, or case ID
- Filter by status, risk level, and review reason
- Sort by submission time and risk level
- Case detail view with customer identity information
- Mock verification checks (document authenticity, biometric match, etc.)
- Actions: approve, reject, request more information, escalate
- Required reason/note for every decision
- Complete audit history

**Business Rules**:
- High-risk cases cannot be approved by support agents
- High-risk cases must be escalated or handled by compliance/admin
- All actions require reviewer notes
- Status workflow: pending → approved/rejected/escalated/info_requested

**Data Model** (`types/kyc.ts`):
- `KYCCase`: Main case entity with customer info, verification checks, audit history
- `KYCStatus`: pending, approved, rejected, escalated, info_requested
- `RiskLevel`: low, medium, high
- `ReviewReason`: document_mismatch, suspicious_activity, incomplete_info, high_risk_country, age_verification

**Service**: `services/kyc-service.ts`
- `getCases(filters)`: Retrieve and filter KYC cases
- `getCaseById(id)`: Get single case details
- `performAction(caseId, action, userId, userName, notes)`: Execute case actions
- `canApproveHighRisk(userRole)`: Authorization check

### 2. Refunds Dashboard (`app/refunds/page.tsx`)

**Purpose**: Payment refund request processing with financial controls.

**Key Features**:
- Search by customer, payment ID, or transaction ID
- Filter by refund status, amount range, and risk level
- Payment and customer details view
- Prior refund history
- Full and partial refund actions
- Validation: cannot refund more than remaining refundable amount
- Confirmation modal before submission
- Required refund reason
- Simulated success/failure responses
- Complete audit history

**Business Rules**:
- Support agents may refund up to $500
- Finance admins (admin role) may refund any amount
- Refunds above $500 must be escalated when performed by support agents
- Cannot refund more than remaining refundable amount
- All refund requests require a reason

**Data Model** (`types/refund.ts`):
- `Payment`: Original payment with refund history and refundable amount
- `Refund`: Refund request with status, risk assessment, audit history
- `RefundStatus`: pending, approved, rejected, processed, failed
- `RefundRisk`: low, medium, high (calculated based on amount and history)

**Service**: `services/refund-service.ts`
- `getPayments(filters)`: Retrieve and filter payments
- `getPaymentById(id)`: Get single payment details
- `requestRefund(paymentId, amount, userId, userName, reason)`: Create refund request
- `processRefundAction(refundId, action, userId, userName, reason)`: Approve/reject refunds
- `canRefundAmount(userRole, amount)`: Authorization check

### 3. Feature-Flag Admin Panel (`app/feature-flags/page.tsx`)

**Purpose**: Feature flag management with environment controls and compliance.

**Key Features**:
- Filter by environment and state
- Flag name, description, environment, current state
- Rollout percentage control
- Last modified by and timestamp
- Enable/disable flags
- Adjust rollout percentage
- Choose environment (development, staging, production)
- Add change reason
- Confirmation modal before changes
- View resulting audit event

**Business Rules**:
- Production changes require admin role
- Every production change requires a reason
- Clear distinction between development, staging, and production
- Rollout percentage: 0-100%
- State transitions: enabled ↔ disabled ↔ rollout

**Data Model** (`types/feature-flag.ts`):
- `FeatureFlag`: Flag entity with state, rollout, environment, audit history
- `Environment`: development, staging, production
- `FlagState`: enabled, disabled, rollout
- `FeatureFlagAuditEvent`: Change history with previous/new state comparison

**Service**: `services/feature-flag-service.ts`
- `getFlags(filters)`: Retrieve and filter feature flags
- `getFlagById(id)`: Get single flag details
- `performAction(flagId, action, userId, userName, reason, params)`: Execute flag changes
- `canModifyProduction(userRole)`: Authorization check

## Shared Components Context

### UI Components (`components/shared/`)
- **Button**: Primary, secondary, danger, ghost variants with size options
- **Modal**: Confirmation dialogs with customizable footer
- **Table**: Reusable data table with column rendering and row clicks
- **Card**: Consistent card container with shadows and borders
- **StatusBadge**: Standardized status display with color coding
- **AuditLog**: Audit history display with event details

### Layout Components (`components/layout/`)
- **Navigation**: Top navigation with active state highlighting
- **UserSwitcher**: Role switching demo with color-coded avatars and role labels

## Important Implementation Details

### Auth Service Pattern
The auth service (`lib/auth.ts`) uses a subscription pattern:
- Components subscribe to user changes: `authService.subscribe(callback)`
- This enables real-time role switching without page reload
- All permission checks use current user state via `authService.getCurrentUser()`

### Mock Service Pattern
All services simulate backend API calls:
- Artificial delays (300-500ms) to simulate network latency
- In-memory data storage (no database)
- Clear interfaces where real backend integration would occur
- Error handling and validation logic

### Visual Design Guidelines
- **Background**: Light gray (#f8fafc) for professional appearance
- **Text**: Dark gray (#0f172a) for high contrast
- **Primary Color**: Blue-600 for actions and active states
- **Role Colors**: Green (support), Yellow (compliance), Purple (admin)
- **Cards**: White with shadows and gray borders
- **Status Colors**: Red (high severity), Yellow (pending), Green (success), Blue (info)

### Testing Context
- Unit tests for authorization rules (`__tests__/auth.test.ts`)
- Unit tests for refund validation (`__tests__/refund-validation.test.ts`)
- Focus on business logic and authorization correctness
- Mock service responses for isolated testing

## Development Guidelines

### When Adding New Features
1. Define TypeScript types in `types/` directory
2. Implement business logic in appropriate service class
3. Add authorization checks in service layer
4. Create/reuse UI components from `components/shared/`
5. Update auth service if new roles or permissions needed
6. Add tests for authorization and validation logic
7. Update this AGENTS.md with new context

### When Modifying Existing Features
1. Check service layer for business logic changes
2. Verify authorization rules still apply
3. Update type definitions if data model changes
4. Test with all three user personas
5. Ensure audit trail is maintained for sensitive actions

### Security Considerations
- All sensitive actions require audit logging
- Authorization checks should be in service layer, not just UI
- Financial operations require confirmation dialogs
- Production changes require additional safeguards
- User role changes should reflect immediately in UI

### Common Patterns
- **Async Operations**: Always use try/catch with setError for user feedback
- **Loading States**: Show loading indicators during data fetch
- **Empty States**: Display appropriate messages when no data
- **Error Handling**: Provide clear error messages to users
- **Confirmation**: Use Modal component for destructive actions
- **Authorization**: Check permissions before enabling actions

## What This Prototype Does NOT Include

### Intentionally Omitted (Out of Scope)
- Real-time updates (websockets)
- Advanced analytics dashboards
- File upload capabilities
- Bulk operations
- Export functionality
- Email notifications
- Workflow automation

### Production Requirements (Not Implemented)
- Real SSO integration
- Database persistence
- Real API integrations
- Production security features
- Monitoring and observability
- Disaster recovery procedures

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

## Key Files for Reference

- `lib/auth.ts` - Authorization and user management
- `services/kyc-service.ts` - KYC business logic
- `services/refund-service.ts` - Refund validation and processing
- `services/feature-flag-service.ts` - Feature flag management
- `types/` - All domain type definitions
- `components/shared/` - Reusable UI components
- `README.md` - Comprehensive project documentation
