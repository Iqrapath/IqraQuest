# IqraQuest Loading Components - Quick Reference

## 🟢 PageLoadingIndicator (Automatic - Already Active!)
**Location:** `@/components/PageLoadingIndicator`
**Status:** ✅ Auto-integrated in AppProvider
**Shows:** Thin gradient progress bar at top
**When:** Every Inertia page navigation
**Action Required:** None - already working!

---

## 🔵 FullScreenLoader (Manual - Use for blocking operations)
**Location:** `@/components/FullScreenLoader`

### Usage Pattern:
```tsx
import FullScreenLoader from '@/components/FullScreenLoader';
import { useState } from 'react';

const [loading, setLoading] = useState(false);

// Before async operation
setLoading(true);
await someAsyncOperation();
setLoading(false);

// In JSX
{loading && <FullScreenLoader message="Processing..." />}
```

### Use For:
- ✅ Form submissions (approve/reject teacher, create course)
- ✅ Bulk operations (approve multiple teachers)
- ✅ File uploads (certificates, profile pictures)
- ✅ Payment processing
- ✅ Data exports

### Example Scenarios:
```tsx
// Teacher Approval
const handleApprove = async (teacherId) => {
    setApproving(true);
    await router.post(`/admin/teachers/${teacherId}/approve`);
    setApproving(false);
};
{approving && <FullScreenLoader message="Approving teacher..." />}

// Bulk Actions
const handleBulkApprove = async () => {
    setBulkProcessing(true);
    await processBulkApproval(selectedTeachers);
    setBulkProcessing(false);
};
{bulkProcessing && <FullScreenLoader message="Processing teachers..." />}
```

---

## 🟣 Skeleton Components (Manual - Use while fetching data)
**Location:** `@/components/Skeletons`

### Available Components:
1. `Skeleton` - Base component
2. `TableRowSkeleton` - For table rows
3. `CardSkeleton` - For card layouts
4. `StatCardSkeleton` - For dashboard stats
5. `ProfileSkeleton` - For user/teacher profiles
6. `ListSkeleton` - For lists

### Usage Pattern:
```tsx
import { TableRowSkeleton, CardSkeleton } from '@/components/Skeletons';

{loading ? (
    <TableRowSkeleton columns={5} />
) : (
    <ActualDataRow data={data} />
)}
```

### Use For:
- ✅ Loading teacher lists
- ✅ Loading dashboard stats
- ✅ Loading pending applications
- ✅ Loading booking details
- ✅ Loading any async data

### Example Scenarios:

#### Dashboard Stats:
```tsx
import { StatCardSkeleton } from '@/components/Skeletons';

<div className="grid grid-cols-4 gap-4">
    {isLoading ? (
        <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </>
    ) : (
        stats.map(stat => <StatCard key={stat.id} {...stat} />)
    )}
</div>
```

#### Teacher Table:
```tsx
import { TableRowSkeleton } from '@/components/Skeletons';

<table>
    <thead>...</thead>
    <tbody>
        {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={6} />
            ))
        ) : (
            teachers.map(teacher => <TeacherRow key={teacher.id} {...teacher} />)
        )}
    </tbody>
</table>
```

#### Teacher Profile:
```tsx
import { ProfileSkeleton } from '@/components/Skeletons';

{isLoading ? (
    <ProfileSkeleton />
) : (
    <TeacherProfile teacher={teacher} />
)}
```

---

## 🎯 Decision Guide: Which Loader to Use?

| Scenario | Use |
|----------|-----|
| User clicks "Approve Teacher" button | `FullScreenLoader` |
| Fetching list of pending teachers | `TableRowSkeleton` |
| Loading dashboard statistics | `StatCardSkeleton` |
| Uploading certificate file | `FullScreenLoader` |
| Navigating to another page | Nothing (automatic) |
| Loading teacher profile details | `ProfileSkeleton` |
| Fetching payment history | `ListSkeleton` |
| Submitting feedback form | `FullScreenLoader` |
| Initial page load with server data | `Skeletons` |

---

## 📋 Common Patterns for IqraQuest

### Pattern 1: Inertia Page with Server Data (No loading needed!)
```tsx
export default function Teachers({ teachers }) {
    // Data already available from Inertia props
    return <TeacherTable teachers={teachers} />;
}
```

### Pattern 2: Client-Side Data Fetching
```tsx
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    return loading ? (
        <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    ) : (
        <StatsGrid stats={stats} />
    );
}
```

### Pattern 3: Action with Feedback
```tsx
const [processing, setProcessing] = useState(false);

const handleAction = async () => {
    setProcessing(true);
    try {
        await performAction();
        toast.success('Action completed!');
    } finally {
        setProcessing(false);
    }
};

return (
    <>
        {processing && <FullScreenLoader message="Processing..." />}
        <button onClick={handleAction}>Execute</button>
    </>
);
```

---

## 🚀 Quick Start Checklist for New Pages

When creating a new page, ask yourself:

- [ ] Does this page fetch data client-side? → Use `Skeletons`
- [ ] Does it have action buttons (approve, reject, delete)? → Use `FullScreenLoader`
- [ ] Does it show a table? → Use `TableRowSkeleton` while loading
- [ ] Does it show cards? → Use `CardSkeleton` while loading
- [ ] Is it a dashboard? → Use `StatCardSkeleton` for stat cards

**Note:** Page navigation loading is automatic - you don't need to do anything!
