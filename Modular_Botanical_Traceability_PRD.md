# Modular Product Requirements Document (LLM-Safe Version)

## Blockchain-Based Botanical Traceability System for Ayurvedic Herbs

**Purpose:** This PRD is intentionally divided into 4 isolated development modules so that an LLM can implement each module independently without hallucinating unrelated features.

## Tech Stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express.js
- Database: Firebase Firestore
- Authentication: Firebase Authentication
- File Storage: Cloudinary
- Maps: OpenStreetMap (Leaflet)
- Deployment: Vercel

---

# Module 1 — User & Herb Collection Management

## Objective

Create verified herb collection records at the source.

## Scope

This module includes only:
- user authentication,
- role management,
- herb registration,
- geo-tagging,
- image upload,
- batch creation.

Do not implement supply-chain transfer, laboratory, manufacturing, QR verification, analytics, or dashboards in this module.

## User Roles

- Farmer
- Wild Collector

## Functional Requirements

### Authentication

- Register user
- Login user
- Logout user
- Persist session

### Herb Collection

- Enter herb name
- Enter botanical species
- Enter collection date
- Capture GPS latitude and longitude
- Upload herb image
- Generate unique batch ID
- Save batch record

## Database Collections

### users

- userId
- name
- email
- role
- phone

### herbBatches

- batchId
- herbName
- species
- collectorId
- collectionDate
- latitude
- longitude
- imageUrl
- status = `COLLECTED`
- createdAt

## Screens

1. Login
2. Registration
3. Farmer Dashboard
4. New Herb Batch Form
5. Batch Details

## APIs

- POST `/auth/register`
- POST `/auth/login`
- POST `/batches`
- GET `/batches/:batchId`
- GET `/batches/user/:userId`

## Acceptance Criteria

- User can register and login.
- GPS coordinates are saved.
- Image uploads successfully to Cloudinary.
- Batch ID is generated automatically.
- Batch record appears in Firestore.

---

# Module 2 — Supply Chain & Traceability Tracking

## Objective

Track movement of herb batches between stakeholders.

## Scope

This module starts only after Module 1 is complete.

Implement:
- ownership transfer,
- transfer history,
- batch status updates,
- traceability timeline.

Do not implement laboratory testing, manufacturing, QR verification, or analytics.

## User Roles

- Collection Center
- Processor
- Distributor

## Functional Requirements

### Batch Transfer

- Select batch
- Select recipient stakeholder
- Record transfer timestamp
- Update current owner
- Update batch status

### Traceability

- View full transfer history
- View current owner
- View batch timeline

## Database Collections

### transfers

- transferId
- batchId
- fromUserId
- toUserId
- transferredAt
- remarks

### batchStatus

- batchId
- currentOwnerId
- currentStatus
- updatedAt

## Allowed Status Values

- COLLECTED
- RECEIVED_AT_CENTER
- PROCESSING
- SENT_TO_LAB
- RECEIVED_FROM_LAB
- SENT_TO_MANUFACTURER

## Screens

1. Transfer Batch
2. Transfer History
3. Batch Timeline

## APIs

- POST `/transfers`
- GET `/transfers/:batchId`
- PATCH `/batches/:batchId/status`
- GET `/batches/:batchId/timeline`

## Acceptance Criteria

- Ownership changes correctly.
- Transfer history is immutable.
- Timeline shows all transfers in order.
- Current owner is always available.

---

# Module 3 — Quality Assurance & Manufacturing

## Objective

Validate herb quality and create the final Ayurvedic product.

## Scope

This module starts only after Module 2 is complete.

Implement:
- laboratory reports,
- certificate upload,
- batch approval/rejection,
- product creation.

Do not implement QR verification, public pages, or analytics.

## User Roles

- Laboratory
- Manufacturer

## Functional Requirements

### Laboratory

- Upload test report PDF/image
- Upload certificate
- Mark batch as APPROVED or REJECTED
- Add remarks

### Manufacturing

- Select approved batch
- Enter product name
- Enter formulation details
- Enter manufacturing date
- Create product record

## Database Collections

### labReports

- reportId
- batchId
- testResult
- remarks
- certificateUrl
- testedBy
- testedAt

### products

- productId
- batchId
- productName
- formulation
- manufacturingDate
- manufacturerId
- status = `MANUFACTURED`
- createdAt

## Screens

1. Lab Dashboard
2. Upload Report
3. Batch Approval Screen
4. Manufacturer Dashboard
5. Create Product Form

## APIs

- POST `/lab-reports`
- PATCH `/lab-reports/:reportId/status`
- GET `/lab-reports/:batchId`
- POST `/products`
- GET `/products/:productId`

## Acceptance Criteria

- Laboratory report uploads successfully.
- Certificate URL is stored.
- Batch approval status is updated.
- Product is created only from approved batches.

---

# Module 4 — QR Verification & Monitoring Dashboard

## Objective

Enable consumer verification and regulator monitoring.

## Scope

This module starts only after Module 3 is complete.

Implement:
- QR code generation,
- public verification page,
- regulator dashboard,
- manufacturer dashboard,
- basic analytics.

Do not modify batch, transfer, or laboratory data in this module.

## User Roles

- Consumer
- Regulator
- Manufacturer (read-only dashboard)

## Functional Requirements

### QR Generation

- Generate QR for each product
- Store QR URL

### Public Verification

Display:
- product name,
- herb name,
- collection location,
- collector name,
- laboratory status,
- manufacturing details,
- transfer timeline.

### Dashboards

- Total batches
- Approved batches
- Rejected batches
- Manufactured products
- Recent activity

## Database Collections

### qrCodes

- qrId
- productId
- qrUrl
- generatedAt

### verificationLogs

- logId
- productId
- scannedAt
- deviceInfo (optional)

## Screens

1. QR Generator
2. Consumer Verification Page
3. Regulator Dashboard
4. Manufacturer Dashboard

## APIs

- POST `/qr/generate/:productId`
- GET `/verify/:productId`
- GET `/dashboard/regulator`
- GET `/dashboard/manufacturer`
- POST `/verification-log`

## Acceptance Criteria

- QR code is generated for every product.
- Public verification page works without login.
- Dashboard metrics load successfully.
- Verification scans are logged.

---

# Inter-Module Dependency Map

| Module | Depends On |
|---|---|
| Module 1 | None |
| Module 2 | Module 1 |
| Module 3 | Module 2 |
| Module 4 | Module 3 |

---

# Development Order

1. Module 1
2. Module 2
3. Module 3
4. Module 4

Do not start a later module until the previous module passes its acceptance criteria.

---

# LLM Development Rules

When implementing a module:
- use only the collections defined for that module,
- create only the APIs listed for that module,
- build only the screens listed for that module,
- do not invent additional roles,
- do not invent additional database fields,
- do not implement features from future modules,
- keep all status values exactly as defined.

This restriction is mandatory and is intended to minimize hallucinations during AI-assisted development.
