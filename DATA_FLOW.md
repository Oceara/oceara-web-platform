# 🔄 Data Flow Architecture

This document explains how data flows between all three sections (Landowner, Buyer, Admin) in the Oceara platform.

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│  LANDOWNER  │────────>│   CONTEXT   │<────────│   ADMIN      │
│  Registers  │         │   (State)   │         │  Verifies    │
└─────────────┘         └─────────────┘         └──────────────┘
                              │
                              │
                        ┌─────▼──────┐
                        │   BUYER    │
                        │  Purchases │
                        └────────────┘
```

## Components

### 1. **DataContext** (`context/DataContext.tsx`)
- Central state management using React Context
- Stores all projects in a single source of truth
- Persists data to `localStorage` for demo purposes
- Provides CRUD operations for projects

### 2. **DataProvider**
Wraps the entire application in `app/layout.tsx`
- Loads data on app start
- Auto-saves changes to localStorage
- Makes data available to all components

### 3. **useData Hook**
Custom hook to access context in any component:
```typescript
const { projects, addProject, updateProject, ... } = useData()
```

## Data Flow Examples

### Scenario 1: Landowner Registers New Project

1. **Landowner Page** (`app/landowner/page.tsx`)
   - User clicks "Point on Map"
   - Selects location on Google Maps
   - AI/ML analysis runs
   - Fills in project details

2. **Submit Action**
   ```typescript
   const { addProject } = useData()
   
   addProject({
     name: "Project Name",
     owner: "Current User",
     status: "Pending Review",
     verified: false,
     // ... all other fields
   })
   ```

3. **Data Updates**
   - Project added to context state
   - Automatically saved to localStorage
   - Assigned unique ID and submission date

4. **Auto-Reflection**
   - ✅ **Admin Page** - Immediately shows in "Pending Approvals"
   - ❌ **Buyer Page** - NOT shown (not verified yet)

### Scenario 2: Admin Approves Project

1. **Admin Page** (`app/admin/page.tsx`)
   - Views pending projects
   - Reviews data and AI analysis
   - Clicks "Approve & Mint"

2. **Approve Action**
   ```typescript
   const { updateProject } = useData()
   
   updateProject(projectId, {
     status: 'Active',
     verified: true
   })
   ```

3. **Auto-Reflection**
   - ✅ **Buyer Page** - Project now visible in marketplace
   - ✅ **Landowner Page** - Status updated to "Active"
   - ✅ **Admin Page** - Moved to "Verified Projects" section

### Scenario 3: Admin Rejects Project

1. **Admin Action**
   ```typescript
   updateProject(projectId, {
     status: 'Rejected',
     verified: false
   })
   ```

2. **Auto-Reflection**
   - ✅ **Landowner Page** - Shows "Rejected" status
   - ❌ **Buyer Page** - Not shown
   - ✅ **Admin Page** - Removed from pending queue

### Scenario 4: Buyer Purchases Credits

1. **Buyer Action**
   ```typescript
   updateProject(projectId, {
     creditsAvailable: currentCredits - purchasedAmount
   })
   ```

2. **Auto-Reflection**
   - ✅ **Landowner Page** - Updated credit count
   - ✅ **Buyer Page** - Reduced available credits
   - ✅ **Admin Page** - Transaction logged

## Project States

| Status | Landowner | Buyer | Admin |
|--------|-----------|-------|-------|
| **Pending Review** | ✅ Visible | ❌ Hidden | ✅ In Queue |
| **Under Verification** | ✅ Visible | ❌ Hidden | ✅ In Queue |
| **Active** | ✅ Visible | ✅ Visible | ✅ Verified |
| **Rejected** | ✅ Visible | ❌ Hidden | ✅ Archived |

## Data Structure

```typescript
interface Project {
  id: number                    // Auto-generated
  name: string                  // User input
  owner: string                 // Current user
  location: string              // User input / AI detected
  coordinates: { lat, lng }     // From map selection
  area: string                  // AI calculated
  creditsAvailable: number      // AI calculated
  pricePerCredit: number        // Admin/system set
  verified: boolean             // Admin action
  status: string                // State machine
  impact: string                // Calculated
  image: string                 // Icon/emoji
  description: string           // User input
  submittedDate: string         // Auto-generated
  images: string[]              // User uploads
  satelliteImages?: string[]    // Auto-fetched
  fieldData?: {...}             // User input
  mlAnalysis?: {...}            // AI generated
  documents?: string[]          // User uploads
}
```

## Real-Time Updates

### Current Implementation (Demo)
- Uses `localStorage` for persistence
- State updates trigger re-renders
- All components using `useData()` get updates

### Production Considerations
For production, replace localStorage with:

1. **Backend API**
   ```typescript
   // In DataContext
   useEffect(() => {
     fetch('/api/projects')
       .then(res => res.json())
       .then(setProjects)
   }, [])
   ```

2. **WebSocket for Real-Time**
   ```typescript
   useEffect(() => {
     const ws = new WebSocket('ws://api.oceara.com')
     ws.onmessage = (event) => {
       const update = JSON.parse(event.data)
       updateProject(update.id, update.data)
     }
   }, [])
   ```

3. **Database (MongoDB/PostgreSQL)**
   - Store projects persistently
   - Handle concurrent updates
   - Maintain transaction history

## Testing Data Flow

### Test 1: Landowner → Admin
1. Go to Landowner page
2. Register new project
3. Go to Admin page
4. Verify project appears in pending queue

### Test 2: Admin → Buyer
1. Go to Admin page
2. Approve a pending project
3. Go to Buyer page
4. Verify project appears in marketplace

### Test 3: Cross-Updates
1. Open Landowner page in one tab
2. Open Admin page in another tab
3. Approve project in Admin
4. Refresh Landowner page
5. Verify status updated

## Benefits

✅ **Single Source of Truth** - All data in one place  
✅ **Automatic Sync** - Changes propagate instantly  
✅ **Type Safety** - TypeScript ensures data consistency  
✅ **Easy Debugging** - Clear data flow  
✅ **Scalable** - Easy to add new features  
✅ **Testable** - Can mock context in tests  

## Future Enhancements

1. **User Authentication**
   - Track actual user IDs
   - Permission-based access

2. **Optimistic Updates**
   - Update UI immediately
   - Sync with backend later

3. **Conflict Resolution**
   - Handle simultaneous edits
   - Version control

4. **Audit Trail**
   - Log all changes
   - Who changed what and when

5. **Notifications**
   - Alert users of status changes
   - Email/push notifications

