# Specification

## Summary
**Goal:** Wire up the full backend for CyberShield with stable data storage, role-based access control, case CRUD, and incident report management in a single Motoko actor.

**Planned changes:**
- Define stable storage for `UserProfile`, `Case`, and `IncidentReport` data types with all required fields, using stable var arrays or HashMap with stable backup for upgrade safety
- Implement role-based user registry: `registerUser()` (first user gets `#admin`, subsequent users get `#analyst`), `setUserRole()` (admin only), `getMyProfile()`, and `getAllUsers()` (admin only)
- Implement full case CRUD: `createCase()`, `getAllCases()`, `getCaseById()`, `updateCaseStatus()`, `addNoteToCase()`, `assignCase()` (admin only), and `deleteCase()` (admin only), with role verification on all mutating functions
- Implement incident report management: `submitIncidentReport()` (auto-creates a linked case and returns both `incidentId` and `linkedCaseId`), `getAllIncidentReports()`, and `getIncidentReportById()`

**User-visible outcome:** The backend fully supports persistent case and incident report management with role-based access control, enabling the existing frontend hooks to interact with real stored data that survives canister upgrades.
