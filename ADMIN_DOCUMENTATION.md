# Admin Interface Documentation

## Overview

The Oceara Admin Interface provides comprehensive tools for platform administrators to manage carbon credit projects, verify data, review AI/ML results, mint tokens, and maintain regulatory compliance.

## Table of Contents

1. [Admin Dashboard](#admin-dashboard)
2. [Project Approval Workflow](#project-approval-workflow)
3. [Data Verification](#data-verification)
4. [AI/ML Model Review](#aiml-model-review)
5. [Token Minting](#token-minting)
6. [Blockchain Registry Viewer](#blockchain-registry-viewer)
7. [Export Tools](#export-tools)
8. [Audit Logging](#audit-logging)
9. [API Endpoints](#api-endpoints)

---

## Admin Dashboard

### Overview Section

The admin dashboard provides real-time statistics and system status:

**Key Metrics:**
- **Pending Projects**: Number of projects awaiting admin review
- **Under Verification**: Projects currently in the verification process
- **Approved Projects**: Total approved and verified projects
- **Total Credits Minted**: Cumulative carbon credits issued

**System Status:**
- API Server status
- Blockchain network connectivity
- AI/ML model availability
- Database status

**Recent Activity Feed:**
- Latest administrative actions
- Project approvals/rejections
- Credit minting events
- System alerts

### Navigation Tabs

1. **Overview** - Dashboard home with statistics and quick actions
2. **Projects** - Project management and approval workflow
3. **Verifications** - Verification report review and management
4. **AI/ML Review** - AI model results review and manual override
5. **Blockchain** - Blockchain transaction history and registry
6. **Audit Logs** - Complete audit trail of administrative actions
7. **Reports** - Export tools for regulatory compliance

---

## Project Approval Workflow

### Project Review Stages

#### 1. Initial Review (Pending Review)
**Admin Actions:**
- Review project documentation
- Verify land ownership information
- Check methodology compliance
- Assess estimated carbon calculations
- Request additional documentation if needed

**Decision Options:**
- **Approve for Verification** - Move to field verification stage
- **Request Changes** - Send back to landowner with specific requirements
- **Reject** - Decline project with detailed reasoning

#### 2. Field Verification (Under Verification)
**Verification Process:**
- Third-party verifier assignment
- On-site field data collection
- GPS coordinate verification
- Species identification confirmation
- Carbon calculation validation

**Admin Actions:**
- Monitor verification progress
- Review submitted verification reports
- Communicate with verifiers
- Approve or reject verification reports

#### 3. Final Approval (Verified)
**Requirements for Approval:**
- Completed field verification
- AI/ML analysis results reviewed
- All documentation submitted
- Methodology compliance confirmed
- Carbon calculations validated

**Post-Approval Actions:**
- Trigger carbon credit minting
- Issue verification certificate
- Update project status
- Notify project owner

### Project Information Display

```typescript
{
  name: "Project Name",
  owner: "Land Owner Name/Organization",
  location: "Geographic Location",
  area: 500, // hectares
  estimatedCarbon: 25000, // tons
  status: "pending_review" | "under_verification" | "approved" | "rejected",
  submittedDate: "2024-01-15",
  methodology: "VCS VM0007",
  verificationStage: "initial_review" | "field_verification" | "final_approval",
  documents: ["project_proposal.pdf", "environmental_impact.pdf"],
  images: ["before_1.jpg", "after_1.jpg", "drone_survey.jpg"],
  gpsData: { lat: 22.1055, lng: 88.7519 },
  fieldData: "soil_samples.csv"
}
```

---

## Data Verification

### Uploaded Data Types

#### 1. Documents
- **Project Proposals**: Detailed project descriptions and plans
- **Environmental Impact Assessments**: Environmental study reports
- **Land Ownership Documents**: Proof of land rights
- **Methodology Reports**: Carbon accounting methodology documentation
- **Baseline Studies**: Pre-project environmental conditions

**Verification Steps:**
1. Document completeness check
2. Format and quality validation
3. Content review for accuracy
4. Cross-reference with other data sources
5. Approve or request corrections

#### 2. Images
- **Drone Imagery**: Aerial photographs of project area
- **Satellite Images**: Multi-spectral satellite data
- **Before/After Photos**: Restoration progress documentation
- **Field Photos**: Ground-level documentation

**Verification Steps:**
1. Image quality and resolution check
2. Metadata verification (timestamp, GPS coordinates)
3. AI-powered image analysis
4. Manual visual inspection
5. Comparison with historical imagery

#### 3. GPS Data
- **Project Boundaries**: Polygon coordinates defining project area
- **Sampling Points**: GPS coordinates of field sampling locations
- **Tree Locations**: Individual tree coordinates (if applicable)

**Verification Steps:**
1. Coordinate format validation
2. Boundary completeness check
3. Cross-reference with satellite imagery
4. Verify against land ownership records
5. Check for overlapping projects

#### 4. Field Data
- **Soil Samples**: Soil composition and carbon content data
- **Tree Measurements**: DBH, height, species data
- **Water Quality**: Water chemistry and quality parameters
- **Biodiversity Surveys**: Species count and diversity metrics

**Verification Steps:**
1. Data format and structure validation
2. Statistical analysis for outliers
3. Cross-reference with methodology requirements
4. Expert review of measurements
5. Comparison with regional baselines

---

## AI/ML Model Review

### Model Analysis Results

#### 1. Crown Detection
**Purpose**: Identify and count individual tree crowns from drone/satellite imagery

**Results Display:**
- **Confidence Score**: AI model confidence level (0-100%)
- **Crowns Detected**: Number of individual tree crowns identified
- **Coverage Map**: Visual representation of detected crowns
- **Density Analysis**: Trees per hectare calculation

**Admin Actions:**
- **Accept Result**: Approve AI analysis as-is
- **Override**: Manually adjust crown count or confidence
- **Reject & Re-process**: Trigger reanalysis with different parameters

**Override Interface:**
```typescript
{
  originalValue: {
    confidence: 0.87,
    crownsDetected: 1250
  },
  newValue: {
    confidence: 0.95,
    crownsDetected: 1300
  },
  reason: "Manual count confirmed higher accuracy"
}
```

#### 2. Species Classification
**Purpose**: Identify mangrove/wetland species from imagery

**Results Display:**
- **Confidence Score**: Classification confidence (0-100%)
- **Primary Species**: Dominant species identified
- **Species Distribution**: Percentage breakdown of multiple species
- **Classification Map**: Spatial distribution of species

**Supported Species:**
- Rhizophora mucronata
- Rhizophora apiculata
- Avicennia marina
- Avicennia officinalis
- Bruguiera gymnorrhiza
- Sonneratia alba

**Admin Actions:**
- **Accept Classification**: Approve species identification
- **Override Species**: Manually correct species identification
- **Request Field Verification**: Flag for physical confirmation

#### 3. Tree Health Assessment
**Purpose**: Evaluate overall tree health and vigor

**Results Display:**
- **Health Score**: Overall health rating (0-100)
- **Confidence Score**: Assessment confidence (0-100%)
- **Health Categories**: Distribution across health classes
- **Stress Indicators**: Identification of stress factors

**Health Categories:**
- **Healthy** (80-100): Vigorous growth, no stress
- **Moderate** (60-79): Some stress, generally healthy
- **Stressed** (40-59): Significant stress indicators
- **Declining** (20-39): Poor health, intervention needed
- **Dead/Dying** (0-19): Mortality or severe decline

**Admin Actions:**
- **Accept Assessment**: Approve health analysis
- **Override Score**: Adjust health score based on field data
- **Flag for Monitoring**: Mark for ongoing observation

### Manual Override Process

**Requirements for Override:**
1. **Justification**: Detailed reason for override
2. **Supporting Evidence**: Field data, expert opinion, additional imagery
3. **Confidence Adjustment**: Updated confidence level
4. **Documentation**: All overrides logged in audit trail

**Override Workflow:**
1. Review AI results
2. Compare with field data and expert assessments
3. Document discrepancy
4. Enter corrected values
5. Submit override with justification
6. System logs override in audit trail
7. Notification sent to relevant stakeholders

---

## Token Minting

### Minting Triggers

**Automatic Triggers:**
- Project status: Verified
- All verification reports: Approved
- AI/ML review: Completed
- Admin approval: Granted

**Manual Triggers:**
- Admin-initiated minting for approved projects
- Batch minting for multiple projects
- Re-minting for corrections

### Minting Process

#### Pre-Minting Validation
```typescript
{
  projectId: number,
  projectStatus: "verified",
  carbonAmount: number, // tons CO2e
  verificationComplete: boolean,
  aiReviewComplete: boolean,
  adminApproval: boolean,
  methodology: string,
  vintageYear: number
}
```

#### Minting Parameters
- **Recipient Address**: Landowner's wallet address
- **Carbon Amount**: Total tons of CO2e to tokenize
- **Project ID**: Reference to blockchain registry
- **Vintage Year**: Year carbon was sequestered
- **Methodology**: Verification methodology used
- **Location**: Geographic coordinates
- **Species**: Dominant species type
- **Token URI**: Metadata URL

#### Post-Minting Actions
1. **Blockchain Confirmation**: Wait for transaction confirmation
2. **Database Update**: Record token ID and transaction hash
3. **Notification**: Alert landowner of credit issuance
4. **Registry Update**: Update public carbon credit registry
5. **Audit Log**: Record minting event

### Minting Interface

**Input Form:**
```
Project: [Select from verified projects]
Recipient: [Wallet Address]
Carbon Amount: [___] tons CO2e
Vintage Year: [2024]
Species: [Dropdown]
Location: [Auto-filled from project]
Methodology: [Auto-filled from project]

[Preview] [Mint Credits]
```

**Transaction Details Display:**
- Estimated gas cost
- Network confirmation time
- Token ID (post-mint)
- Transaction hash
- Block number
- Timestamp

---

## Blockchain Registry Viewer

### Transaction History

**Transaction Types:**
- **Credit Minted**: New carbon credits issued
- **Credit Transferred**: Credits transferred between wallets
- **Credit Retired**: Credits permanently retired
- **Project Verified**: Project verification recorded on-chain
- **Verification Report Submitted**: Verification data submitted

**Transaction Data:**
```typescript
{
  id: number,
  type: "Credit Minted" | "Credit Transferred" | "Credit Retired" | "Project Verified",
  projectId: number,
  amount: number, // tons CO2e
  tokenId: string,
  txHash: string,
  from: string, // wallet address
  to: string, // wallet address
  timestamp: Date,
  status: "pending" | "confirmed" | "failed",
  blockNumber: number,
  gasUsed: number,
  gasCost: number
}
```

### Registry Features

#### Search & Filter
- **By Transaction Type**: Filter by mint, transfer, retire
- **By Project ID**: View all transactions for specific project
- **By Date Range**: Filter by time period
- **By Status**: Pending, confirmed, failed
- **By Wallet Address**: View user-specific transactions

#### Export Options
- **CSV Export**: Transaction data for spreadsheet analysis
- **PDF Report**: Formatted transaction report
- **JSON Export**: Raw data for programmatic access

#### Real-Time Monitoring
- **WebSocket Updates**: Live transaction updates
- **Status Notifications**: Alerts for transaction confirmations
- **Gas Price Monitoring**: Current network gas prices
- **Network Status**: Blockchain connectivity status

---

## Export Tools

### Report Types

#### 1. Project Verification Report
**Contents:**
- Project overview and details
- Verification methodology
- Field data and measurements
- AI/ML analysis results
- Verification timeline
- Approvals and sign-offs
- Carbon calculation details

**Format Options:** PDF, CSV, JSON

#### 2. Carbon Credit Registry
**Contents:**
- List of all issued credits
- Token IDs and amounts
- Project associations
- Current ownership
- Retirement status
- Transaction history

**Format Options:** PDF, CSV, JSON, Excel

#### 3. Audit Trail Report
**Contents:**
- Complete action log
- User activities
- Timestamp records
- IP addresses
- Resource changes
- Approval workflows

**Format Options:** PDF, CSV

#### 4. AI/ML Analysis Report
**Contents:**
- Model performance metrics
- Analysis results per project
- Manual overrides log
- Confidence score distribution
- Accuracy assessments
- Model version information

**Format Options:** PDF, CSV, JSON

#### 5. Blockchain Transaction Log
**Contents:**
- All blockchain transactions
- Gas costs and fees
- Smart contract interactions
- Token transfers
- Credit retirements
- Network statistics

**Format Options:** PDF, CSV, JSON

#### 6. Regulatory Compliance Report
**Contents:**
- VCS/Gold Standard compliance
- Methodology adherence
- Verification standards met
- Quality assurance records
- Certification documentation
- Stakeholder communications

**Format Options:** PDF

### Export Interface

**Filter Options:**
- Date range selection
- Project selection
- Status filters
- User filters
- Action type filters

**Customization:**
- Column selection
- Sort order
- Include/exclude sections
- Logo and branding
- Custom headers/footers

**Delivery Methods:**
- Direct download
- Email delivery
- Scheduled exports
- API access

---

## Audit Logging

### Logged Actions

#### Project Actions
- `CREATE_PROJECT` - New project submission
- `UPDATE_PROJECT` - Project information modified
- `APPROVE_PROJECT` - Project approved for verification
- `REJECT_PROJECT` - Project rejected
- `REQUEST_PROJECT_CHANGES` - Changes requested
- `VIEW_PROJECT_DETAILS` - Project details accessed

#### Verification Actions
- `SUBMIT_VERIFICATION` - Verification report submitted
- `APPROVE_VERIFICATION` - Verification approved
- `REJECT_VERIFICATION` - Verification rejected
- `UPDATE_VERIFICATION` - Verification details modified

#### Carbon Credit Actions
- `MINT_CARBON_CREDITS` - Credits minted on blockchain
- `TRANSFER_CARBON_CREDITS` - Credits transferred
- `RETIRE_CARBON_CREDITS` - Credits retired
- `VERIFY_CARBON_CREDITS` - Credits verified

#### AI/ML Actions
- `AI_OVERRIDE` - AI result manually overridden
- `RUN_AI_MODEL` - AI model executed
- `VIEW_AI_RESULTS` - AI results accessed

#### Admin Actions
- `EXPORT_REPORT` - Report exported
- `GENERATE_REPORT` - Report generated
- `VIEW_AUDIT_LOGS` - Audit logs viewed
- `SYSTEM_CONFIGURATION` - System settings changed

#### User Actions
- `USER_LOGIN` - User logged in
- `USER_LOGOUT` - User logged out
- `UPDATE_USER_PROFILE` - Profile updated
- `CHANGE_USER_ROLE` - User role modified

### Audit Log Structure

```typescript
{
  id: string,
  userId: string,
  userEmail: string,
  userName: string,
  action: string,
  resource: "project" | "verification" | "carbon_credit" | "ai_result" | ...,
  resourceId: string,
  details: string,
  ipAddress: string,
  userAgent: string,
  requestMethod: "GET" | "POST" | "PUT" | "DELETE",
  requestUrl: string,
  statusCode: number,
  responseTime: number, // milliseconds
  metadata: object,
  severity: "low" | "medium" | "high" | "critical",
  timestamp: Date
}
```

### Audit Log Features

#### Search & Filter
- Search by user, action, resource
- Filter by date range
- Filter by severity level
- Filter by action type
- Filter by resource type

#### Statistics
- Action frequency analysis
- User activity metrics
- Resource access patterns
- Severity distribution
- Peak activity times

#### Retention Policy
- Default retention: 1 year
- Critical logs: Permanent
- Automatic archival: 90 days
- Compliance mode: 7 years

#### Security Features
- Immutable log entries
- Cryptographic signatures
- Tamper detection
- Access restrictions
- Encrypted storage

---

## API Endpoints

### Project Management

#### Get All Projects
```http
GET /api/admin/projects
Authorization: Bearer <token>
Query Parameters:
  - status: pending_review | under_verification | approved | rejected
  - page: number
  - limit: number
  - search: string
```

#### Get Project Details
```http
GET /api/admin/projects/:id
Authorization: Bearer <token>
```

#### Approve Project
```http
POST /api/admin/projects/:id/approve
Authorization: Bearer <token>
Body:
{
  "notes": "string",
  "verificationStage": "string"
}
```

#### Reject Project
```http
POST /api/admin/projects/:id/reject
Authorization: Bearer <token>
Body:
{
  "reason": "string"
}
```

#### Request Changes
```http
POST /api/admin/projects/:id/request-changes
Authorization: Bearer <token>
Body:
{
  "changes": ["string"]
}
```

### AI/ML Management

#### Override AI Result
```http
POST /api/admin/ai/override
Authorization: Bearer <token>
Body:
{
  "projectId": number,
  "field": "crownDetection" | "speciesClassification" | "healthAssessment",
  "originalValue": object,
  "newValue": object,
  "reason": "string"
}
```

### Token Minting

#### Mint Carbon Credits
```http
POST /api/admin/credits/mint
Authorization: Bearer <token>
Body:
{
  "projectId": number,
  "recipient": "string", // wallet address
  "carbonAmount": "string",
  "vintageYear": "string",
  "methodology": "string",
  "location": "string",
  "species": "string"
}
```

### Blockchain

#### Get Transactions
```http
GET /api/admin/blockchain/transactions
Authorization: Bearer <token>
Query Parameters:
  - page: number
  - limit: number
  - type: string
  - projectId: number
```

### Audit Logs

#### Get Audit Logs
```http
GET /api/admin/audit-logs
Authorization: Bearer <token>
Query Parameters:
  - page: number
  - limit: number
  - action: string
  - userId: string
  - startDate: ISO date string
  - endDate: ISO date string
```

### Reports

#### Export Report
```http
GET /api/admin/reports/export
Authorization: Bearer <token>
Query Parameters:
  - type: verification | registry | audit | ai | blockchain | compliance
  - format: pdf | csv | json
  - startDate: ISO date string
  - endDate: ISO date string
```

#### Get Statistics
```http
GET /api/admin/statistics
Authorization: Bearer <token>
```

---

## Security & Access Control

### Role Requirements

All admin endpoints require the `ADMIN` role. Access is enforced through:

1. **JWT Authentication**: Valid token required
2. **Role Authorization**: Admin role verified
3. **Permission Checking**: Specific action permissions
4. **Rate Limiting**: Prevent abuse
5. **Audit Logging**: All actions logged

### Best Practices

1. **Use Strong Authentication**: Enable 2FA for admin accounts
2. **Regular Security Audits**: Review admin actions periodically
3. **Least Privilege**: Grant minimum necessary permissions
4. **Session Management**: Configure appropriate timeouts
5. **IP Whitelisting**: Restrict admin access to known IPs
6. **Backup & Recovery**: Regular backups of critical data
7. **Monitoring**: Set up alerts for suspicious activities

---

## Troubleshooting

### Common Issues

#### Project Not Appearing
- **Check Filters**: Ensure status filter includes project state
- **Refresh Data**: Clear cache and reload
- **Database Sync**: Verify database connection

#### AI Results Not Loading
- **Model Status**: Check AI/ML service availability
- **Job Queue**: Verify job completion status
- **API Connectivity**: Test ML API endpoints

#### Minting Failed
- **Blockchain Connection**: Verify network connectivity
- **Gas Fees**: Ensure sufficient funds for gas
- **Smart Contract**: Check contract deployment status
- **Wallet Connection**: Verify admin wallet configuration

#### Export Timeout
- **Reduce Date Range**: Limit data scope
- **Async Export**: Use background export for large datasets
- **Server Resources**: Check server capacity

---

## Support & Resources

### Documentation
- [API Reference](./API_DOCUMENTATION.md)
- [Blockchain Integration](./SMART_CONTRACTS_DOCUMENTATION.md)
- [AI/ML Models](./AI_ML_DOCUMENTATION.md)

### Support Channels
- **Technical Issues**: support@oceara.com
- **Security Concerns**: security@oceara.com
- **Feature Requests**: product@oceara.com

### Training Resources
- Admin dashboard video tutorials
- Best practices guide
- Verification methodology handbook
- Compliance checklist

---

*Last Updated: January 2024*
*Version: 1.0.0*
