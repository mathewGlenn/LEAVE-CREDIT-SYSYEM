# Supervisor Leave Management Implementation

## Overview

This implementation provides supervisors with the ability to view and manage employee leave requests and approved leaves for employees in their department.

## Features Implemented

### 1. **Employee Leave Requests Page (Leaves_request.html)**

- **URL**: `/SUPERVISOR_HTML/Leaves_request.html`
- **Purpose**: Shows pending leave requests from employees in supervisor's department
- **Functionality**:
  - Displays all pending leave requests (`status: 'pending_supervisor'`)
  - Filters by supervisor's department
  - Provides approve/reject actions
  - Shows detailed request information on click
  - Real-time updates after approval/rejection

### 2. **Supervisor Approved Leaves Page (Leaves_approved.html)**

- **URL**: `/SUPERVISOR_HTML/Leaves_approved.html`
- **Purpose**: Shows all leaves approved by the supervisor
- **Functionality**:
  - Displays requests with `supervisorApproval.status: 'approved'`
  - Shows final status (may still be pending HR or fully approved)
  - Filters by supervisor's department
  - Click to view detailed information

## Database Queries

### Pending Requests Query

```javascript
firebase
  .firestore()
  .collection("leaveRequests")
  .where("department", "==", supervisorDepartment)
  .where("status", "==", "pending_supervisor")
  .orderBy("createdAt", "desc");
```

### Approved Requests Query

```javascript
firebase
  .firestore()
  .collection("leaveRequests")
  .where("department", "==", supervisorDepartment)
  .orderBy("createdAt", "desc");
// Client-side filter: supervisorApproval.status === 'approved'
```

## Workflow Process

### Leave Request Approval Flow

1. **Employee submits request** → `status: 'pending_supervisor'`
2. **Supervisor approves** → `status: 'pending_hr'`, `supervisorApproval.status: 'approved'`
3. **Supervisor rejects** → `status: 'rejected_supervisor'`, `supervisorApproval.status: 'rejected'`
4. **HR final approval** → `status: 'approved'` (if HR approves)
5. **HR rejection** → `status: 'rejected_hr'` (if HR rejects)

### Supervisor Actions

- **Approve**: Sets supervisor approval and forwards to HR
- **Reject**: Sets supervisor rejection and ends the process
- **View Details**: Shows comprehensive request information

## Technical Implementation

### JavaScript Files

- **`supervisor-leave-manager.js`**: Main functionality for handling supervisor operations
- **`supervisor-leave-display-manager.js`**: Extended display manager for supervisor-specific views

### Key Classes

- **`SupervisorLeaveManager`**: Handles employee request management
- **`SupervisorLeaveDisplayManager`**: Extends base display manager for supervisor views

### Authentication & Authorization

- Supervisor role verification using `checkAuthAndRole('supervisor')`
- Department-based filtering for security
- Firebase authentication integration

### UI Components

- **SweetAlert2**: For approval/rejection dialogs and notifications
- **Interactive Tables**: Click to view details, hover effects
- **Action Buttons**: Approve/Reject with confirmation dialogs
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## Database Structure Requirements

### Leave Request Document Structure

```javascript
{
  employeeId: "string",
  employeeName: "string",
  employeeEmail: "string",
  department: "string",    // Used for filtering
  designation: "string",
  leaveType: "string",
  startDate: "string",
  endDate: "string",
  numberOfDays: number,
  reasonNotes: "string",
  status: "string",        // pending_supervisor, pending_hr, approved, etc.
  supervisorApproval: {
    status: "string",      // pending, approved, rejected
    approvedBy: "string",  // supervisor UID
    approvedAt: timestamp,
    comments: "string"
  },
  hrApproval: {
    status: "string",
    approvedBy: "string",
    approvedAt: timestamp,
    comments: "string"
  },
  supportingDocuments: [],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### User Document Structure (Supervisor)

```javascript
{
  name: "string",
  email: "string",
  department: "string",    // Critical for filtering
  designation: "string",
  // ... other user fields
}
```

## Security Features

- **Department-based access control**: Supervisors only see their department's employees
- **Role-based authentication**: Supervisor role verification
- **Audit trail**: All approval actions are logged with timestamps and comments
- **Firebase rules**: Should be configured to enforce department-based access

## User Experience Features

- **Responsive design**: Works on desktop and mobile
- **Real-time updates**: Immediate feedback after actions
- **Detailed views**: Comprehensive request information
- **Intuitive interface**: Clear action buttons and status indicators
- **Loading states**: Users know when operations are in progress
- **Error handling**: Clear error messages and recovery options

## CSS Styling

- Uses existing `Leave_status.css` for consistent styling
- Added action button styles
- Responsive table design
- Hover effects and transitions
- Status badge styling

## Future Enhancements

1. **Bulk Actions**: Approve/reject multiple requests at once
2. **Filtering**: Filter by leave type, date range, employee
3. **Export**: Export approved leaves to Excel/PDF
4. **Notifications**: Email notifications for approvals/rejections
5. **Comments**: Required comments for rejections
6. **Delegation**: Temporary supervisor delegation
7. **Analytics**: Leave patterns and statistics
