```markdown
# Oceara API Documentation

## Overview

Complete RESTful API documentation for the Oceara Blue Carbon Ecosystem Platform.

**Base URL**: `http://localhost:5000/api`  
**Authentication**: JWT Bearer Token  
**WebSocket URL**: `ws://localhost:5000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Projects API](#projects-api)
3. [Uploads API](#uploads-api)
4. [Carbon Calculation API](#carbon-calculation-api)
5. [Blockchain API](#blockchain-api)
6. [AI/ML API](#aiml-api)
7. [Admin API](#admin-api)
8. [User API](#user-api)
9. [WebSocket Events](#websocket-events)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)

---

## Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "landowner"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "eyJhbGc..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Google OAuth
```http
GET /api/auth/google
```

### Select Role (After OAuth)
```http
POST /api/auth/select-role
Content-Type: application/json
Authorization: Bearer {token}

{
  "role": "landowner"
}
```

---

## Projects API

### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sundarbans Restoration Project",
  "description": "Mangrove restoration in the Sundarbans delta",
  "projectType": "restoration",
  "location": {
    "type": "Point",
    "coordinates": [89.0833, 21.95]
  },
  "area": {
    "total": 50
  },
  "country": "Bangladesh",
  "region": "Khulna",
  "ecosystemType": "mangrove",
  "species": [{
    "scientificName": "Rhizophora mucronata",
    "commonName": "Red Mangrove",
    "count": 5000,
    "percentage": 60
  }],
  "startDate": "2024-01-01",
  "projectDuration": 36,
  "carbonData": {
    "estimatedSequestration": 1000
  },
  "vegetationData": {
    "totalTrees": 5000,
    "averageDBH": 15,
    "averageHeight": 8
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "projectId": "PROJ-ABC12345",
    "_id": "...",
    "name": "Sundarbans Restoration Project",
    ...
  }
}
```

### Get All Projects
```http
GET /api/projects?page=1&limit=20&status=active&verificationStatus=verified&ecosystemType=mangrove&country=Bangladesh&search=sundarbans
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status`: active | completed | suspended | archived
- `verificationStatus`: draft | submitted | under_review | verified | rejected
- `ecosystemType`: mangrove | wetland | seagrass | salt_marsh | mixed
- `country`: Country name
- `projectType`: restoration | conservation | afforestation | protection
- `search`: Search term (name, description, projectId)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc | desc (default: desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

### Get Single Project
```http
GET /api/projects/:id
Authorization: Bearer {token}
```

### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "vegetationData": {
    "totalTrees": 5500
  }
}
```

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer {token}
```

### Submit Project for Verification
```http
POST /api/projects/:id/submit
Authorization: Bearer {token}
```

### Get Project Statistics
```http
GET /api/projects/:id/statistics
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "carbon": {
      "totalSequestration": 1250.5,
      "annualSequestration": 125.3,
      "carbonStock": 340.7,
      "totalBiomass": 740.2
    },
    "credits": {
      "issued": 1000,
      "available": 750,
      "retired": 250,
      "total": 1000
    },
    "vegetation": {
      "totalTrees": 5500,
      "density": 110,
      "survivalRate": 92,
      "healthScore": 85
    },
    "uploads": {
      "droneImages": 45,
      "fieldData": 3,
      "gpsData": 1,
      "beforeAfterPhotos": 12,
      "documents": 5
    },
    "financial": {
      "totalEarnings": 45000,
      "pendingPayments": 5000,
      "transactionCount": 8
    },
    "timeline": {
      "startDate": "2024-01-01",
      "daysElapsed": 365
    }
  }
}
```

### Get Nearby Projects
```http
GET /api/projects/:id/nearby?maxDistance=50000
Authorization: Bearer {token}
```

---

## Uploads API

### Upload Drone Images
```http
POST /api/uploads/drone-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

projectId: PROJ-ABC12345
images: [file1.jpg, file2.jpg, ...]
```

**Response**:
```json
{
  "success": true,
  "message": "10 files uploaded successfully",
  "data": [
    {
      "uploadId": "...",
      "filename": "drone_image_1.jpg",
      "url": "https://s3.amazonaws.com/...",
      "key": "uploads/2025/01/drone_image/...",
      "size": 2457600
    },
    ...
  ]
}
```

### Upload Field Data
```http
POST /api/uploads/field-data
Authorization: Bearer {token}
Content-Type: multipart/form-data

projectId: PROJ-ABC12345
file: field_data.csv
```

### Upload GPS Data
```http
POST /api/uploads/gps-data
Authorization: Bearer {token}
Content-Type: multipart/form-data

projectId: PROJ-ABC12345
file: coordinates.kml
```

### Upload Before/After Photos
```http
POST /api/uploads/before-after-photos
Authorization: Bearer {token}
Content-Type: multipart/form-data

projectId: PROJ-ABC12345
type: before
description: Before restoration in January 2024
photos: [photo1.jpg, photo2.jpg]
```

### Get Project Uploads
```http
GET /api/uploads/project/:projectId?uploadType=drone_image&status=uploaded
Authorization: Bearer {token}
```

### Get Single Upload
```http
GET /api/uploads/:uploadId
Authorization: Bearer {token}
```

### Download File
```http
GET /api/uploads/:uploadId/download
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://s3.amazonaws.com/...?signature=...",
    "filename": "field_data.csv",
    "expiresIn": 300
  }
}
```

### Delete Upload
```http
DELETE /api/uploads/:uploadId
Authorization: Bearer {token}
```

### Get Upload Statistics
```http
GET /api/uploads/stats/summary
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUploads": 156,
    "totalSize": 5368709120,
    "byType": [
      { "_id": "drone_image", "count": 89 },
      { "_id": "field_data", "count": 12 },
      ...
    ],
    "byStatus": [
      { "_id": "uploaded", "count": 120 },
      { "_id": "processed", "count": 36 }
    ],
    "recentUploads": [...]
  }
}
```

---

## Carbon Calculation API

### Calculate Single Tree
```http
POST /api/carbon/calculate-single
Authorization: Bearer {token}
Content-Type: application/json

{
  "speciesType": "rhizophora_mucronata",
  "dbh": 25.5,
  "height": 12.3,
  "crownRadius": 3.2,
  "age": 15,
  "healthScore": 85
}
```

### Calculate Forest
```http
POST /api/carbon/calculate-forest
Authorization: Bearer {token}
Content-Type: application/json

{
  "trees": [
    {
      "speciesType": "rhizophora_mucronata",
      "dbh": 25.5,
      "height": 12.3
    },
    ...
  ],
  "areaHectares": 2.5
}
```

### Calculate from AI Results
```http
POST /api/carbon/calculate-from-ai
Authorization: Bearer {token}
Content-Type: application/json

{
  "aiResults": {
    "crownDetection": {
      "crownsDetected": 245,
      "confidence": 0.92
    },
    "speciesClassification": {
      "species": "rhizophora_mucronata",
      "confidence": 0.88
    },
    "healthAssessment": {
      "healthScore": 82,
      "confidence": 0.85
    }
  },
  "fieldData": {
    "avgDBH": 28.3,
    "avgHeight": 14.2,
    "areaHectares": 3.5
  }
}
```

### Admin Override
```http
POST /api/carbon/admin-override
Authorization: Bearer {token}
Content-Type: application/json

{
  "calculationId": "calc_123456",
  "overrides": {
    "crownCount": 250,
    "species": "mixed_species",
    "healthScore": 80
  },
  "reason": "Manual verification revealed mixed species"
}
```

### Get Species Parameters
```http
GET /api/carbon/species/rhizophora_mucronata
Authorization: Bearer {token}
```

### List All Species
```http
GET /api/carbon/species
Authorization: Bearer {token}
```

### Get Formulas
```http
GET /api/carbon/formulas
```

---

## Blockchain API

### Mint Carbon Credit
```http
POST /api/blockchain/mint-credit
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "...",
  "amount": 1250.5,
  "metadata": {
    "location": "Sundarbans, Bangladesh",
    "ecosystemType": "Mangrove",
    "verificationDate": "2025-01-15"
  }
}
```

### Create Marketplace Listing
```http
POST /api/blockchain/create-listing
Authorization: Bearer {token}
Content-Type: application/json

{
  "tokenId": "123",
  "listingType": "fixed_price",
  "price": "50000000000000000000",
  "paymentToken": "0x..."
}
```

### Buy Credit
```http
POST /api/blockchain/buy-credit
Authorization: Bearer {token}
Content-Type: application/json

{
  "listingId": "456"
}
```

### Get Transaction Status
```http
GET /api/blockchain/transaction/:txHash
Authorization: Bearer {token}
```

---

## AI/ML API

### Process Images
```http
POST /api/ai/process-images
Authorization: Bearer {token}
Content-Type: application/json

{
  "uploadIds": ["upload_123", "upload_456"],
  "projectId": "PROJ-ABC12345"
}
```

**Response**:
```json
{
  "success": true,
  "message": "AI processing started",
  "data": {
    "jobId": "job_789",
    "status": "queued",
    "uploadCount": 2
  }
}
```

### Calculate Carbon
```http
POST /api/ai/calculate-carbon
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "PROJ-ABC12345",
  "treeData": {...},
  "environmentalData": {...}
}
```

### Get Job Status
```http
GET /api/ai/job/:jobId
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobId": "job_789",
    "status": "completed",
    "progress": 100,
    "results": {
      "crownDetection": {...},
      "speciesClassification": {...},
      "healthAssessment": {...}
    },
    "completedAt": "2025-01-15T10:30:00Z"
  }
}
```

### List Jobs
```http
GET /api/ai/jobs?status=completed&projectId=PROJ-ABC12345
Authorization: Bearer {token}
```

---

## Admin API

### Get Pending Projects
```http
GET /api/admin/projects?verificationStatus=submitted
Authorization: Bearer {token}
Roles: admin
```

### Approve Project
```http
POST /api/admin/projects/:id/approve
Authorization: Bearer {token}
Roles: admin
Content-Type: application/json

{
  "notes": "All data verified, ready for credit minting"
}
```

### Reject Project
```http
POST /api/admin/projects/:id/reject
Authorization: Bearer {token}
Roles: admin
Content-Type: application/json

{
  "reason": "Incomplete field data",
  "notes": "Please provide additional tree measurements"
}
```

### Apply AI Override
```http
POST /api/admin/ai/override
Authorization: Bearer {token}
Roles: admin
Content-Type: application/json

{
  "jobId": "job_789",
  "overrides": {
    "crownCount": 250,
    "species": "rhizophora_mucronata",
    "healthScore": 85
  },
  "reason": "Manual count correction"
}
```

### Mint Credits
```http
POST /api/admin/credits/mint
Authorization: Bearer {token}
Roles: admin
Content-Type: application/json

{
  "projectId": "PROJ-ABC12345",
  "amount": 1250.5
}
```

### Get Audit Logs
```http
GET /api/admin/audit-logs?userId=...&action=APPROVE_PROJECT&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {token}
Roles: admin
```

### Export Report
```http
POST /api/admin/reports/export
Authorization: Bearer {token}
Roles: admin
Content-Type: application/json

{
  "reportType": "compliance",
  "format": "pdf",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "projectIds": ["PROJ-ABC12345"]
}
```

---

## User API

### Get Current User
```http
GET /api/users/me
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890"
}
```

### Get User Statistics
```http
GET /api/users/me/statistics
Authorization: Bearer {token}
```

---

## WebSocket Events

### Connect
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Subscribe to Events
```javascript
// Subscribe to project updates
socket.emit('join-project', 'PROJ-ABC12345');

// Subscribe to dashboard
socket.emit('subscribe-dashboard', 'landowner');

// Subscribe to AI job
socket.emit('subscribe-ai-job', 'job_789');

// Subscribe to marketplace
socket.emit('subscribe-marketplace');
```

### Listen to Events
```javascript
// Project status updated
socket.on('project:status-updated', (data) => {
  console.log('Project status:', data);
});

// Verification status updated
socket.on('verification:status-updated', (data) => {
  console.log('Verification status:', data);
});

// Upload processing completed
socket.on('upload:processing-completed', (data) => {
  console.log('Upload processed:', data);
});

// AI job status updated
socket.on('ai:job-status-updated', (data) => {
  console.log('AI job status:', data.status, 'Progress:', data.progress);
});

// Carbon calculation completed
socket.on('carbon:calculation-completed', (data) => {
  console.log('Carbon results:', data.results);
});

// Credits minted
socket.on('credits:minted', (data) => {
  console.log('Credits minted:', data);
});

// Credit purchased
socket.on('credits:purchased', (data) => {
  console.log('Purchase complete:', data);
});

// Dashboard data updated
socket.on('dashboard:data-updated', (data) => {
  console.log('Dashboard update:', data);
});

// New notification
socket.on('notification:new', (data) => {
  console.log('Notification:', data);
});

// Blockchain transaction confirmed
socket.on('blockchain:transaction-confirmed', (data) => {
  console.log('Transaction confirmed:', data.txHash);
});

// System announcement
socket.on('system:announcement', (data) => {
  console.log('Announcement:', data.message);
});
```

---

## Error Handling

All API responses follow a consistent format:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

**HTTP Status Codes**:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- **Default Rate Limit**: 100 requests per 15 minutes per IP
- **Upload Rate Limit**: 20 requests per hour
- **AI Processing Rate Limit**: 10 requests per hour

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

---

## File Upload Limits

- **Max File Size**: 100 MB
- **Max Files per Request**: 50 (drone images), 20 (photos), 1 (data files)
- **Allowed File Types**:
  - Images: JPEG, PNG, TIFF, GIF
  - Documents: PDF
  - Data: CSV, Excel (.xlsx), JSON
  - GPS: KML, GeoJSON
  - Archives: ZIP

---

## Security

### Authentication
- JWT Bearer tokens
- Token expiry: 24 hours
- Google OAuth 2.0 supported

### HTTPS
- All production endpoints require HTTPS
- Self-signed certificates not allowed

### CORS
- Origin: `http://localhost:3000` (development)
- Credentials: Allowed
- Methods: GET, POST, PUT, DELETE

---

## API Testing

Interactive API documentation available at:
**http://localhost:5000/api-docs**

Use tools like:
- Postman
- Insomnia
- cURL
- HTTPie

---

## Support

For API support:
- Documentation: `/api-docs`
- Health Check: `GET /health`
- WebSocket Status: Check connection logs

---

**API Version**: 1.0.0  
**Last Updated**: January 2025  
**Oceara Development Team**
```
