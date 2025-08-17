# Leave Credit Management System (LCMS) - Restructuring Guide

This project has been restructured to make the sidebars reusable and improve maintainability. Below are the changes made and instructions for updating remaining files.

## Changes Made

1. **Reusable Sidebars:**

   - Created sidebar components in the `components/` directory:
     - `employee-sidebar.html`: Sidebar for employee pages
     - `hr-sidebar.html`: Sidebar for HR pages
     - `supervisor-sidebar.html`: Sidebar for supervisor pages
   - Created a JavaScript loader (`sidebar-loader.js`) to dynamically insert the sidebars

2. **Dedicated Login System:**
   - Created a separate `login.html` page for authentication
   - Updated `index.html` to serve as a role selection page

## How to Update Remaining HTML Files

Follow these steps to update all HTML files that have not yet been converted:

### For Employee HTML Files:

1. Replace the hardcoded sidebar with the sidebar placeholder:

```html
<!-- Replace this -->
<div class="sidebar">
  <!-- Sidebar content -->
</div>

<!-- With this -->
<div id="sidebar-placeholder"></div>
```

2. Add the sidebar CSS and loader script before the closing `</body>` tag:

```html
<link rel="stylesheet" href="../CSS/sidebar.css" />

<!-- Load sidebar script -->
<script src="../components/sidebar-loader.js"></script>
<script>
  // Call the loadSidebar function when the page loads
  document.addEventListener("DOMContentLoaded", function () {
    loadSidebar("employee");
  });
</script>
```

### For HR HTML Files:

1. Replace the hardcoded sidebar with the sidebar placeholder:

```html
<!-- Replace this -->
<div class="sidebar">
  <!-- Sidebar content -->
</div>

<!-- With this -->
<div id="sidebar-placeholder"></div>
```

2. Add the sidebar CSS and loader script before the closing `</body>` tag:

```html
<link rel="stylesheet" href="../CSS/sidebar.css" />

<!-- Load sidebar script -->
<script src="../components/sidebar-loader.js"></script>
<script>
  // Call the loadSidebar function when the page loads
  document.addEventListener("DOMContentLoaded", function () {
    loadSidebar("hr");
  });
</script>
```

### For Supervisor HTML Files:

1. Replace the hardcoded sidebar with the sidebar placeholder:

```html
<!-- Replace this -->
<div class="sidebar">
  <!-- Sidebar content -->
</div>

<!-- With this -->
<div id="sidebar-placeholder"></div>
```

2. Add the sidebar CSS and loader script before the closing `</body>` tag:

```html
<link rel="stylesheet" href="../CSS/sidebar.css" />

<!-- Load sidebar script -->
<script src="../components/sidebar-loader.js"></script>
<script>
  // Call the loadSidebar function when the page loads
  document.addEventListener("DOMContentLoaded", function () {
    loadSidebar("supervisor");
  });
</script>
```

## Notes on Authentication

Currently, there is no backend implemented, so the login form in `login.html` simply redirects to the appropriate dashboard based on the selected role. When a backend is implemented, you'll need to update the login form actions to point to your authentication endpoints.

## File Structure

- `components/`: Contains reusable components (sidebars and script)
- `CSS/`: Contains CSS files for styling
- `EMPLOYEE_HTML/`: HTML files for employee views
- `HR_HTML/`: HTML files for HR views
- `SUPERVISOR_HTML/`: HTML files for supervisor views
- `index.html`: Main landing page with role selection
- `login.html`: Login page for all user types
