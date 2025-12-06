# Quick Start for Frontend Developer

**TL;DR:** Backend is done. Connect to it using Convex hooks. Build the UI.

---

## 🚀 Setup (5 minutes)

```bash
npm install
npm run dev
```

Backend is already running (your teammate handles it).

---

## 🔌 Connect to Backend (Copy-Paste Ready)

```typescript
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

// Read data
const dashboard = useQuery(api.queries.dashboard.getSuperadminDashboard)

// Write data
const approveVendor = useMutation(api.mutations.superadmin.approveVendor)
```

---

## 📋 What to Build

### 1. **Superadmin Dashboard** (`src/pages/SuperadminDashboard.tsx`)
- Show stats: organizers, events, vendors, sponsors
- List pending vendors with "Approve" button
- Show recent events

### 2. **Organizer Dashboard** (`src/pages/OrganizerDashboard.tsx`)
- Show stats: total events, upcoming events
- List all events with sponsor/vendor counts
- "Create Event" form

### 3. **Vendor Application** (`src/pages/VendorApplication.tsx`)
- Public form (no login required)
- Apply vendor to event

---

## 💡 Quick Example

```typescript
export function SuperadminDashboard() {
  const data = useQuery(api.queries.dashboard.getSuperadminDashboard)
  
  if (data === undefined) return <div>Loading...</div>
  if (data === null) return <div>Access denied</div>
  
  return (
    <div>
      <h1>Events: {data.stats.totalEvents}</h1>
      {data.pendingVendors.map(v => (
        <div key={v.id}>{v.name}</div>
      ))}
    </div>
  )
}
```

---

## 📚 Full Documentation

- **`FRONTEND_DEVELOPER_INSTRUCTIONS.md`** - Complete guide with examples
- **`FRONTEND_INTEGRATION.md`** - Detailed integration docs
- **`CONNECTION_EXAMPLE.md`** - Visual connection guide

---

## ✅ Available Backend Functions

**Queries:**
- `api.queries.dashboard.getSuperadminDashboard` (superadmin only)
- `api.queries.dashboard.getOrganizerDashboard` (organizer only)

**Mutations:**
- `api.mutations.superadmin.approveVendor({ vendorId })` (superadmin)
- `api.mutations.events.createEvent({ title, date })` (organizer)
- `api.mutations.events.vendorApply({ eventId, vendorId })` (public)

---

**That's it!** Read `FRONTEND_DEVELOPER_INSTRUCTIONS.md` for complete details.

