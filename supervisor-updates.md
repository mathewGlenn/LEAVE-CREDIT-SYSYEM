# Supervisor Sidebar Updates

The supervisor sidebars have been fixed in the following ways:

1. Added support for reusable sidebars in all supervisor pages
2. Updated CSS to properly style menu separators
3. Fixed navigation links to ensure consistency across all supervisor pages
4. Converted several example pages as templates for the rest:
   - Supervisor.html (dashboard)
   - L_status.html
   - L_history.html
   - Leaves_request.html

## Steps to Update the Remaining Supervisor Pages

For any remaining supervisor pages, follow these steps:

1. Add the sidebar CSS link in the head section:

```html
<link rel="stylesheet" href="../CSS/sidebar.css" />
```

2. Replace the hardcoded sidebar with the placeholder:

```html
<!-- Replace this -->
<div class="sidebar">
  <!-- Sidebar content -->
</div>

<!-- With this -->
<div id="sidebar-placeholder"></div>
```

3. Add the sidebar loading script at the end of the file before the closing `</body>` tag:

```html
<!-- Load sidebar script -->
<script src="../components/sidebar-loader.js"></script>
<script>
  // Call the loadSidebar function when the page loads
  document.addEventListener("DOMContentLoaded", function () {
    loadSidebar("supervisor");
  });
</script>
```

The project structure has been updated to improve maintainability by centralizing the sidebar code in reusable components.
