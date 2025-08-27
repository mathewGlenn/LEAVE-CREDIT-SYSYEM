# SweetAlert Implementation Guide for LCMS

## Overview

This guide explains how to implement SweetAlert2 for enhanced user interface dialogs in the Leave Credit Management System (LCMS). SweetAlert provides beautiful, responsive, and customizable popup dialogs that replace the standard browser alerts.

## Files Created

### 1. `js/sweetalert-utils.js`

Contains utility functions for common SweetAlert operations:

- `showSuccessAlert()` - Success messages
- `showErrorAlert()` - Error messages
- `showWarningAlert()` - Warning messages
- `showInfoAlert()` - Information messages
- `showConfirmationDialog()` - General confirmation dialogs
- `showDeleteConfirmation()` - Delete confirmation dialogs
- `showLogoutConfirmation()` - Logout confirmation dialogs
- `showLoadingDialog()` - Loading indicators
- `showToast()` - Toast notifications
- `showFormDialog()` - Form input dialogs
- `closeDialog()` - Close any open dialog

### 2. `CSS/sweetalert-custom.css`

Custom styling for SweetAlert dialogs to match the LCMS theme:

- Custom background color (#e6f3f5) matching LCMS design
- Custom colors matching LCMS design
- Responsive design
- Form dialog styling
- Dark mode support (future-ready)

### 3. `demo-sweetalert.html`

Demonstration page showing all SweetAlert functions in action with the custom background color.

## Integration Steps

### Step 1: Add Required Scripts and Styles

Add these to the `<head>` section of any page where you want to use SweetAlert:

```html
<!-- SweetAlert2 CDN -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<!-- SweetAlert Custom CSS -->
<link rel="stylesheet" href="../CSS/sweetalert-custom.css" />
<!-- SweetAlert Utility Functions -->
<script src="../js/sweetalert-utils.js"></script>
```

### Step 2: Update Existing Pages

For pages that already use alerts or confirmations, simply replace the existing calls:

#### Before (using standard alerts):

```javascript
if (confirm("Are you sure you want to delete this item?")) {
  // Delete logic
}

alert("Item deleted successfully!");
```

#### After (using SweetAlert):

```javascript
showDeleteConfirmation("Item Name", () => {
  // Delete logic
  showSuccessAlert("Success!", "Item deleted successfully!");
});
```

## Current Implementation Status

### ✅ Implemented

- **Logout confirmation** in `components/sidebar-loader.js`
- **Logout confirmation** in `js/auth-utils.js`
- Fallback to standard `confirm()` if SweetAlert is not available

### 🔄 Ready for Implementation

The following pages can now use SweetAlert by adding the required scripts:

#### HR Pages

- `HR_HTML/HR.html`
- `HR_HTML/Leave_Approval.html`
- `HR_HTML/Manage_Employee.html`
- `HR_HTML/Track_Employee.html`
- `HR_HTML/HR_Reports.html`
- `HR_HTML/Employee_Details.html`

#### Employee Pages

- `EMPLOYEE_HTML/employee html.html`
- `EMPLOYEE_HTML/leave balance html.html`
- `EMPLOYEE_HTML/leave history html.html`
- `EMPLOYEE_HTML/leave status html.html`
- `EMPLOYEE_HTML/leave-details.html`
- `EMPLOYEE_HTML/req leave html.html`

#### Supervisor Pages

- `SUPERVISOR_HTML/Supervisor.html`
- `SUPERVISOR_HTML/Edit_profile.html`
- `SUPERVISOR_HTML/L_history.html`
- `SUPERVISOR_HTML/L_status.html`
- `SUPERVISOR_HTML/Leaves_approved.html`
- `SUPERVISOR_HTML/Leaves_request.html`
- `SUPERVISOR_HTML/Request_leave.html`

#### Root Pages

- `index.html`
- `login.html`
- `register.html`

## Common Use Cases

### 1. Form Submission Success

```javascript
// After successful form submission
showSuccessAlert(
  "Request Submitted!",
  "Your leave request has been submitted successfully."
);
```

### 2. Form Validation Errors

```javascript
// When form validation fails
showErrorAlert("Validation Error", "Please fill in all required fields.");
```

### 3. Delete Confirmations

```javascript
// Before deleting an item
showDeleteConfirmation("Leave Request #123", () => {
  deleteLeaveRequest(123);
});
```

### 4. Loading States

```javascript
// Show loading during API calls
showLoadingDialog("Submitting", "Please wait while we process your request...");

// Close when done
fetch("/api/submit-leave")
  .then(() => {
    closeDialog();
    showSuccessAlert("Success!", "Leave request submitted.");
  })
  .catch(() => {
    closeDialog();
    showErrorAlert("Error", "Failed to submit request.");
  });
```

### 5. Toast Notifications

```javascript
// Quick notifications
showToast("Saved successfully!", "success");
showToast("Warning: Unsaved changes", "warning");
```

### 6. Form Input Dialogs

```javascript
// Get user input
const fields = {
  reason: {
    label: "Rejection Reason",
    type: "textarea",
    required: true,
    placeholder: "Please provide a reason for rejection",
  },
};

showFormDialog("Reject Leave Request", fields, (formData) => {
  rejectLeaveRequest(requestId, formData.reason);
});
```

## Fallback Mechanism

The implementation includes fallback mechanisms:

- If SweetAlert is not loaded, functions fall back to standard browser dialogs
- Graceful degradation ensures the system works even if CDN is unavailable

## Customization

### Custom Styling

Modify `CSS/sweetalert-custom.css` to adjust:

- Background color (currently set to #e6f3f5 to match LCMS theme)
- Colors to match brand guidelines
- Fonts and typography
- Button styles
- Animation effects

### Custom Functions

Add new utility functions to `js/sweetalert-utils.js` for specific use cases:

```javascript
function showLeaveApprovalDialog(leaveRequest, onApprove, onReject) {
  // Custom dialog for leave approval with detailed information
}
```

## Benefits

1. **Enhanced User Experience**: Beautiful, modern dialogs
2. **Consistency**: Standardized appearance across all pages
3. **Accessibility**: Better keyboard navigation and screen reader support
4. **Responsiveness**: Works well on mobile devices
5. **Customization**: Easy to match brand guidelines
6. **Future-proof**: Can be enhanced with additional features

## Testing

Use the demo page (`demo-sweetalert.html`) to:

- Test all SweetAlert functions
- Verify styling matches LCMS theme
- Check responsiveness on different devices
- Test fallback mechanisms

## Maintenance

- Keep SweetAlert2 CDN updated for security and features
- Monitor custom CSS for compatibility with new SweetAlert versions
- Test fallback mechanisms regularly
- Update utility functions as new use cases arise

## Performance Considerations

- SweetAlert2 is loaded from CDN for better caching
- Custom CSS file is minimal and optimized
- Utility functions use efficient checks for library availability
- No impact on pages that don't use SweetAlert
