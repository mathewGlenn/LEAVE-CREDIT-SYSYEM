# Leave Request System Implementation

## Overview

This document describes the implementation of the employee leave request functionality for the LCMS (Leave Credit Management System).

## Process Flow

1. **Employee Request**: Employee submits a leave request through the form
2. **Supervisor Approval**: Supervisor reviews and approves/rejects the request
3. **HR Approval**: HR provides final approval/rejection
4. **Credit Deduction**: Credits are deducted only after final HR approval
5. **Cancellation**: Employees can cancel requests (with credit restoration if needed)

## Files Created/Modified

### New Files

- `js/leave-request.js` - Main leave request functionality
- `js/leave-status-manager.js` - Leave status management and credit handling
- `test-leave-request.html` - Test page for functionality validation

### Modified Files

- `EMPLOYEE_HTML/req leave html.html` - Updated with Firebase integration and new functionality
- `CSS/Req_leave.css` - Enhanced styling for file uploads and form elements

## Features Implemented

### 1. Enhanced Leave Request Form

- **Date Pickers**: Start and end dates with popup calendars
- **Auto-calculation**: Number of days calculated automatically
- **File Upload**: Supporting documents saved to Firebase Storage
- **Validation**: Comprehensive form and business logic validation

### 2. Credit Management

- **Credit Validation**: Checks available credits before submission
- **Credit Deduction**: Automatic deduction upon final approval
- **Credit Restoration**: Restores credits when approved leaves are cancelled

### 3. File Upload System

- **File Validation**: Type and size restrictions (PDF, DOC, DOCX, JPG, PNG, max 10MB)
- **Cloud Storage**: Files stored in Firebase Storage
- **Progress Tracking**: Visual feedback during upload

### 4. Status Management

- **Workflow States**:
  - `pending_supervisor` - Waiting for supervisor approval
  - `pending_hr` - Supervisor approved, waiting for HR
  - `approved` - Fully approved by HR
  - `rejected_supervisor` - Rejected by supervisor
  - `rejected_hr` - Rejected by HR
  - `cancelled` - Cancelled by employee

## Database Structure

### Leave Request Document (`leaveRequests` collection)

```javascript
{
  employeeId: "string",
  employeeName: "string",
  employeeEmail: "string",
  department: "string",
  designation: "string",
  leaveType: "string", // vacation, sick, personal, emergency, maternity, service
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD",
  numberOfDays: number,
  reasonNotes: "string",
  status: "string", // pending_supervisor, pending_hr, approved, etc.
  supervisorApproval: {
    status: "string", // pending, approved, rejected
    approvedBy: "string",
    approvedAt: timestamp,
    comments: "string"
  },
  hrApproval: {
    status: "string",
    approvedBy: "string",
    approvedAt: timestamp,
    comments: "string"
  },
  supportingDocuments: [
    {
      name: "string",
      url: "string",
      uploadedAt: "string"
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
  // Optional fields for cancellation
  cancellationReason: "string",
  cancelledAt: timestamp
}
```

### Leave Type Mapping

- `vacation` → `regularLeave`
- `sick` → `sickLeave`
- `personal` → `specialLeave`
- `emergency` → `emergencyLeave`
- `maternity` → `maternityLeave`
- `service` → `serviceLeave`

## API Methods

### LeaveRequestManager Class

- `initializeDatePickers()` - Sets up date picker functionality
- `calculateDays()` - Auto-calculates days between dates
- `handleFileSelection()` - Manages file upload and validation
- `uploadFilesToStorage()` - Uploads files to Firebase Storage
- `validateLeaveCredits()` - Checks if user has sufficient credits
- `handleFormSubmit()` - Processes form submission

### LeaveStatusManager Class

- `updateLeaveStatus()` - Updates request status (for supervisors/HR)
- `deductLeaveCredits()` - Deducts credits upon approval
- `restoreLeaveCredits()` - Restores credits upon cancellation
- `cancelLeaveRequest()` - Cancels a leave request
- `getUserLeaveRequests()` - Gets user's leave requests
- `getPendingLeaveRequests()` - Gets pending requests for supervisors
- `getAllLeaveRequests()` - Gets all requests for HR

## Security Considerations

- Authentication required for all operations
- User can only access their own leave requests
- Credit validation prevents over-booking
- File upload restrictions prevent malicious files
- Proper error handling and user feedback

## Testing

Use `test-leave-request.html` to validate:

- User authentication
- Data fetching from Firestore
- Leave request creation
- File upload functionality
- Credit validation

## Usage Instructions

### For Employees

1. Navigate to the Request Leave page
2. Select leave type from dropdown
3. Choose start and end dates using date pickers
4. Number of days will be calculated automatically
5. Enter reason for leave
6. Optionally upload supporting documents
7. Submit the request

### For Supervisors/HR

Use the LeaveStatusManager methods to:

- Fetch pending requests
- Approve/reject requests
- Add comments for decisions

## Future Enhancements

- Email notifications for status changes
- Calendar integration for leave scheduling
- Advanced reporting and analytics
- Mobile app support
- Integration with payroll systems
