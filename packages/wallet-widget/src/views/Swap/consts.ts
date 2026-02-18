/**
 * Custom CSS to style the Trails widget to match the Sequence design system.
 *
 * Color mapping (Sequence Design System -> Trails Variables):
 * - seq-color-background-primary (#000000 black) -> trails-bg-primary
 * - seq-color-background-secondary (#18181b zinc-900) -> trails-bg-secondary
 * - seq-color-background-raised (#27272a zinc-800) -> trails-bg-card, trails-bg-tertiary
 * - seq-color-background-muted (#09090b zinc-950) -> used for inputs/dropdowns
 * - seq-color-border-normal (#3f3f46 zinc-700) -> trails-border-primary
 * - seq-color-border-hover (#52525b zinc-600) -> trails-border-secondary
 * - seq-color-border-focus (#8b5cf6 violet-500) -> focus borders
 */
export const TRAILS_CUSTOM_CSS = `
  /* Background Colors */
  --trails-bg-primary: rgb(0, 0, 0) !important;
  --trails-bg-secondary: rgba(255, 255, 255, 0.1) !important;
  --trails-bg-secondary-hover: rgba(255, 255, 255, 0.08) !important;
  --trails-bg-secondary-focus-border: rgb(63 63 70) !important;
  --trails-bg-tertiary: rgb(39 39 42) !important;
  --trails-bg-card: rgb(24 24 27) !important;
  --trails-bg-overlay: rgb(0 0 0) !important;
  
  /* Text Colors */
  --trails-text-primary: rgb(255 255 255) !important;
  --trails-text-secondary: rgba(255 255 255 / 0.8) !important;
  --trails-text-tertiary: rgba(255 255 255 / 0.6) !important;
  --trails-text-muted: rgb(113 113 122) !important;
  --trails-text-inverse: rgb(0 0 0) !important;
  
  /* Border Colors */
  --trails-border-primary: rgb(63 63 70) !important;
  --trails-border-secondary: rgb(82 82 91) !important;
  --trails-border-tertiary: rgb(39 39 42) !important;
  
  /* Interactive Colors */
  --trails-hover-bg: rgb(24 24 27) !important;
  --trails-hover-text: rgb(255 255 255) !important;
  
  /* Input Field Colors */
  --trails-input-bg: rgb(0 0 0) !important;
  --trails-input-border: rgb(39 39 42) !important;
  --trails-input-text: rgb(255 255 255) !important;
  --trails-input-placeholder: rgb(113 113 122) !important;
  --trails-input-focus-border: rgb(139 92 246) !important;
  
  /* Dropdown Colors */
  --trails-dropdown-bg: rgb(0 0 0) !important;
  --trails-dropdown-border: rgb(39 39 42) !important;
  --trails-dropdown-text: rgb(255 255 255) !important;
  --trails-dropdown-hover-bg: rgb(24 24 27) !important;
  --trails-dropdown-selected-bg: rgb(39 39 42) !important;
  --trails-dropdown-selected-text: rgb(255 255 255) !important;
  --trails-dropdown-focus-border: rgb(139 92 246) !important;
  
  /* Modal Button Colors */
  --trails-modal-button-bg: transparent !important;
  --trails-modal-button-hover-bg: rgba(255 255 255 / 0.1) !important;
  --trails-modal-button-text: rgb(255 255 255) !important;
  --trails-modal-button-shadow: 0 1px 2px 0 rgba(0 0 0 / 0.1) !important;
  
  /* Token List Colors */
  --trails-list-bg: rgb(0 0 0) !important;
  --trails-list-border: rgb(39 39 42) !important;
  --trails-list-hover-bg: rgb(24 24 27) !important;
  --trails-list-item-bg: transparent !important;
  --trails-list-item-selected-bg: rgb(39 39 42) !important;
  
  /* Widget Border and Radius */
  --trails-widget-border: none !important;
  --trails-border-radius-widget: 24px !important;
  --trails-border-radius-button: 8px !important;
  --trails-border-radius-input: 8px !important;
  --trails-border-radius-dropdown: 8px !important;
  --trails-border-radius-container: 8px !important;
  --trails-border-radius-list: 8px !important;
  --trails-border-radius-list-button: 8px !important;
  --trails-border-radius-large-button: 8px !important;
  
  /* Status Colors */
  --trails-success-bg: rgba(34 197 94 / 0.2) !important;
  --trails-success-text: rgb(34 197 94) !important;
  --trails-success-border: rgba(34 197 94 / 0.3) !important;
  
  --trails-warning-bg: rgba(234 179 8 / 0.2) !important;
  --trails-warning-text: rgb(234 179 8) !important;
  --trails-warning-border: rgba(234 179 8 / 0.3) !important;
  
  --trails-error-bg: rgba(239 68 68 / 0.2) !important;
  --trails-error-text: rgb(239 68 68) !important;
  --trails-error-border: rgba(239 68 68 / 0.3) !important;
  
  /* Shadow */
  --trails-shadow: 0 4px 6px -1px rgba(0 0 0 / 0.1), 0 2px 4px -1px rgba(0 0 0 / 0.06) !important;
  
  /* Primary Button */
  --trails-primary-disabled: rgb(63 63 70) !important;
  --trails-primary-disabled-text: rgb(113 113 122) !important;
  
  /* Percentage Button Colors */
  --trails-percentage-button-bg: rgb(24 24 27) !important;
  --trails-percentage-button-text: rgb(161 161 170) !important;
  --trails-percentage-button-hover-bg: rgb(39 39 42) !important;
  
  /* Font Family */
  --trails-font-family: 'Inter', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" !important;
}
/* ========================================
 * Direct Tailwind Class Overrides
 * Override hard-coded Tailwind classes used in Trails components
 * ======================================== */
/* White backgrounds -> black */
.bg-white,
.dark\\:bg-gray-900 {
  background-color: rgb(0 0 0) !important;
}
/* Gray-800 backgrounds -> black */
.bg-gray-800,
.dark\\:bg-gray-800 {
  background-color: rgb(0 0 0) !important;
}
/* Gray-700 backgrounds -> zinc-800 */
.bg-gray-700,
.dark\\:bg-gray-700 {
  background-color: rgb(39 39 42) !important;
}
/* Hover states */
.hover\\:bg-gray-50:hover {
  background-color: rgb(24 24 27) !important;
}
.dark\\:hover\\:bg-gray-800:hover {
  background-color: rgb(24 24 27) !important;
}
.dark\\:hover\\:bg-gray-700:hover {
  background-color: rgb(39 39 42) !important;
}
/* Focus states */
.focus-within\\:\\!bg-white:focus-within {
  background-color: rgb(0 0 0) !important;
}
.dark\\:focus-within\\:\\!bg-gray-800:focus-within {
  background-color: rgb(0 0 0) !important;
}
/* Border colors */
.border-gray-200 {
  border-color: rgb(39 39 42) !important;
}
.dark\\:border-gray-700 {
  border-color: rgb(39 39 42) !important;
}
.border-gray-300 {
  border-color: rgb(63 63 70) !important;
}
.dark\\:border-gray-600 {
  border-color: rgb(63 63 70) !important;
}
/* Text colors */
.text-gray-900 {
  color: rgb(255 255 255) !important;
}
.dark\\:text-white {
  color: rgb(255 255 255) !important;
}
.text-gray-500,
.dark\\:text-gray-400 {
  color: rgb(161 161 170) !important;
}
.text-black,
.dark\\:text-blue-300 {
  color: rgb(255 255 255) !important;
}
/* Primary button gradient - Match Sequence design */
.bg-blue-500 {
  background: linear-gradient(89.69deg, #4411e1 0.27%, #7537f9 99.73%) !important;
}
.hover\\:bg-blue-600:hover {
  background: linear-gradient(89.69deg, #3a0ec7 0.27%, #6229e0 99.73%) !important;
  opacity: 0.9;
}
`

export const TRAILS_CUSTOM_CSS_LIGHT = `
  --trails-bg-primary: bg-background-primary !important; 

  .shadow-xl {
    --tw-shadow: 0 0 #0000 !important;
    --tw-shadow-colored: 0 0 #0000 !important;
    box-shadow: none !important;
  }
`
