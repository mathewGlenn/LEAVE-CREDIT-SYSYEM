# Sidebar Active Menu Item Highlighting

## Overview

The LCMS application now highlights the active menu item in the sidebar based on the current page. This provides visual feedback to users about their current location in the application.

## Implementation Details

### CSS Styling

The active menu item is styled with:

- Background color: `#c7ecee`
- Bold font weight

This styling is defined in `CSS/sidebar.css`:

```css
/* Active menu item styling */
.menu-item.active {
  background-color: #c7ecee;
  font-weight: bold;
}
```

### JavaScript Logic

Each sidebar component contains JavaScript that:

1. Gets the current page filename from the URL
2. Compares it with each menu item's href attribute
3. Adds the `active` class to the matching menu item

```javascript
// Get the current page filename
const currentPage = window.location.pathname.split("/").pop();

// Add active class to current page's menu item
document.querySelectorAll(".sidebar .menu-item").forEach((item) => {
  if (!item.getAttribute("href")) return; // Skip if not a link (e.g., separator)

  const itemPath = item.getAttribute("href").split("/").pop();
  if (itemPath === currentPage) {
    item.classList.add("active");
    console.log("Active menu item: " + currentPage);
  }
});
```

## Testing

You can test the active menu highlighting by:

1. Opening any page with the reusable sidebar
2. Observing that the menu item corresponding to the current page has a light blue background (#c7ecee)
3. Clicking on different menu items to see the highlighting update

The file `test-active-menu.html` can also be used to debug the active menu highlighting if needed.

## Troubleshooting

If the active menu item is not being highlighted properly:

1. Check if the page is using the reusable sidebar component
2. Verify that the page URL matches exactly with one of the href values in the sidebar
3. Ensure the sidebar CSS is properly linked in the page's head section
4. Check browser console for any JavaScript errors
