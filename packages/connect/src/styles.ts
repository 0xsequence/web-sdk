export const styles = String.raw`
/*! tailwindcss v4.1.17 | MIT License | https://tailwindcss.com */
@layer properties;
@layer theme, base, components, utilities;
@layer theme {
  :root, :host {
    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --color-red-200: oklch(88.5% 0.062 18.334);
    --color-red-400: oklch(70.4% 0.191 22.216);
    --color-red-500: oklch(63.7% 0.237 25.331);
    --color-red-600: oklch(57.7% 0.245 27.325);
    --color-red-700: oklch(50.5% 0.213 27.518);
    --color-red-900: oklch(39.6% 0.141 25.723);
    --color-red-950: oklch(25.8% 0.092 26.042);
    --color-yellow-100: oklch(97.3% 0.071 103.193);
    --color-yellow-400: oklch(85.2% 0.199 91.936);
    --color-yellow-500: oklch(79.5% 0.184 86.047);
    --color-yellow-700: oklch(55.4% 0.135 66.442);
    --color-yellow-900: oklch(42.1% 0.095 57.708);
    --color-yellow-950: oklch(28.6% 0.066 53.813);
    --color-green-200: oklch(92.5% 0.084 155.995);
    --color-green-400: oklch(79.2% 0.209 151.711);
    --color-green-500: oklch(72.3% 0.219 149.579);
    --color-green-600: oklch(62.7% 0.194 149.214);
    --color-green-700: oklch(52.7% 0.154 150.069);
    --color-green-900: oklch(39.3% 0.095 152.535);
    --color-green-950: oklch(26.6% 0.065 152.934);
    --color-blue-500: oklch(62.3% 0.214 259.815);
    --color-indigo-200: oklch(87% 0.065 274.039);
    --color-indigo-400: oklch(67.3% 0.182 276.935);
    --color-indigo-500: oklch(58.5% 0.233 277.117);
    --color-indigo-600: oklch(51.1% 0.262 276.966);
    --color-indigo-700: oklch(45.7% 0.24 277.023);
    --color-indigo-900: oklch(35.9% 0.144 278.697);
    --color-indigo-950: oklch(25.7% 0.09 281.288);
    --color-violet-500: oklch(60.6% 0.25 292.717);
    --color-violet-600: oklch(54.1% 0.281 293.009);
    --color-slate-50: oklch(98.4% 0.003 247.858);
    --color-slate-100: oklch(96.8% 0.007 247.896);
    --color-slate-200: oklch(92.9% 0.013 255.508);
    --color-slate-300: oklch(86.9% 0.022 252.894);
    --color-slate-400: oklch(70.4% 0.04 256.788);
    --color-slate-500: oklch(55.4% 0.046 257.417);
    --color-slate-800: oklch(27.9% 0.041 260.031);
    --color-slate-950: oklch(12.9% 0.042 264.695);
    --color-gray-200: oklch(92.8% 0.006 264.531);
    --color-gray-300: oklch(87.2% 0.01 258.338);
    --color-gray-500: oklch(55.1% 0.027 264.364);
    --color-gray-900: oklch(21% 0.034 264.665);
    --color-zinc-500: oklch(55.2% 0.016 285.938);
    --color-zinc-600: oklch(44.2% 0.017 285.786);
    --color-zinc-700: oklch(37% 0.013 285.805);
    --color-zinc-800: oklch(27.4% 0.006 286.033);
    --color-zinc-900: oklch(21% 0.006 285.885);
    --color-zinc-950: oklch(14.1% 0.005 285.823);
    --color-black: #000;
    --color-white: #fff;
    --spacing: 0.25rem;
    --container-sm: 24rem;
    --container-md: 28rem;
    --container-lg: 32rem;
    --text-xs: 0.75rem;
    --text-xs--line-height: calc(1 / 0.75);
    --text-sm: 0.875rem;
    --text-sm--line-height: calc(1.25 / 0.875);
    --text-base: 1rem;
    --text-base--line-height: calc(1.5 / 1);
    --text-lg: 1.125rem;
    --text-lg--line-height: calc(1.75 / 1.125);
    --text-xl: 1.25rem;
    --text-xl--line-height: calc(1.75 / 1.25);
    --text-2xl: 1.5rem;
    --text-2xl--line-height: calc(2 / 1.5);
    --text-4xl: 2.25rem;
    --text-4xl--line-height: calc(2.5 / 2.25);
    --text-6xl: 3.75rem;
    --text-6xl--line-height: 1;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --tracking-normal: 0em;
    --tracking-wide: 0.025em;
    --tracking-widest: 0.1em;
    --leading-snug: 1.375;
    --radius-xs: 0.125rem;
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --animate-spin: spin 1s linear infinite;
    --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    --blur-xs: 4px;
    --blur-md: 12px;
    --default-transition-duration: 150ms;
    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    --default-font-family: var(--font-sans);
    --default-mono-font-family: "Roboto", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    --color-primary: var(--seq-color-primary);
  }
}
@layer base {
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid;
  }
  html, :host {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");
    font-feature-settings: var(--default-font-feature-settings, normal);
    font-variation-settings: var(--default-font-variation-settings, normal);
    -webkit-tap-highlight-color: transparent;
  }
  hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }
  abbr:where([title]) {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }
  a {
    color: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }
  b, strong {
    font-weight: bolder;
  }
  code, kbd, samp, pre {
    font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
    font-feature-settings: var(--default-mono-font-feature-settings, normal);
    font-variation-settings: var(--default-mono-font-variation-settings, normal);
    font-size: 1em;
  }
  small {
    font-size: 80%;
  }
  sub, sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  sub {
    bottom: -0.25em;
  }
  sup {
    top: -0.5em;
  }
  table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }
  :-moz-focusring {
    outline: auto;
  }
  progress {
    vertical-align: baseline;
  }
  summary {
    display: list-item;
  }
  ol, ul, menu {
    list-style: none;
  }
  img, svg, video, canvas, audio, iframe, embed, object {
    display: block;
    vertical-align: middle;
  }
  img, video {
    max-width: 100%;
    height: auto;
  }
  button, input, select, optgroup, textarea, ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    opacity: 1;
  }
  :where(select:is([multiple], [size])) optgroup {
    font-weight: bolder;
  }
  :where(select:is([multiple], [size])) optgroup option {
    padding-inline-start: 20px;
  }
  ::file-selector-button {
    margin-inline-end: 4px;
  }
  ::placeholder {
    opacity: 1;
  }
  @supports (not (-webkit-appearance: -apple-pay-button))  or (contain-intrinsic-size: 1px) {
    ::placeholder {
      color: currentcolor;
      @supports (color: color-mix(in lab, red, red)) {
        color: color-mix(in oklab, currentcolor 50%, transparent);
      }
    }
  }
  textarea {
    resize: vertical;
  }
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  ::-webkit-date-and-time-value {
    min-height: 1lh;
    text-align: inherit;
  }
  ::-webkit-datetime-edit {
    display: inline-flex;
  }
  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }
  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {
    padding-block: 0;
  }
  ::-webkit-calendar-picker-indicator {
    line-height: 1;
  }
  :-moz-ui-invalid {
    box-shadow: none;
  }
  button, input:where([type="button"], [type="reset"], [type="submit"]), ::file-selector-button {
    appearance: button;
  }
  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
    height: auto;
  }
  [hidden]:where(:not([hidden="until-found"])) {
    display: none !important;
  }
}
@layer utilities {
  .\@container\/field-group {
    container-type: inline-size;
    container-name: field-group;
  }
  .\@container {
    container-type: inline-size;
  }
  .pointer-events-none {
    pointer-events: none;
  }
  .visible {
    visibility: visible;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border-width: 0;
  }
  .absolute {
    position: absolute;
  }
  .fixed {
    position: fixed;
  }
  .relative {
    position: relative;
  }
  .sticky {
    position: sticky;
  }
  .inset-0 {
    inset: calc(var(--spacing) * 0);
  }
  .inset-2 {
    inset: calc(var(--spacing) * 2);
  }
  .inset-x-0 {
    inset-inline: calc(var(--spacing) * 0);
  }
  .inset-y-0 {
    inset-block: calc(var(--spacing) * 0);
  }
  .top-0 {
    top: calc(var(--spacing) * 0);
  }
  .top-1 {
    top: calc(var(--spacing) * 1);
  }
  .top-1\/2 {
    top: calc(1/2 * 100%);
  }
  .top-4 {
    top: calc(var(--spacing) * 4);
  }
  .top-\[-2px\] {
    top: -2px;
  }
  .top-\[50\%\] {
    top: 50%;
  }
  .right-0 {
    right: calc(var(--spacing) * 0);
  }
  .right-2 {
    right: calc(var(--spacing) * 2);
  }
  .right-4 {
    right: calc(var(--spacing) * 4);
  }
  .right-\[-18px\] {
    right: -18px;
  }
  .bottom-0 {
    bottom: calc(var(--spacing) * 0);
  }
  .left-0 {
    left: calc(var(--spacing) * 0);
  }
  .left-4 {
    left: calc(var(--spacing) * 4);
  }
  .left-\[50\%\] {
    left: 50%;
  }
  .z-1 {
    z-index: 1;
  }
  .z-2 {
    z-index: 2;
  }
  .z-10 {
    z-index: 10;
  }
  .z-20 {
    z-index: 20;
  }
  .z-30 {
    z-index: 30;
  }
  .z-50 {
    z-index: 50;
  }
  .z-1000 {
    z-index: 1000;
  }
  .order-first {
    order: -9999;
  }
  .order-last {
    order: 9999;
  }
  .grid-stack {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    grid-template-rows: repeat(1, minmax(0, 1fr));
    :is(& > *) {
      grid-column-start: 1;
    }
    :is(& > *) {
      grid-row-start: 1;
    }
  }
  .col-start-2 {
    grid-column-start: 2;
  }
  .col-start-3 {
    grid-column-start: 3;
  }
  .col-end-4 {
    grid-column-end: 4;
  }
  .row-start-3 {
    grid-row-start: 3;
  }
  .container {
    width: 100%;
    @media (width >= 40rem) {
      max-width: 40rem;
    }
    @media (width >= 48rem) {
      max-width: 48rem;
    }
    @media (width >= 64rem) {
      max-width: 64rem;
    }
    @media (width >= 80rem) {
      max-width: 80rem;
    }
    @media (width >= 96rem) {
      max-width: 96rem;
    }
  }
  .-m-\[1px\] {
    margin: calc(1px * -1);
  }
  .m-0 {
    margin: calc(var(--spacing) * 0);
  }
  .m-4 {
    margin: calc(var(--spacing) * 4);
  }
  .-mx-1 {
    margin-inline: calc(var(--spacing) * -1);
  }
  .mx-0 {
    margin-inline: calc(var(--spacing) * 0);
  }
  .mx-auto {
    margin-inline: auto;
  }
  .-my-2 {
    margin-block: calc(var(--spacing) * -2);
  }
  .my-0 {
    margin-block: calc(var(--spacing) * 0);
  }
  .my-1 {
    margin-block: calc(var(--spacing) * 1);
  }
  .my-2 {
    margin-block: calc(var(--spacing) * 2);
  }
  .my-3 {
    margin-block: calc(var(--spacing) * 3);
  }
  .my-4 {
    margin-block: calc(var(--spacing) * 4);
  }
  .mt-1 {
    margin-top: calc(var(--spacing) * 1);
  }
  .mt-2 {
    margin-top: calc(var(--spacing) * 2);
  }
  .mt-3 {
    margin-top: calc(var(--spacing) * 3);
  }
  .mt-4 {
    margin-top: calc(var(--spacing) * 4);
  }
  .mt-5 {
    margin-top: calc(var(--spacing) * 5);
  }
  .mt-6 {
    margin-top: calc(var(--spacing) * 6);
  }
  .mt-10 {
    margin-top: calc(var(--spacing) * 10);
  }
  .mt-auto {
    margin-top: auto;
  }
  .-mr-\[1px\] {
    margin-right: calc(1px * -1);
  }
  .mr-4 {
    margin-right: calc(var(--spacing) * 4);
  }
  .-mb-\[1px\] {
    margin-bottom: calc(1px * -1);
  }
  .-mb-\[2px\] {
    margin-bottom: calc(2px * -1);
  }
  .mb-1 {
    margin-bottom: calc(var(--spacing) * 1);
  }
  .mb-2 {
    margin-bottom: calc(var(--spacing) * 2);
  }
  .mb-3 {
    margin-bottom: calc(var(--spacing) * 3);
  }
  .mb-4 {
    margin-bottom: calc(var(--spacing) * 4);
  }
  .mb-5 {
    margin-bottom: calc(var(--spacing) * 5);
  }
  .mb-6 {
    margin-bottom: calc(var(--spacing) * 6);
  }
  .mb-10 {
    margin-bottom: calc(var(--spacing) * 10);
  }
  .ml-1 {
    margin-left: calc(var(--spacing) * 1);
  }
  .ml-2 {
    margin-left: calc(var(--spacing) * 2);
  }
  .ml-4 {
    margin-left: calc(var(--spacing) * 4);
  }
  .ml-\[40px\] {
    margin-left: 40px;
  }
  .ml-auto {
    margin-left: auto;
  }
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .block {
    display: block;
  }
  .flex {
    display: flex;
  }
  .grid {
    display: grid;
  }
  .hidden {
    display: none;
  }
  .inline {
    display: inline;
  }
  .inline-block {
    display: inline-block;
  }
  .inline-flex {
    display: inline-flex;
  }
  .table {
    display: table;
  }
  .table-cell {
    display: table-cell;
  }
  .table-row {
    display: table-row;
  }
  .field-sizing-content {
    field-sizing: content;
  }
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  .size-2 {
    width: calc(var(--spacing) * 2);
    height: calc(var(--spacing) * 2);
  }
  .size-2\.5 {
    width: calc(var(--spacing) * 2.5);
    height: calc(var(--spacing) * 2.5);
  }
  .size-3 {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }
  .size-3\.5 {
    width: calc(var(--spacing) * 3.5);
    height: calc(var(--spacing) * 3.5);
  }
  .size-4 {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }
  .size-5 {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
  .size-6 {
    width: calc(var(--spacing) * 6);
    height: calc(var(--spacing) * 6);
  }
  .size-7 {
    width: calc(var(--spacing) * 7);
    height: calc(var(--spacing) * 7);
  }
  .size-8 {
    width: calc(var(--spacing) * 8);
    height: calc(var(--spacing) * 8);
  }
  .size-9 {
    width: calc(var(--spacing) * 9);
    height: calc(var(--spacing) * 9);
  }
  .size-10 {
    width: calc(var(--spacing) * 10);
    height: calc(var(--spacing) * 10);
  }
  .size-11 {
    width: calc(var(--spacing) * 11);
    height: calc(var(--spacing) * 11);
  }
  .size-13 {
    width: calc(var(--spacing) * 13);
    height: calc(var(--spacing) * 13);
  }
  .size-16 {
    width: calc(var(--spacing) * 16);
    height: calc(var(--spacing) * 16);
  }
  .size-full {
    width: 100%;
    height: 100%;
  }
  .h-\(--radix-select-trigger-height\) {
    height: var(--radix-select-trigger-height);
  }
  .h-1 {
    height: calc(var(--spacing) * 1);
  }
  .h-2 {
    height: calc(var(--spacing) * 2);
  }
  .h-3 {
    height: calc(var(--spacing) * 3);
  }
  .h-4 {
    height: calc(var(--spacing) * 4);
  }
  .h-5 {
    height: calc(var(--spacing) * 5);
  }
  .h-6 {
    height: calc(var(--spacing) * 6);
  }
  .h-7 {
    height: calc(var(--spacing) * 7);
  }
  .h-8 {
    height: calc(var(--spacing) * 8);
  }
  .h-9 {
    height: calc(var(--spacing) * 9);
  }
  .h-10 {
    height: calc(var(--spacing) * 10);
  }
  .h-11 {
    height: calc(var(--spacing) * 11);
  }
  .h-12 {
    height: calc(var(--spacing) * 12);
  }
  .h-13 {
    height: calc(var(--spacing) * 13);
  }
  .h-14 {
    height: calc(var(--spacing) * 14);
  }
  .h-16 {
    height: calc(var(--spacing) * 16);
  }
  .h-\[1px\] {
    height: 1px;
  }
  .h-\[2px\] {
    height: 2px;
  }
  .h-\[17px\] {
    height: 17px;
  }
  .h-\[56px\] {
    height: 56px;
  }
  .h-\[60px\] {
    height: 60px;
  }
  .h-\[64px\] {
    height: 64px;
  }
  .h-\[200px\] {
    height: 200px;
  }
  .h-\[206px\] {
    height: 206px;
  }
  .h-\[calc\(100dvh-70px\)\] {
    height: calc(100dvh - 70px);
  }
  .h-auto {
    height: auto;
  }
  .h-fit {
    height: fit-content;
  }
  .h-full {
    height: 100%;
  }
  .h-min {
    height: min-content;
  }
  .h-px {
    height: 1px;
  }
  .max-h-\(--radix-dropdown-menu-content-available-height\) {
    max-height: var(--radix-dropdown-menu-content-available-height);
  }
  .max-h-\(--radix-select-content-available-height\) {
    max-height: var(--radix-select-content-available-height);
  }
  .max-h-\[200px\] {
    max-height: 200px;
  }
  .max-h-\[calc\(100dvh-80px\)\] {
    max-height: calc(100dvh - 80px);
  }
  .max-h-full {
    max-height: 100%;
  }
  .min-h-4 {
    min-height: calc(var(--spacing) * 4);
  }
  .min-h-16 {
    min-height: calc(var(--spacing) * 16);
  }
  .min-h-\[64px\] {
    min-height: 64px;
  }
  .min-h-\[100px\] {
    min-height: 100px;
  }
  .min-h-\[128px\] {
    min-height: 128px;
  }
  .min-h-full {
    min-height: 100%;
  }
  .w-1 {
    width: calc(var(--spacing) * 1);
  }
  .w-1\/2 {
    width: calc(1/2 * 100%);
  }
  .w-3 {
    width: calc(var(--spacing) * 3);
  }
  .w-3\/4 {
    width: calc(3/4 * 100%);
  }
  .w-4 {
    width: calc(var(--spacing) * 4);
  }
  .w-5 {
    width: calc(var(--spacing) * 5);
  }
  .w-6 {
    width: calc(var(--spacing) * 6);
  }
  .w-7 {
    width: calc(var(--spacing) * 7);
  }
  .w-8 {
    width: calc(var(--spacing) * 8);
  }
  .w-9 {
    width: calc(var(--spacing) * 9);
  }
  .w-10 {
    width: calc(var(--spacing) * 10);
  }
  .w-11 {
    width: calc(var(--spacing) * 11);
  }
  .w-12 {
    width: calc(var(--spacing) * 12);
  }
  .w-13 {
    width: calc(var(--spacing) * 13);
  }
  .w-16 {
    width: calc(var(--spacing) * 16);
  }
  .w-24 {
    width: calc(var(--spacing) * 24);
  }
  .w-40 {
    width: calc(var(--spacing) * 40);
  }
  .w-72 {
    width: calc(var(--spacing) * 72);
  }
  .w-\[0px\] {
    width: 0px;
  }
  .w-\[1px\] {
    width: 1px;
  }
  .w-\[17px\] {
    width: 17px;
  }
  .w-\[32px\] {
    width: 32px;
  }
  .w-\[44px\] {
    width: 44px;
  }
  .w-\[46px\] {
    width: 46px;
  }
  .w-\[56px\] {
    width: 56px;
  }
  .w-\[80px\] {
    width: 80px;
  }
  .w-\[100px\] {
    width: 100px;
  }
  .w-\[124px\] {
    width: 124px;
  }
  .w-\[148px\] {
    width: 148px;
  }
  .w-auto {
    width: auto;
  }
  .w-fit {
    width: fit-content;
  }
  .w-full {
    width: 100%;
  }
  .w-min {
    width: min-content;
  }
  .w-screen {
    width: 100vw;
  }
  .max-w-\[532px\] {
    max-width: 532px;
  }
  .max-w-\[calc\(100\%-2rem\)\] {
    max-width: calc(100% - 2rem);
  }
  .max-w-full {
    max-width: 100%;
  }
  .max-w-sm {
    max-width: var(--container-sm);
  }
  .min-w-\(--radix-select-trigger-width\) {
    min-width: var(--radix-select-trigger-width);
  }
  .min-w-0 {
    min-width: calc(var(--spacing) * 0);
  }
  .min-w-4 {
    min-width: calc(var(--spacing) * 4);
  }
  .min-w-5 {
    min-width: calc(var(--spacing) * 5);
  }
  .min-w-6 {
    min-width: calc(var(--spacing) * 6);
  }
  .min-w-7 {
    min-width: calc(var(--spacing) * 7);
  }
  .min-w-9 {
    min-width: calc(var(--spacing) * 9);
  }
  .min-w-11 {
    min-width: calc(var(--spacing) * 11);
  }
  .min-w-13 {
    min-width: calc(var(--spacing) * 13);
  }
  .min-w-\[8rem\] {
    min-width: 8rem;
  }
  .min-w-full {
    min-width: 100%;
  }
  .flex-1 {
    flex: 1;
  }
  .flex-shrink {
    flex-shrink: 1;
  }
  .flex-shrink-0 {
    flex-shrink: 0;
  }
  .shrink-0 {
    flex-shrink: 0;
  }
  .flex-grow {
    flex-grow: 1;
  }
  .grow {
    flex-grow: 1;
  }
  .grow-0 {
    flex-grow: 0;
  }
  .caption-bottom {
    caption-side: bottom;
  }
  .border-collapse {
    border-collapse: collapse;
  }
  .border-separate {
    border-collapse: separate;
  }
  .border-spacing-0 {
    --tw-border-spacing-x: calc(var(--spacing) * 0);
    --tw-border-spacing-y: calc(var(--spacing) * 0);
    border-spacing: var(--tw-border-spacing-x) var(--tw-border-spacing-y);
  }
  .origin-\(--radix-dropdown-menu-content-transform-origin\) {
    transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  }
  .origin-\(--radix-popover-content-transform-origin\) {
    transform-origin: var(--radix-popover-content-transform-origin);
  }
  .origin-\(--radix-select-content-transform-origin\) {
    transform-origin: var(--radix-select-content-transform-origin);
  }
  .origin-\(--radix-tooltip-content-transform-origin\) {
    transform-origin: var(--radix-tooltip-content-transform-origin);
  }
  .origin-top {
    transform-origin: top;
  }
  .-translate-x-1 {
    --tw-translate-x: calc(var(--spacing) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .-translate-x-1\/2 {
    --tw-translate-x: calc(calc(1/2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .translate-x-0 {
    --tw-translate-x: calc(var(--spacing) * 0);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .translate-x-16 {
    --tw-translate-x: calc(var(--spacing) * 16);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .translate-x-\[-50\%\] {
    --tw-translate-x: -50%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .-translate-y-1 {
    --tw-translate-y: calc(var(--spacing) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .-translate-y-1\/2 {
    --tw-translate-y: calc(calc(1/2 * 100%) * -1);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .translate-y-\[-50\%\] {
    --tw-translate-y: -50%;
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .transform {
    transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  }
  .animate-in {
    animation: enter var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none);
  }
  .animate-pulse {
    animation: var(--animate-pulse);
  }
  .animate-skeleton {
    animation: skeleton 3s ease infinite;
  }
  .animate-spin {
    animation: var(--animate-spin);
  }
  .cursor-default {
    cursor: default;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .cursor-text {
    cursor: text;
  }
  .resize {
    resize: both;
  }
  .resize-none {
    resize: none;
  }
  .resize-y {
    resize: vertical;
  }
  .scroll-my-1 {
    scroll-margin-block: calc(var(--spacing) * 1);
  }
  .list-disc {
    list-style-type: disc;
  }
  .list-none {
    list-style-type: none;
  }
  .appearance-none {
    appearance: none;
  }
  .grid-cols-\[auto_1fr_auto\] {
    grid-template-columns: auto 1fr auto;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-col-reverse {
    flex-direction: column-reverse;
  }
  .flex-row {
    flex-direction: row;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .place-content-center {
    place-content: center;
  }
  .place-items-center {
    place-items: center;
  }
  .items-center {
    align-items: center;
  }
  .items-end {
    align-items: flex-end;
  }
  .items-start {
    align-items: flex-start;
  }
  .items-stretch {
    align-items: stretch;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-end {
    justify-content: flex-end;
  }
  .justify-start {
    justify-content: flex-start;
  }
  .justify-items-start {
    justify-items: start;
  }
  .gap-0 {
    gap: calc(var(--spacing) * 0);
  }
  .gap-0\.5 {
    gap: calc(var(--spacing) * 0.5);
  }
  .gap-0\.25 {
    gap: calc(var(--spacing) * 0.25);
  }
  .gap-1 {
    gap: calc(var(--spacing) * 1);
  }
  .gap-1\.5 {
    gap: calc(var(--spacing) * 1.5);
  }
  .gap-2 {
    gap: calc(var(--spacing) * 2);
  }
  .gap-3 {
    gap: calc(var(--spacing) * 3);
  }
  .gap-4 {
    gap: calc(var(--spacing) * 4);
  }
  .gap-5 {
    gap: calc(var(--spacing) * 5);
  }
  .gap-6 {
    gap: calc(var(--spacing) * 6);
  }
  .gap-10 {
    gap: calc(var(--spacing) * 10);
  }
  .gap-\[6px\] {
    gap: 6px;
  }
  .gap-y-2 {
    row-gap: calc(var(--spacing) * 2);
  }
  .self-center {
    align-self: center;
  }
  .justify-self-center {
    justify-self: center;
  }
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .overflow-clip {
    overflow: clip;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .overflow-scroll {
    overflow: scroll;
  }
  .overflow-visible {
    overflow: visible;
  }
  .overflow-x-auto {
    overflow-x: auto;
  }
  .overflow-x-hidden {
    overflow-x: hidden;
  }
  .overflow-x-scroll {
    overflow-x: scroll;
  }
  .overflow-y-auto {
    overflow-y: auto;
  }
  .overscroll-x-contain {
    overscroll-behavior-x: contain;
  }
  .overscroll-y-contain {
    overscroll-behavior-y: contain;
  }
  .rounded {
    border-radius: 0.25rem;
  }
  .rounded-2xl {
    border-radius: var(--radius-2xl);
  }
  .rounded-3xl {
    border-radius: var(--radius-3xl);
  }
  .rounded-full {
    border-radius: calc(infinity * 1px);
  }
  .rounded-lg {
    border-radius: var(--radius-lg);
  }
  .rounded-md {
    border-radius: var(--radius-md);
  }
  .rounded-none {
    border-radius: 0;
  }
  .rounded-sm {
    border-radius: var(--radius-sm);
  }
  .rounded-xl {
    border-radius: var(--radius-xl);
  }
  .rounded-xs {
    border-radius: var(--radius-xs);
  }
  .rounded-t-2xl {
    border-top-left-radius: var(--radius-2xl);
    border-top-right-radius: var(--radius-2xl);
  }
  .rounded-t-sm {
    border-top-left-radius: var(--radius-sm);
    border-top-right-radius: var(--radius-sm);
  }
  .rounded-b-none {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
  .border {
    border-style: var(--tw-border-style);
    border-width: 1px;
  }
  .border-0 {
    border-style: var(--tw-border-style);
    border-width: 0px;
  }
  .border-1 {
    border-style: var(--tw-border-style);
    border-width: 1px;
  }
  .border-2 {
    border-style: var(--tw-border-style);
    border-width: 2px;
  }
  .border-t {
    border-top-style: var(--tw-border-style);
    border-top-width: 1px;
  }
  .border-t-1 {
    border-top-style: var(--tw-border-style);
    border-top-width: 1px;
  }
  .border-r {
    border-right-style: var(--tw-border-style);
    border-right-width: 1px;
  }
  .border-b {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }
  .border-b-1 {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }
  .border-b-2 {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 2px;
  }
  .border-l {
    border-left-style: var(--tw-border-style);
    border-left-width: 1px;
  }
  .border-dashed {
    --tw-border-style: dashed;
    border-style: dashed;
  }
  .border-none {
    --tw-border-style: none;
    border-style: none;
  }
  .border-solid {
    --tw-border-style: solid;
    border-style: solid;
  }
  .border-\(--alert-border\) {
    border-color: var(--alert-border);
  }
  .border-\(--callout-header\) {
    border-color: var(--callout-header);
  }
  .border-background-primary {
    border-color: var(--seq-color-background-primary);
  }
  .border-border-button {
    border-color: var(--seq-color-border-button);
  }
  .border-border-card {
    border-color: var(--seq-color-border-card);
  }
  .border-border-focus {
    border-color: var(--seq-color-border-focus);
  }
  .border-border-normal {
    border-color: var(--seq-color-border-normal);
  }
  .border-current {
    border-color: currentcolor;
  }
  .border-gray-200 {
    border-color: var(--color-gray-200);
  }
  .border-gray-300 {
    border-color: var(--color-gray-300);
  }
  .border-primary {
    border-color: var(--seq-color-primary);
  }
  .border-red-500 {
    border-color: var(--color-red-500);
  }
  .border-transparent {
    border-color: transparent;
  }
  .border-violet-600 {
    border-color: var(--color-violet-600);
  }
  .border-b-primary {
    border-bottom-color: var(--seq-color-primary);
  }
  .border-b-transparent {
    border-bottom-color: transparent;
  }
  .bg-\(--alert-background\) {
    background-color: var(--alert-background);
  }
  .bg-\(--callout-content\) {
    background-color: var(--callout-content);
  }
  .bg-\(--callout-header\) {
    background-color: var(--callout-header);
  }
  .bg-background-active {
    background-color: var(--seq-color-background-active);
  }
  .bg-background-input {
    background-color: var(--seq-color-background-input);
  }
  .bg-background-inverse {
    background-color: var(--seq-color-background-inverse);
  }
  .bg-background-inverse\/20 {
    background-color: var(--seq-color-background-inverse);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--seq-color-background-inverse) 20%, transparent);
    }
  }
  .bg-background-muted {
    background-color: var(--seq-color-background-muted);
  }
  .bg-background-overlay {
    background-color: var(--seq-color-background-overlay);
  }
  .bg-background-primary {
    background-color: var(--seq-color-background-primary);
  }
  .bg-background-primary\/70 {
    background-color: var(--seq-color-background-primary);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--seq-color-background-primary) 70%, transparent);
    }
  }
  .bg-background-raised {
    background-color: var(--seq-color-background-raised);
  }
  .bg-background-secondary {
    background-color: var(--seq-color-background-secondary);
  }
  .bg-blue-500 {
    background-color: var(--color-blue-500);
  }
  .bg-border-normal {
    background-color: var(--seq-color-border-normal);
  }
  .bg-destructive {
    background-color: var(--seq-color-destructive);
  }
  .bg-info {
    background-color: var(--seq-color-info);
  }
  .bg-negative {
    background-color: var(--seq-color-negative);
  }
  .bg-positive {
    background-color: var(--seq-color-positive);
  }
  .bg-primary {
    background-color: var(--seq-color-primary);
  }
  .bg-primary\/20 {
    background-color: var(--seq-color-primary);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--seq-color-primary) 20%, transparent);
    }
  }
  .bg-primary\/50 {
    background-color: var(--seq-color-primary);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--seq-color-primary) 50%, transparent);
    }
  }
  .bg-transparent {
    background-color: transparent;
  }
  .bg-warning {
    background-color: var(--seq-color-warning);
  }
  .bg-white {
    background-color: var(--color-white);
  }
  .bg-gradient-primary {
    background-image: var(--seq-color-gradient-primary);
  }
  .bg-gradient-secondary {
    background-image: var(--seq-color-gradient-secondary);
  }
  .bg-gradient-skeleton {
    background-image: var(--seq-color-gradient-skeleton);
  }
  .\[mask-image\:radial-gradient\(circle_at_82\%_82\%\,transparent_22\%\,black_0\)\] {
    mask-image: radial-gradient(circle at 82% 82%,transparent 22%,black 0);
  }
  .bg-\[length\:400\%_400\%\] {
    background-size: 400% 400%;
  }
  .bg-no-repeat {
    background-repeat: no-repeat;
  }
  .bg-origin-border {
    background-origin: border-box;
  }
  .fill-background-raised {
    fill: var(--seq-color-background-raised);
  }
  .fill-primary {
    fill: var(--seq-color-primary);
  }
  .stroke-2 {
    stroke-width: 2;
  }
  .object-cover {
    object-fit: cover;
  }
  .p-0 {
    padding: calc(var(--spacing) * 0);
  }
  .p-0\.75 {
    padding: calc(var(--spacing) * 0.75);
  }
  .p-1 {
    padding: calc(var(--spacing) * 1);
  }
  .p-2 {
    padding: calc(var(--spacing) * 2);
  }
  .p-3 {
    padding: calc(var(--spacing) * 3);
  }
  .p-4 {
    padding: calc(var(--spacing) * 4);
  }
  .p-5 {
    padding: calc(var(--spacing) * 5);
  }
  .p-6 {
    padding: calc(var(--spacing) * 6);
  }
  .p-8 {
    padding: calc(var(--spacing) * 8);
  }
  .p-\[10px\] {
    padding: 10px;
  }
  .px-0 {
    padding-inline: calc(var(--spacing) * 0);
  }
  .px-1 {
    padding-inline: calc(var(--spacing) * 1);
  }
  .px-2 {
    padding-inline: calc(var(--spacing) * 2);
  }
  .px-3 {
    padding-inline: calc(var(--spacing) * 3);
  }
  .px-4 {
    padding-inline: calc(var(--spacing) * 4);
  }
  .px-5 {
    padding-inline: calc(var(--spacing) * 5);
  }
  .px-6 {
    padding-inline: calc(var(--spacing) * 6);
  }
  .py-1 {
    padding-block: calc(var(--spacing) * 1);
  }
  .py-1\.5 {
    padding-block: calc(var(--spacing) * 1.5);
  }
  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }
  .py-3 {
    padding-block: calc(var(--spacing) * 3);
  }
  .py-4 {
    padding-block: calc(var(--spacing) * 4);
  }
  .py-6 {
    padding-block: calc(var(--spacing) * 6);
  }
  .py-8 {
    padding-block: calc(var(--spacing) * 8);
  }
  .py-16 {
    padding-block: calc(var(--spacing) * 16);
  }
  .pt-0 {
    padding-top: calc(var(--spacing) * 0);
  }
  .pt-1 {
    padding-top: calc(var(--spacing) * 1);
  }
  .pt-1\.5 {
    padding-top: calc(var(--spacing) * 1.5);
  }
  .pt-2 {
    padding-top: calc(var(--spacing) * 2);
  }
  .pt-3 {
    padding-top: calc(var(--spacing) * 3);
  }
  .pt-4 {
    padding-top: calc(var(--spacing) * 4);
  }
  .pt-5 {
    padding-top: calc(var(--spacing) * 5);
  }
  .pt-\[60px\] {
    padding-top: 60px;
  }
  .pr-2 {
    padding-right: calc(var(--spacing) * 2);
  }
  .pr-4 {
    padding-right: calc(var(--spacing) * 4);
  }
  .pr-8 {
    padding-right: calc(var(--spacing) * 8);
  }
  .pb-2 {
    padding-bottom: calc(var(--spacing) * 2);
  }
  .pb-3 {
    padding-bottom: calc(var(--spacing) * 3);
  }
  .pb-4 {
    padding-bottom: calc(var(--spacing) * 4);
  }
  .pb-5 {
    padding-bottom: calc(var(--spacing) * 5);
  }
  .pb-6 {
    padding-bottom: calc(var(--spacing) * 6);
  }
  .pb-\[calc\(env\(safe-area-inset-bottom\)\)\] {
    padding-bottom: calc(env(safe-area-inset-bottom));
  }
  .pl-1 {
    padding-left: calc(var(--spacing) * 1);
  }
  .pl-2 {
    padding-left: calc(var(--spacing) * 2);
  }
  .pl-4 {
    padding-left: calc(var(--spacing) * 4);
  }
  .pl-6 {
    padding-left: calc(var(--spacing) * 6);
  }
  .text-center {
    text-align: center;
  }
  .text-end {
    text-align: end;
  }
  .text-left {
    text-align: left;
  }
  .align-middle {
    vertical-align: middle;
  }
  .text-large {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-xl);
    line-height: var(--tw-leading, var(--text-xl--line-height));
    --tw-leading: calc(var(--spacing) * 7);
    line-height: calc(var(--spacing) * 7);
    --tw-font-weight: var(--font-weight-semibold);
    font-weight: var(--font-weight-semibold);
    --tw-tracking: var(--tracking-normal);
    letter-spacing: var(--tracking-normal);
  }
  .text-medium {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
    --tw-leading: calc(var(--spacing) * 6);
    line-height: calc(var(--spacing) * 6);
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
    --tw-tracking: var(--tracking-normal);
    letter-spacing: var(--tracking-normal);
  }
  .text-normal {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
    --tw-leading: calc(var(--spacing) * 5);
    line-height: calc(var(--spacing) * 5);
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .text-normal-bold {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
    --tw-leading: calc(var(--spacing) * 5);
    line-height: calc(var(--spacing) * 5);
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .text-small {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
    --tw-leading: calc(var(--spacing) * 4);
    line-height: calc(var(--spacing) * 4);
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .text-small-bold {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
    --tw-leading: calc(var(--spacing) * 4);
    line-height: calc(var(--spacing) * 4);
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
    --tw-tracking: var(--tracking-normal);
    letter-spacing: var(--tracking-normal);
  }
  .text-xlarge {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: var(--text-2xl);
    line-height: var(--tw-leading, var(--text-2xl--line-height));
    --tw-leading: calc(var(--spacing) * 8);
    line-height: calc(var(--spacing) * 8);
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
    --tw-tracking: var(--tracking-normal);
    letter-spacing: var(--tracking-normal);
  }
  .font-body {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }
  .font-mono {
    font-family: "Roboto", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
  .text-2xl {
    font-size: var(--text-2xl);
    line-height: var(--tw-leading, var(--text-2xl--line-height));
  }
  .text-4xl {
    font-size: var(--text-4xl);
    line-height: var(--tw-leading, var(--text-4xl--line-height));
  }
  .text-6xl {
    font-size: var(--text-6xl);
    line-height: var(--tw-leading, var(--text-6xl--line-height));
  }
  .text-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  .text-lg {
    font-size: var(--text-lg);
    line-height: var(--tw-leading, var(--text-lg--line-height));
  }
  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }
  .text-xl {
    font-size: var(--text-xl);
    line-height: var(--tw-leading, var(--text-xl--line-height));
  }
  .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }
  .text-\[0\.625rem\] {
    font-size: 0.625rem;
  }
  .text-\[4px\] {
    font-size: 4px;
  }
  .text-\[6px\] {
    font-size: 6px;
  }
  .text-\[9px\] {
    font-size: 9px;
  }
  .text-\[11px\] {
    font-size: 11px;
  }
  .text-\[16px\] {
    font-size: 16px;
  }
  .leading-0 {
    --tw-leading: calc(var(--spacing) * 0);
    line-height: calc(var(--spacing) * 0);
  }
  .leading-4 {
    --tw-leading: calc(var(--spacing) * 4);
    line-height: calc(var(--spacing) * 4);
  }
  .leading-5 {
    --tw-leading: calc(var(--spacing) * 5);
    line-height: calc(var(--spacing) * 5);
  }
  .leading-6 {
    --tw-leading: calc(var(--spacing) * 6);
    line-height: calc(var(--spacing) * 6);
  }
  .leading-7 {
    --tw-leading: calc(var(--spacing) * 7);
    line-height: calc(var(--spacing) * 7);
  }
  .leading-8 {
    --tw-leading: calc(var(--spacing) * 8);
    line-height: calc(var(--spacing) * 8);
  }
  .leading-10 {
    --tw-leading: calc(var(--spacing) * 10);
    line-height: calc(var(--spacing) * 10);
  }
  .leading-15 {
    --tw-leading: calc(var(--spacing) * 15);
    line-height: calc(var(--spacing) * 15);
  }
  .leading-\[inherit\] {
    --tw-leading: inherit;
    line-height: inherit;
  }
  .leading-snug {
    --tw-leading: var(--leading-snug);
    line-height: var(--leading-snug);
  }
  .font-bold {
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
  }
  .font-medium {
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
  }
  .font-normal {
    --tw-font-weight: var(--font-weight-normal);
    font-weight: var(--font-weight-normal);
  }
  .font-semibold {
    --tw-font-weight: var(--font-weight-semibold);
    font-weight: var(--font-weight-semibold);
  }
  .tracking-normal {
    --tw-tracking: var(--tracking-normal);
    letter-spacing: var(--tracking-normal);
  }
  .tracking-wide {
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .tracking-widest {
    --tw-tracking: var(--tracking-widest);
    letter-spacing: var(--tracking-widest);
  }
  .text-wrap {
    text-wrap: wrap;
  }
  .text-ellipsis {
    text-overflow: ellipsis;
  }
  .whitespace-nowrap {
    white-space: nowrap;
  }
  .text-\(--alert-accent\) {
    color: var(--alert-accent);
  }
  .text-\(--callout-accent\) {
    color: var(--callout-accent);
  }
  .text-background-primary {
    color: var(--seq-color-background-primary);
  }
  .text-background-raised {
    color: var(--seq-color-background-raised);
  }
  .text-background-secondary {
    color: var(--seq-color-background-secondary);
  }
  .text-black {
    color: var(--color-black);
  }
  .text-border-focus {
    color: var(--seq-color-border-focus);
  }
  .text-button-primary {
    color: var(--seq-color-button-primary);
  }
  .text-current {
    color: currentcolor;
  }
  .text-destructive {
    color: var(--seq-color-destructive);
  }
  .text-gray-500 {
    color: var(--color-gray-500);
  }
  .text-gray-900 {
    color: var(--color-gray-900);
  }
  .text-info {
    color: var(--seq-color-info);
  }
  .text-inherit {
    color: inherit;
  }
  .text-inverse {
    color: var(--seq-color-inverse);
  }
  .text-muted {
    color: var(--seq-color-muted);
  }
  .text-negative {
    color: var(--seq-color-negative);
  }
  .text-positive {
    color: var(--seq-color-positive);
  }
  .text-primary {
    color: var(--seq-color-primary);
  }
  .text-primary\/80 {
    color: var(--seq-color-primary);
    @supports (color: color-mix(in lab, red, red)) {
      color: color-mix(in oklab, var(--seq-color-primary) 80%, transparent);
    }
  }
  .text-red-500 {
    color: var(--color-red-500);
  }
  .text-secondary {
    color: var(--seq-color-secondary);
  }
  .text-warning {
    color: var(--seq-color-warning);
  }
  .text-white {
    color: var(--color-white);
  }
  .capitalize {
    text-transform: capitalize;
  }
  .uppercase {
    text-transform: uppercase;
  }
  .italic {
    font-style: italic;
  }
  .no-underline {
    text-decoration-line: none;
  }
  .underline {
    text-decoration-line: underline;
  }
  .placeholder-muted {
    &::placeholder {
      color: var(--seq-color-muted);
    }
  }
  .caret-transparent {
    caret-color: transparent;
  }
  .opacity-0 {
    opacity: 0%;
  }
  .opacity-50 {
    opacity: 50%;
  }
  .opacity-75 {
    opacity: 75%;
  }
  .opacity-100 {
    opacity: 100%;
  }
  .shadow {
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-primary {
    --tw-shadow: 0 0 16px 0 var(--tw-shadow-color, var(--seq-color-drop-shadow));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-sm {
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-xl {
    --tw-shadow: 0 20px 25px -5px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 8px 10px -6px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-1 {
    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-2 {
    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-black {
    --tw-ring-color: var(--color-black);
  }
  .ring-border-focus {
    --tw-ring-color: var(--seq-color-border-focus);
  }
  .ring-border-normal {
    --tw-ring-color: var(--seq-color-border-normal);
  }
  .ring-white {
    --tw-ring-color: var(--color-white);
  }
  .outline-hidden {
    --tw-outline-style: none;
    outline-style: none;
    @media (forced-colors: active) {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
  }
  .outline {
    outline-style: var(--tw-outline-style);
    outline-width: 1px;
  }
  .outline-offset-1 {
    outline-offset: 1px;
  }
  .outline-offset-\[-2px\] {
    outline-offset: -2px;
  }
  .blur {
    --tw-blur: blur(8px);
    filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
  }
  .blur-xs {
    --tw-blur: blur(var(--blur-xs));
    filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
  }
  .filter {
    filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
  }
  .backdrop-blur-md {
    --tw-backdrop-blur: blur(var(--blur-md));
    -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
    backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  }
  .backdrop-blur-xs {
    --tw-backdrop-blur: blur(var(--blur-xs));
    -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
    backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  }
  .backdrop-filter {
    -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
    backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  }
  .transition {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-\[translate\,opacity\] {
    transition-property: translate,opacity;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-all {
    transition-property: all;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-opacity {
    transition-property: opacity;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-transform {
    transition-property: transform, translate, scale, rotate;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-none {
    transition-property: none;
  }
  .duration-\(--duration\) {
    --tw-duration: var(--duration);
    transition-duration: var(--duration);
  }
  .duration-100 {
    --tw-duration: 100ms;
    transition-duration: 100ms;
  }
  .duration-200 {
    --tw-duration: 200ms;
    transition-duration: 200ms;
  }
  .duration-300 {
    --tw-duration: 300ms;
    transition-duration: 300ms;
  }
  .ease-in-out {
    --tw-ease: var(--ease-in-out);
    transition-timing-function: var(--ease-in-out);
  }
  .ease-linear {
    --tw-ease: linear;
    transition-timing-function: linear;
  }
  .ease-out {
    --tw-ease: var(--ease-out);
    transition-timing-function: var(--ease-out);
  }
  .will-change-transform {
    will-change: transform;
  }
  .fade-in-0 {
    --tw-enter-opacity: calc(0/100);
    --tw-enter-opacity: 0;
  }
  .outline-none {
    --tw-outline-style: none;
    outline-style: none;
  }
  .select-none {
    -webkit-user-select: none;
    user-select: none;
  }
  .zoom-in-95 {
    --tw-enter-scale: calc(95*1%);
    --tw-enter-scale: .95;
  }
  .\[--alert-accent\:var\(--color-green-700\)\] {
    --alert-accent: var(--color-green-700);
  }
  .\[--alert-accent\:var\(--color-indigo-700\)\] {
    --alert-accent: var(--color-indigo-700);
  }
  .\[--alert-accent\:var\(--color-red-700\)\] {
    --alert-accent: var(--color-red-700);
  }
  .\[--alert-accent\:var\(--color-yellow-700\)\] {
    --alert-accent: var(--color-yellow-700);
  }
  .\[--alert-background\:var\(--color-green-200\)\] {
    --alert-background: var(--color-green-200);
  }
  .\[--alert-background\:var\(--color-indigo-200\)\] {
    --alert-background: var(--color-indigo-200);
  }
  .\[--alert-background\:var\(--color-red-200\)\] {
    --alert-background: var(--color-red-200);
  }
  .\[--alert-background\:var\(--color-yellow-100\)\] {
    --alert-background: var(--color-yellow-100);
  }
  .\[--alert-border\:var\(--color-green-500\)\] {
    --alert-border: var(--color-green-500);
  }
  .\[--alert-border\:var\(--color-indigo-500\)\] {
    --alert-border: var(--color-indigo-500);
  }
  .\[--alert-border\:var\(--color-red-500\)\] {
    --alert-border: var(--color-red-500);
  }
  .\[--alert-border\:var\(--color-yellow-500\)\] {
    --alert-border: var(--color-yellow-500);
  }
  .\[--callout-accent\:var\(--color-green-700\)\] {
    --callout-accent: var(--color-green-700);
  }
  .\[--callout-accent\:var\(--color-indigo-700\)\] {
    --callout-accent: var(--color-indigo-700);
  }
  .\[--callout-accent\:var\(--color-red-700\)\] {
    --callout-accent: var(--color-red-700);
  }
  .\[--callout-accent\:var\(--color-yellow-700\)\] {
    --callout-accent: var(--color-yellow-700);
  }
  .\[--callout-content\:var\(--color-green-200\)\] {
    --callout-content: var(--color-green-200);
  }
  .\[--callout-content\:var\(--color-indigo-200\)\] {
    --callout-content: var(--color-indigo-200);
  }
  .\[--callout-content\:var\(--color-red-200\)\] {
    --callout-content: var(--color-red-200);
  }
  .\[--callout-content\:var\(--color-yellow-100\)\] {
    --callout-content: var(--color-yellow-100);
  }
  .\[--callout-header\:var\(--color-green-500\)\] {
    --callout-header: var(--color-green-500);
  }
  .\[--callout-header\:var\(--color-indigo-500\)\] {
    --callout-header: var(--color-indigo-500);
  }
  .\[--callout-header\:var\(--color-red-500\)\] {
    --callout-header: var(--color-red-500);
  }
  .\[--callout-header\:var\(--color-yellow-500\)\] {
    --callout-header: var(--color-yellow-500);
  }
  .ring-inset {
    --tw-ring-inset: inset;
  }
  .\*\:size-2 {
    :is(& > *) {
      width: calc(var(--spacing) * 2);
      height: calc(var(--spacing) * 2);
    }
  }
  .\*\:size-4 {
    :is(& > *) {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
  }
  .\*\:rounded-full {
    :is(& > *) {
      border-radius: calc(infinity * 1px);
    }
  }
  .\*\:bg-primary {
    :is(& > *) {
      background-color: var(--seq-color-primary);
    }
  }
  .not-in-data-current\:duration-1 {
    &:not(:where(*[data-current]) *) {
      --tw-duration: 1ms;
      transition-duration: 1ms;
    }
  }
  .group-focus-within\/input-group\:opacity-0 {
    &:is(:where(.group\/input-group):focus-within *) {
      opacity: 0%;
    }
  }
  .group-has-\[\[data-orientation\=horizontal\]\]\/field\:text-balance {
    &:is(:where(.group\/field):has(*:is([data-orientation=horizontal])) *) {
      text-wrap: balance;
    }
  }
  .group-has-\[\>input\]\/input-group\:pt-2\.5 {
    &:is(:where(.group\/input-group):has(>input) *) {
      padding-top: calc(var(--spacing) * 2.5);
    }
  }
  .group-has-\[\>input\]\/input-group\:pb-2\.5 {
    &:is(:where(.group\/input-group):has(>input) *) {
      padding-bottom: calc(var(--spacing) * 2.5);
    }
  }
  .group-data-\[disabled\=true\]\:pointer-events-none {
    &:is(:where(.group)[data-disabled="true"] *) {
      pointer-events: none;
    }
  }
  .group-data-\[disabled\=true\]\:opacity-50 {
    &:is(:where(.group)[data-disabled="true"] *) {
      opacity: 50%;
    }
  }
  .group-data-\[disabled\=true\]\/field\:opacity-50 {
    &:is(:where(.group\/field)[data-disabled="true"] *) {
      opacity: 50%;
    }
  }
  .group-data-\[disabled\=true\]\/input-group\:opacity-50 {
    &:is(:where(.group\/input-group)[data-disabled="true"] *) {
      opacity: 50%;
    }
  }
  .group-data-\[variant\=outline\]\/field-group\:-mb-2 {
    &:is(:where(.group\/field-group)[data-variant="outline"] *) {
      margin-bottom: calc(var(--spacing) * -2);
    }
  }
  .peer-disabled\:cursor-not-allowed {
    &:is(:where(.peer):disabled ~ *) {
      cursor: not-allowed;
    }
  }
  .peer-disabled\:opacity-50 {
    &:is(:where(.peer):disabled ~ *) {
      opacity: 50%;
    }
  }
  .selection\:bg-transparent {
    & *::selection {
      background-color: transparent;
    }
    &::selection {
      background-color: transparent;
    }
  }
  .file\:inline-flex {
    &::file-selector-button {
      display: inline-flex;
    }
  }
  .file\:h-13 {
    &::file-selector-button {
      height: calc(var(--spacing) * 13);
    }
  }
  .file\:border-0 {
    &::file-selector-button {
      border-style: var(--tw-border-style);
      border-width: 0px;
    }
  }
  .file\:bg-transparent {
    &::file-selector-button {
      background-color: transparent;
    }
  }
  .file\:text-sm {
    &::file-selector-button {
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
  }
  .file\:font-medium {
    &::file-selector-button {
      --tw-font-weight: var(--font-weight-medium);
      font-weight: var(--font-weight-medium);
    }
  }
  .file\:text-primary {
    &::file-selector-button {
      color: var(--seq-color-primary);
    }
  }
  .placeholder\:text-muted {
    &::placeholder {
      color: var(--seq-color-muted);
    }
  }
  .before\:pointer-events-none {
    &::before {
      content: var(--tw-content);
      pointer-events: none;
    }
  }
  .before\:absolute {
    &::before {
      content: var(--tw-content);
      position: absolute;
    }
  }
  .before\:-top-4 {
    &::before {
      content: var(--tw-content);
      top: calc(var(--spacing) * -4);
    }
  }
  .before\:top-0 {
    &::before {
      content: var(--tw-content);
      top: calc(var(--spacing) * 0);
    }
  }
  .before\:-bottom-4 {
    &::before {
      content: var(--tw-content);
      bottom: calc(var(--spacing) * -4);
    }
  }
  .before\:left-0 {
    &::before {
      content: var(--tw-content);
      left: calc(var(--spacing) * 0);
    }
  }
  .before\:z-10 {
    &::before {
      content: var(--tw-content);
      z-index: 10;
    }
  }
  .before\:z-\[11\] {
    &::before {
      content: var(--tw-content);
      z-index: 11;
    }
  }
  .before\:hidden {
    &::before {
      content: var(--tw-content);
      display: none;
    }
  }
  .before\:h-4 {
    &::before {
      content: var(--tw-content);
      height: calc(var(--spacing) * 4);
    }
  }
  .before\:h-full {
    &::before {
      content: var(--tw-content);
      height: 100%;
    }
  }
  .before\:w-4 {
    &::before {
      content: var(--tw-content);
      width: calc(var(--spacing) * 4);
    }
  }
  .before\:w-full {
    &::before {
      content: var(--tw-content);
      width: 100%;
    }
  }
  .before\:bg-linear-to-l {
    &::before {
      content: var(--tw-content);
      --tw-gradient-position: to left;
      @supports (background-image: linear-gradient(in lab, red, red)) {
        --tw-gradient-position: to left in oklab;
      }
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .before\:bg-linear-to-t {
    &::before {
      content: var(--tw-content);
      --tw-gradient-position: to top;
      @supports (background-image: linear-gradient(in lab, red, red)) {
        --tw-gradient-position: to top in oklab;
      }
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .before\:bg-gradient-to-b {
    &::before {
      content: var(--tw-content);
      --tw-gradient-position: to bottom in oklab;
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .before\:bg-gradient-to-t {
    &::before {
      content: var(--tw-content);
      --tw-gradient-position: to top in oklab;
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .before\:from-transparent {
    &::before {
      content: var(--tw-content);
      --tw-gradient-from: transparent;
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .before\:to-background-primary {
    &::before {
      content: var(--tw-content);
      --tw-gradient-to: var(--seq-color-background-primary);
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .before\:to-background-primary\/70 {
    &::before {
      content: var(--tw-content);
      --tw-gradient-to: var(--seq-color-background-primary);
      @supports (color: color-mix(in lab, red, red)) {
        --tw-gradient-to: color-mix(in oklab, var(--seq-color-background-primary) 70%, transparent);
      }
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .after\:pointer-events-none {
    &::after {
      content: var(--tw-content);
      pointer-events: none;
    }
  }
  .after\:absolute {
    &::after {
      content: var(--tw-content);
      position: absolute;
    }
  }
  .after\:top-0 {
    &::after {
      content: var(--tw-content);
      top: calc(var(--spacing) * 0);
    }
  }
  .after\:right-0 {
    &::after {
      content: var(--tw-content);
      right: calc(var(--spacing) * 0);
    }
  }
  .after\:bottom-0 {
    &::after {
      content: var(--tw-content);
      bottom: calc(var(--spacing) * 0);
    }
  }
  .after\:left-0 {
    &::after {
      content: var(--tw-content);
      left: calc(var(--spacing) * 0);
    }
  }
  .after\:z-10 {
    &::after {
      content: var(--tw-content);
      z-index: 10;
    }
  }
  .after\:hidden {
    &::after {
      content: var(--tw-content);
      display: none;
    }
  }
  .after\:h-4 {
    &::after {
      content: var(--tw-content);
      height: calc(var(--spacing) * 4);
    }
  }
  .after\:h-full {
    &::after {
      content: var(--tw-content);
      height: 100%;
    }
  }
  .after\:w-4 {
    &::after {
      content: var(--tw-content);
      width: calc(var(--spacing) * 4);
    }
  }
  .after\:w-full {
    &::after {
      content: var(--tw-content);
      width: 100%;
    }
  }
  .after\:bg-linear-to-b {
    &::after {
      content: var(--tw-content);
      --tw-gradient-position: to bottom;
      @supports (background-image: linear-gradient(in lab, red, red)) {
        --tw-gradient-position: to bottom in oklab;
      }
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .after\:bg-linear-to-r {
    &::after {
      content: var(--tw-content);
      --tw-gradient-position: to right;
      @supports (background-image: linear-gradient(in lab, red, red)) {
        --tw-gradient-position: to right in oklab;
      }
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .after\:from-transparent {
    &::after {
      content: var(--tw-content);
      --tw-gradient-from: transparent;
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .after\:to-background-primary {
    &::after {
      content: var(--tw-content);
      --tw-gradient-to: var(--seq-color-background-primary);
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .last\:mt-0 {
    &:last-child {
      margin-top: calc(var(--spacing) * 0);
    }
  }
  .focus-within\:ring-2 {
    &:focus-within {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .hover\:border-\[var\(--seq-color-border-normal\)\] {
    &:hover {
      @media (hover: hover) {
        border-color: var(--seq-color-border-normal);
      }
    }
  }
  .hover\:border-border-card {
    &:hover {
      @media (hover: hover) {
        border-color: var(--seq-color-border-card);
      }
    }
  }
  .hover\:border-border-hover {
    &:hover {
      @media (hover: hover) {
        border-color: var(--seq-color-border-hover);
      }
    }
  }
  .hover\:bg-background-hover {
    &:hover {
      @media (hover: hover) {
        background-color: var(--seq-color-background-hover);
      }
    }
  }
  .hover\:bg-background-inverse\/15 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--seq-color-background-inverse);
        @supports (color: color-mix(in lab, red, red)) {
          background-color: color-mix(in oklab, var(--seq-color-background-inverse) 15%, transparent);
        }
      }
    }
  }
  .hover\:bg-destructive\/80 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--seq-color-destructive);
        @supports (color: color-mix(in lab, red, red)) {
          background-color: color-mix(in oklab, var(--seq-color-destructive) 80%, transparent);
        }
      }
    }
  }
  .hover\:bg-primary\/80 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--seq-color-primary);
        @supports (color: color-mix(in lab, red, red)) {
          background-color: color-mix(in oklab, var(--seq-color-primary) 80%, transparent);
        }
      }
    }
  }
  .hover\:text-primary {
    &:hover {
      @media (hover: hover) {
        color: var(--seq-color-primary);
      }
    }
  }
  .hover\:text-primary\/80 {
    &:hover {
      @media (hover: hover) {
        color: var(--seq-color-primary);
        @supports (color: color-mix(in lab, red, red)) {
          color: color-mix(in oklab, var(--seq-color-primary) 80%, transparent);
        }
      }
    }
  }
  .hover\:opacity-80 {
    &:hover {
      @media (hover: hover) {
        opacity: 80%;
      }
    }
  }
  .hover\:not-disabled\:not-\[\[aria-invalid\=true\]\]\:not-has-\[\[aria-invalid\=true\]\]\:border-border-hover {
    &:hover {
      @media (hover: hover) {
        &:not(*:disabled) {
          &:not(*:is([aria-invalid=true])) {
            &:not(*:has(*:is([aria-invalid=true]))) {
              border-color: var(--seq-color-border-hover);
            }
          }
        }
      }
    }
  }
  .hover\:not-\[\[data-state\=active\]\]\:opacity-80 {
    &:hover {
      @media (hover: hover) {
        &:not(*:is([data-state=active])) {
          opacity: 80%;
        }
      }
    }
  }
  .focus\:bg-background-hover {
    &:focus {
      background-color: var(--seq-color-background-hover);
    }
  }
  .focus\:ring-2 {
    &:focus {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus\:outline-hidden {
    &:focus {
      --tw-outline-style: none;
      outline-style: none;
      @media (forced-colors: active) {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
    }
  }
  .focus-visible\:outline-2 {
    &:focus-visible {
      outline-style: var(--tw-outline-style);
      outline-width: 2px;
    }
  }
  .focus-visible\:outline-offset-1 {
    &:focus-visible {
      outline-offset: 1px;
    }
  }
  .focus-visible\:outline-border-focus {
    &:focus-visible {
      outline-color: var(--seq-color-border-focus);
    }
  }
  .disabled\:pointer-events-none {
    &:disabled {
      pointer-events: none;
    }
  }
  .disabled\:cursor-default {
    &:disabled {
      cursor: default;
    }
  }
  .disabled\:cursor-not-allowed {
    &:disabled {
      cursor: not-allowed;
    }
  }
  .disabled\:opacity-50 {
    &:disabled {
      opacity: 50%;
    }
  }
  .disabled\:opacity-100 {
    &:disabled {
      opacity: 100%;
    }
  }
  .inert\:absolute {
    &:is([inert], [inert] *) {
      position: absolute;
    }
  }
  .inert\:z-0 {
    &:is([inert], [inert] *) {
      z-index: 0;
    }
  }
  .inert\:overflow-clip {
    &:is([inert], [inert] *) {
      overflow: clip;
    }
  }
  .inert\:opacity-0 {
    &:is([inert], [inert] *) {
      opacity: 0%;
    }
  }
  .in-data-current\:translate-x-6 {
    :where(*[data-current]) & {
      --tw-translate-x: calc(var(--spacing) * 6);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .in-data-current\:opacity-100 {
    :where(*[data-current]) & {
      opacity: 100%;
    }
  }
  .has-data-\[state\=checked\]\:border-primary {
    &:has(*[data-state="checked"]) {
      border-color: var(--seq-color-primary);
    }
  }
  .has-data-\[state\=checked\]\:bg-primary\/5 {
    &:has(*[data-state="checked"]) {
      background-color: var(--seq-color-primary);
      @supports (color: color-mix(in lab, red, red)) {
        background-color: color-mix(in oklab, var(--seq-color-primary) 5%, transparent);
      }
    }
  }
  .has-\[\:focus-visible\]\:outline-2 {
    &:has(*:is(:focus-visible)) {
      outline-style: var(--tw-outline-style);
      outline-width: 2px;
    }
  }
  .has-\[\:focus-visible\]\:outline-border-focus {
    &:has(*:is(:focus-visible)) {
      outline-color: var(--seq-color-border-focus);
    }
  }
  .has-\[\[aria-invalid\=true\]\]\:border-destructive {
    &:has(*:is([aria-invalid=true])) {
      border-color: var(--seq-color-destructive);
    }
  }
  .has-\[\[aria-invalid\=true\]\]\:outline-destructive {
    &:has(*:is([aria-invalid=true])) {
      outline-color: var(--seq-color-destructive);
    }
  }
  .has-\[\[data-slot\=input-group-control\]\:disabled\]\:pointer-events-none {
    &:has(*:is([data-slot=input-group-control]:disabled)) {
      pointer-events: none;
    }
  }
  .has-\[\[data-slot\=input-group-control\]\:disabled\]\:cursor-not-allowed {
    &:has(*:is([data-slot=input-group-control]:disabled)) {
      cursor: not-allowed;
    }
  }
  .has-\[\[data-slot\=input-group-control\]\:disabled\]\:opacity-50 {
    &:has(*:is([data-slot=input-group-control]:disabled)) {
      opacity: 50%;
    }
  }
  .has-\[\[data-slot\=input-group-control\]\:focus-visible\]\:ring-\[3px\] {
    &:has(*:is([data-slot=input-group-control]:focus-visible)) {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .has-\[\[data-slot\]\[aria-invalid\=true\]\]\:border-destructive {
    &:has(*:is([data-slot][aria-invalid=true])) {
      border-color: var(--seq-color-destructive);
    }
  }
  .has-\[\[data-slot\]\[aria-invalid\=true\]\]\:outline-destructive {
    &:has(*:is([data-slot][aria-invalid=true])) {
      outline-color: var(--seq-color-destructive);
    }
  }
  .has-\[\>\[data-align\=block-end\]\]\:h-auto {
    &:has(>[data-align=block-end]) {
      height: auto;
    }
  }
  .has-\[\>\[data-align\=block-end\]\]\:flex-col {
    &:has(>[data-align=block-end]) {
      flex-direction: column;
    }
  }
  .has-\[\>\[data-align\=block-start\]\]\:h-auto {
    &:has(>[data-align=block-start]) {
      height: auto;
    }
  }
  .has-\[\>\[data-align\=block-start\]\]\:flex-col {
    &:has(>[data-align=block-start]) {
      flex-direction: column;
    }
  }
  .has-\[\>\[data-slot\=checkbox-group\]\]\:gap-3 {
    &:has(>[data-slot=checkbox-group]) {
      gap: calc(var(--spacing) * 3);
    }
  }
  .has-\[\>\[data-slot\=field-content\]\]\:items-start {
    &:has(>[data-slot=field-content]) {
      align-items: flex-start;
    }
  }
  .has-\[\>\[data-slot\=field\]\]\:w-full {
    &:has(>[data-slot=field]) {
      width: 100%;
    }
  }
  .has-\[\>\[data-slot\=field\]\]\:flex-col {
    &:has(>[data-slot=field]) {
      flex-direction: column;
    }
  }
  .has-\[\>\[data-slot\=field\]\]\:rounded-md {
    &:has(>[data-slot=field]) {
      border-radius: var(--radius-md);
    }
  }
  .has-\[\>\[data-slot\=field\]\]\:border {
    &:has(>[data-slot=field]) {
      border-style: var(--tw-border-style);
      border-width: 1px;
    }
  }
  .has-\[\>\[data-slot\=radio-group\]\]\:gap-3 {
    &:has(>[data-slot=radio-group]) {
      gap: calc(var(--spacing) * 3);
    }
  }
  .has-\[\>textarea\]\:h-auto {
    &:has(>textarea) {
      height: auto;
    }
  }
  .aria-invalid\:border-destructive {
    &[aria-invalid="true"] {
      border-color: var(--seq-color-destructive);
    }
  }
  .aria-invalid\:outline-destructive {
    &[aria-invalid="true"] {
      outline-color: var(--seq-color-destructive);
    }
  }
  .data-auto-advance\:data-current\:w-6 {
    &[data-auto-advance] {
      &[data-current] {
        width: calc(var(--spacing) * 6);
      }
    }
  }
  .data-disabled\:pointer-events-none {
    &[data-disabled] {
      pointer-events: none;
    }
  }
  .data-disabled\:cursor-default {
    &[data-disabled] {
      cursor: default;
    }
  }
  .data-disabled\:text-muted {
    &[data-disabled] {
      color: var(--seq-color-muted);
    }
  }
  .data-disabled\:text-primary\/50 {
    &[data-disabled] {
      color: var(--seq-color-primary);
      @supports (color: color-mix(in lab, red, red)) {
        color: color-mix(in oklab, var(--seq-color-primary) 50%, transparent);
      }
    }
  }
  .data-disabled\:opacity-80 {
    &[data-disabled] {
      opacity: 80%;
    }
  }
  .data-entered\:translate-x-0 {
    &[data-entered] {
      --tw-translate-x: calc(var(--spacing) * 0);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-entered\:opacity-100 {
    &[data-entered] {
      opacity: 100%;
    }
  }
  .data-entering\:translate-x-0 {
    &[data-entering] {
      --tw-translate-x: calc(var(--spacing) * 0);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-entering\:opacity-100 {
    &[data-entering] {
      opacity: 100%;
    }
  }
  .data-exited\:translate-x-16 {
    &[data-exited] {
      --tw-translate-x: calc(var(--spacing) * 16);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-exited\:opacity-0 {
    &[data-exited] {
      opacity: 0%;
    }
  }
  .data-exited\:transition-none\! {
    &[data-exited] {
      transition-property: none !important;
    }
  }
  .data-exiting\:-translate-x-16 {
    &[data-exiting] {
      --tw-translate-x: calc(var(--spacing) * -16);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-exiting\:opacity-0 {
    &[data-exiting] {
      opacity: 0%;
    }
  }
  .data-highlighted\:bg-background-hover {
    &[data-highlighted] {
      background-color: var(--seq-color-background-hover);
    }
  }
  .data-ltr\:data-exited\:-translate-x-16 {
    &[data-ltr] {
      &[data-exited] {
        --tw-translate-x: calc(var(--spacing) * -16);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
    }
  }
  .data-ltr\:data-exiting\:translate-x-16 {
    &[data-ltr] {
      &[data-exiting] {
        --tw-translate-x: calc(var(--spacing) * 16);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
    }
  }
  .data-pause\:translate-x-0 {
    &[data-pause] {
      --tw-translate-x: calc(var(--spacing) * 0);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-pause\:duration-300 {
    &[data-pause] {
      --tw-duration: 300ms;
      transition-duration: 300ms;
    }
  }
  .data-\[active\=true\]\:font-bold {
    &[data-active="true"] {
      --tw-font-weight: var(--font-weight-bold);
      font-weight: var(--font-weight-bold);
    }
  }
  .data-\[active\=true\]\:text-border-focus {
    &[data-active="true"] {
      color: var(--seq-color-border-focus);
    }
  }
  .data-\[disabled\]\:pointer-events-none {
    &[data-disabled] {
      pointer-events: none;
    }
  }
  .data-\[disabled\]\:opacity-50 {
    &[data-disabled] {
      opacity: 50%;
    }
  }
  .data-\[inset\]\:pl-8 {
    &[data-inset] {
      padding-left: calc(var(--spacing) * 8);
    }
  }
  .data-\[invalid\=true\]\:text-destructive {
    &[data-invalid="true"] {
      color: var(--seq-color-destructive);
    }
  }
  .data-\[orientation\=horizontal\]\:h-px {
    &[data-orientation="horizontal"] {
      height: 1px;
    }
  }
  .data-\[orientation\=horizontal\]\:w-full {
    &[data-orientation="horizontal"] {
      width: 100%;
    }
  }
  .data-\[orientation\=vertical\]\:h-full {
    &[data-orientation="vertical"] {
      height: 100%;
    }
  }
  .data-\[orientation\=vertical\]\:w-px {
    &[data-orientation="vertical"] {
      width: 1px;
    }
  }
  .data-\[placeholder\]\:text-muted {
    &[data-placeholder] {
      color: var(--seq-color-muted);
    }
  }
  .data-\[side\=bottom\]\:translate-y-1 {
    &[data-side="bottom"] {
      --tw-translate-y: calc(var(--spacing) * 1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[side\=bottom\]\:slide-in-from-top-2 {
    &[data-side="bottom"] {
      --tw-enter-translate-y: calc(2*var(--spacing)*-1);
    }
  }
  .data-\[side\=left\]\:-translate-x-1 {
    &[data-side="left"] {
      --tw-translate-x: calc(var(--spacing) * -1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[side\=left\]\:slide-in-from-right-2 {
    &[data-side="left"] {
      --tw-enter-translate-x: calc(2*var(--spacing));
    }
  }
  .data-\[side\=right\]\:translate-x-1 {
    &[data-side="right"] {
      --tw-translate-x: calc(var(--spacing) * 1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[side\=right\]\:slide-in-from-left-2 {
    &[data-side="right"] {
      --tw-enter-translate-x: calc(2*var(--spacing)*-1);
    }
  }
  .data-\[side\=top\]\:-translate-y-1 {
    &[data-side="top"] {
      --tw-translate-y: calc(var(--spacing) * -1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[side\=top\]\:slide-in-from-bottom-2 {
    &[data-side="top"] {
      --tw-enter-translate-y: calc(2*var(--spacing));
    }
  }
  .data-\[size\=default\]\:h-13 {
    &[data-size="default"] {
      height: calc(var(--spacing) * 13);
    }
  }
  .data-\[size\=sm\]\:h-8 {
    &[data-size="sm"] {
      height: calc(var(--spacing) * 8);
    }
  }
  .data-\[slot\=checkbox-group\]\:gap-3 {
    &[data-slot="checkbox-group"] {
      gap: calc(var(--spacing) * 3);
    }
  }
  .\*\:data-\[slot\=select-value\]\:line-clamp-1 {
    :is(& > *) {
      &[data-slot="select-value"] {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }
    }
  }
  .\*\:data-\[slot\=select-value\]\:flex {
    :is(& > *) {
      &[data-slot="select-value"] {
        display: flex;
      }
    }
  }
  .\*\:data-\[slot\=select-value\]\:items-center {
    :is(& > *) {
      &[data-slot="select-value"] {
        align-items: center;
      }
    }
  }
  .\*\:data-\[slot\=select-value\]\:gap-2 {
    :is(& > *) {
      &[data-slot="select-value"] {
        gap: calc(var(--spacing) * 2);
      }
    }
  }
  .data-\[state\=active\]\:border-border-focus {
    &[data-state="active"] {
      border-color: var(--seq-color-border-focus);
    }
  }
  .data-\[state\=active\]\:text-border-focus {
    &[data-state="active"] {
      color: var(--seq-color-border-focus);
    }
  }
  .data-\[state\=active\]\:text-primary {
    &[data-state="active"] {
      color: var(--seq-color-primary);
    }
  }
  .data-\[state\=checked\]\:translate-x-full {
    &[data-state="checked"] {
      --tw-translate-x: 100%;
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[state\=checked\]\:border-transparent\! {
    &[data-state="checked"] {
      border-color: transparent !important;
    }
  }
  .data-\[state\=checked\]\:bg-white {
    &[data-state="checked"] {
      background-color: var(--color-white);
    }
  }
  .data-\[state\=checked\]\:bg-gradient-primary {
    &[data-state="checked"] {
      background-image: var(--seq-color-gradient-primary);
    }
  }
  .data-\[state\=closed\]\:animate-out {
    &[data-state="closed"] {
      animation: exit var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none);
    }
  }
  .data-\[state\=closed\]\:duration-300 {
    &[data-state="closed"] {
      --tw-duration: 300ms;
      transition-duration: 300ms;
    }
  }
  .data-\[state\=closed\]\:fade-out-0 {
    &[data-state="closed"] {
      --tw-exit-opacity: calc(0/100);
      --tw-exit-opacity: 0;
    }
  }
  .data-\[state\=closed\]\:zoom-out-95 {
    &[data-state="closed"] {
      --tw-exit-scale: calc(95*1%);
      --tw-exit-scale: .95;
    }
  }
  .data-\[state\=closed\]\:slide-out-to-bottom {
    &[data-state="closed"] {
      --tw-exit-translate-y: 100%;
    }
  }
  .data-\[state\=closed\]\:slide-out-to-left {
    &[data-state="closed"] {
      --tw-exit-translate-x: -100%;
    }
  }
  .data-\[state\=closed\]\:slide-out-to-right {
    &[data-state="closed"] {
      --tw-exit-translate-x: 100%;
    }
  }
  .data-\[state\=closed\]\:slide-out-to-top {
    &[data-state="closed"] {
      --tw-exit-translate-y: -100%;
    }
  }
  .data-\[state\=open\]\:animate-in {
    &[data-state="open"] {
      animation: enter var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none);
    }
  }
  .data-\[state\=open\]\:duration-500 {
    &[data-state="open"] {
      --tw-duration: 500ms;
      transition-duration: 500ms;
    }
  }
  .data-\[state\=open\]\:fade-in-0 {
    &[data-state="open"] {
      --tw-enter-opacity: calc(0/100);
      --tw-enter-opacity: 0;
    }
  }
  .data-\[state\=open\]\:zoom-in-95 {
    &[data-state="open"] {
      --tw-enter-scale: calc(95*1%);
      --tw-enter-scale: .95;
    }
  }
  .data-\[state\=open\]\:slide-in-from-bottom {
    &[data-state="open"] {
      --tw-enter-translate-y: 100%;
    }
  }
  .data-\[state\=open\]\:slide-in-from-left {
    &[data-state="open"] {
      --tw-enter-translate-x: -100%;
    }
  }
  .data-\[state\=open\]\:slide-in-from-right {
    &[data-state="open"] {
      --tw-enter-translate-x: 100%;
    }
  }
  .data-\[state\=open\]\:slide-in-from-top {
    &[data-state="open"] {
      --tw-enter-translate-y: -100%;
    }
  }
  .data-\[swipe\=cancel\]\:translate-x-0 {
    &[data-swipe="cancel"] {
      --tw-translate-x: calc(var(--spacing) * 0);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[swipe\=cancel\]\:transition-transform {
    &[data-swipe="cancel"] {
      transition-property: transform, translate, scale, rotate;
      transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
      transition-duration: var(--tw-duration, var(--default-transition-duration));
    }
  }
  .data-\[swipe\=cancel\]\:duration-200 {
    &[data-swipe="cancel"] {
      --tw-duration: 200ms;
      transition-duration: 200ms;
    }
  }
  .data-\[swipe\=cancel\]\:ease-out {
    &[data-swipe="cancel"] {
      --tw-ease: var(--ease-out);
      transition-timing-function: var(--ease-out);
    }
  }
  .data-\[swipe\=end\]\:animate-swipe-out {
    &[data-swipe="end"] {
      animation: swipe-out 200ms ease-out;
    }
  }
  .data-\[swipe\=move\]\:translate-x-\(--radix-toast-swipe-move-x\) {
    &[data-swipe="move"] {
      --tw-translate-x: var(--radix-toast-swipe-move-x);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .nth-last-2\:-mt-1 {
    &:nth-last-child(2) {
      margin-top: calc(var(--spacing) * -1);
    }
  }
  .sm\:col-start-3 {
    @media (width >= 40rem) {
      grid-column-start: 3;
    }
  }
  .sm\:col-end-3 {
    @media (width >= 40rem) {
      grid-column-end: 3;
    }
  }
  .sm\:row-start-1 {
    @media (width >= 40rem) {
      grid-row-start: 1;
    }
  }
  .sm\:row-end-3 {
    @media (width >= 40rem) {
      grid-row-end: 3;
    }
  }
  .sm\:mt-0 {
    @media (width >= 40rem) {
      margin-top: calc(var(--spacing) * 0);
    }
  }
  .sm\:inline-flex {
    @media (width >= 40rem) {
      display: inline-flex;
    }
  }
  .sm\:max-w-lg {
    @media (width >= 40rem) {
      max-width: var(--container-lg);
    }
  }
  .sm\:max-w-sm {
    @media (width >= 40rem) {
      max-width: var(--container-sm);
    }
  }
  .sm\:flex-row {
    @media (width >= 40rem) {
      flex-direction: row;
    }
  }
  .sm\:items-center {
    @media (width >= 40rem) {
      align-items: center;
    }
  }
  .sm\:justify-between {
    @media (width >= 40rem) {
      justify-content: space-between;
    }
  }
  .sm\:justify-end {
    @media (width >= 40rem) {
      justify-content: flex-end;
    }
  }
  .sm\:text-left {
    @media (width >= 40rem) {
      text-align: left;
    }
  }
  .md\:bottom-auto {
    @media (width >= 48rem) {
      bottom: auto;
    }
  }
  .md\:h-\[800px\] {
    @media (width >= 48rem) {
      height: 800px;
    }
  }
  .md\:max-h-\[min\(800px\,calc\(100dvh-80px\)\)\] {
    @media (width >= 48rem) {
      max-height: min(800px, calc(100dvh - 80px));
    }
  }
  .md\:w-\[540px\] {
    @media (width >= 48rem) {
      width: 540px;
    }
  }
  .md\:w-\[720px\] {
    @media (width >= 48rem) {
      width: 720px;
    }
  }
  .md\:rounded-b-2xl {
    @media (width >= 48rem) {
      border-bottom-right-radius: var(--radius-2xl);
      border-bottom-left-radius: var(--radius-2xl);
    }
  }
  .md\:p-12 {
    @media (width >= 48rem) {
      padding: calc(var(--spacing) * 12);
    }
  }
  .lg\:h-auto\! {
    @media (width >= 64rem) {
      height: auto !important;
    }
  }
  .\@md\/field-group\:flex-row {
    @container field-group (width >= 28rem) {
      flex-direction: row;
    }
  }
  .\@md\/field-group\:items-center {
    @container field-group (width >= 28rem) {
      align-items: center;
    }
  }
  .\@md\/field-group\:has-\[\>\[data-slot\=field-content\]\]\:items-start {
    @container field-group (width >= 28rem) {
      &:has(>[data-slot=field-content]) {
        align-items: flex-start;
      }
    }
  }
  .dark\:\[--alert-accent\:var\(--color-green-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-accent: var(--color-green-400);
    }
  }
  .dark\:\[--alert-accent\:var\(--color-indigo-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-accent: var(--color-indigo-400);
    }
  }
  .dark\:\[--alert-accent\:var\(--color-red-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-accent: var(--color-red-400);
    }
  }
  .dark\:\[--alert-accent\:var\(--color-yellow-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-accent: var(--color-yellow-400);
    }
  }
  .dark\:\[--alert-background\:var\(--color-green-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-background: var(--color-green-950);
    }
  }
  .dark\:\[--alert-background\:var\(--color-indigo-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-background: var(--color-indigo-950);
    }
  }
  .dark\:\[--alert-background\:var\(--color-red-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-background: var(--color-red-950);
    }
  }
  .dark\:\[--alert-background\:var\(--color-yellow-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-background: var(--color-yellow-950);
    }
  }
  .dark\:\[--alert-border\:var\(--color-green-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-border: var(--color-green-900);
    }
  }
  .dark\:\[--alert-border\:var\(--color-indigo-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-border: var(--color-indigo-900);
    }
  }
  .dark\:\[--alert-border\:var\(--color-red-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-border: var(--color-red-900);
    }
  }
  .dark\:\[--alert-border\:var\(--color-yellow-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --alert-border: var(--color-yellow-900);
    }
  }
  .dark\:\[--callout-accent\:var\(--color-green-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-accent: var(--color-green-400);
    }
  }
  .dark\:\[--callout-accent\:var\(--color-indigo-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-accent: var(--color-indigo-400);
    }
  }
  .dark\:\[--callout-accent\:var\(--color-red-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-accent: var(--color-red-400);
    }
  }
  .dark\:\[--callout-accent\:var\(--color-yellow-400\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-accent: var(--color-yellow-400);
    }
  }
  .dark\:\[--callout-content\:var\(--color-green-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-content: var(--color-green-950);
    }
  }
  .dark\:\[--callout-content\:var\(--color-indigo-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-content: var(--color-indigo-950);
    }
  }
  .dark\:\[--callout-content\:var\(--color-red-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-content: var(--color-red-950);
    }
  }
  .dark\:\[--callout-content\:var\(--color-yellow-950\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-content: var(--color-yellow-950);
    }
  }
  .dark\:\[--callout-header\:var\(--color-green-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-header: var(--color-green-900);
    }
  }
  .dark\:\[--callout-header\:var\(--color-indigo-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-header: var(--color-indigo-900);
    }
  }
  .dark\:\[--callout-header\:var\(--color-red-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-header: var(--color-red-900);
    }
  }
  .dark\:\[--callout-header\:var\(--color-yellow-900\)\] {
    &:where([data-theme="dark"], [data-theme="dark"] *) {
      --callout-header: var(--color-yellow-900);
    }
  }
  .\[\&_\[data-slot\=alert-button\]\]\:text-\(--alert-accent\) {
    & [data-slot=alert-button] {
      color: var(--alert-accent);
    }
  }
  .\[\&_span\]\:size-\[12px\] {
    & span {
      width: 12px;
      height: 12px;
    }
  }
  .\[\&_span\]\:size-\[18px\] {
    & span {
      width: 18px;
      height: 18px;
    }
  }
  .\[\&_svg\]\:pointer-events-none {
    & svg {
      pointer-events: none;
    }
  }
  .\[\&_svg\]\:shrink-0 {
    & svg {
      flex-shrink: 0;
    }
  }
  .\[\&_svg\:not\(\[class\*\=\"size-\"\]\)\]\:size-4 {
    & svg:not([class*="size-"]) {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
  }
  .\[\&_svg\:not\(\[class\*\=\"size-\"\]\)\]\:size-5 {
    & svg:not([class*="size-"]) {
      width: calc(var(--spacing) * 5);
      height: calc(var(--spacing) * 5);
    }
  }
  .\[\&_svg\:not\(\[class\*\=\'size-\'\]\)\]\:size-4 {
    & svg:not([class*='size-']) {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
  }
  .\[\&_svg\:not\(\[class\*\=\'size-\'\]\)\]\:size-9 {
    & svg:not([class*='size-']) {
      width: calc(var(--spacing) * 9);
      height: calc(var(--spacing) * 9);
    }
  }
  .\[\&_svg\:not\(\[class\*\=\'text-\'\]\)\]\:text-muted {
    & svg:not([class*='text-']) {
      color: var(--seq-color-muted);
    }
  }
  .\[\&_thead_th\]\:sticky {
    & thead th {
      position: sticky;
    }
  }
  .\[\&_thead_th\]\:top-0 {
    & thead th {
      top: calc(var(--spacing) * 0);
    }
  }
  .\[\&_thead_th\]\:z-10 {
    & thead th {
      z-index: 10;
    }
  }
  .\[\&_thead_th\]\:bg-background-primary {
    & thead th {
      background-color: var(--seq-color-background-primary);
    }
  }
  .\[\&\:has\(\:disabled\)\]\:cursor-default {
    &:has(:disabled) {
      cursor: default;
    }
  }
  .\[\&\:has\(\:disabled\)\]\:opacity-50 {
    &:has(:disabled) {
      opacity: 50%;
    }
  }
  .\[\&\:has\(\[role\=checkbox\]\)\]\:pr-0 {
    &:has([role=checkbox]) {
      padding-right: calc(var(--spacing) * 0);
    }
  }
  .\[\&\:has\(button\)\]\:px-0 {
    &:has(button) {
      padding-inline: calc(var(--spacing) * 0);
    }
  }
  .\[\.border-b\]\:pb-3 {
    &:is(.border-b) {
      padding-bottom: calc(var(--spacing) * 3);
    }
  }
  .\[\.border-t\]\:pt-3 {
    &:is(.border-t) {
      padding-top: calc(var(--spacing) * 3);
    }
  }
  .\*\:\[span\]\:last\:flex {
    :is(& > *) {
      &:is(span) {
        &:last-child {
          display: flex;
        }
      }
    }
  }
  .\*\:\[span\]\:last\:items-center {
    :is(& > *) {
      &:is(span) {
        &:last-child {
          align-items: center;
        }
      }
    }
  }
  .\*\:\[span\]\:last\:gap-2 {
    :is(& > *) {
      &:is(span) {
        &:last-child {
          gap: calc(var(--spacing) * 2);
        }
      }
    }
  }
  .\[\&\>\*\]\:w-full {
    &>* {
      width: 100%;
    }
  }
  .\[\&\>\*\]\:data-\[slot\=field\]\:p-4 {
    &>* {
      &[data-slot="field"] {
        padding: calc(var(--spacing) * 4);
      }
    }
  }
  .\@md\/field-group\:\[\&\>\*\]\:w-auto {
    @container field-group (width >= 28rem) {
      &>* {
        width: auto;
      }
    }
  }
  .\[\&\>\.sr-only\]\:w-auto {
    &>.sr-only {
      width: auto;
    }
  }
  .\[\&\>\[data-slot\=field-group\]\]\:gap-4 {
    &>[data-slot=field-group] {
      gap: calc(var(--spacing) * 4);
    }
  }
  .\[\&\>\[data-slot\=field-label\]\]\:flex-auto {
    &>[data-slot=field-label] {
      flex: auto;
    }
  }
  .\@md\/field-group\:\[\&\>\[data-slot\=field-label\]\]\:flex-auto {
    @container field-group (width >= 28rem) {
      &>[data-slot=field-label] {
        flex: auto;
      }
    }
  }
  .has-\[\>\[data-slot\=field-content\]\]\:\[\&\>\[role\=checkbox\]\,\[role\=radio\]\]\:mt-px {
    &:has(>[data-slot=field-content]) {
      &>[role=checkbox],[role=radio] {
        margin-top: 1px;
      }
    }
  }
  .\@md\/field-group\:has-\[\>\[data-slot\=field-content\]\]\:\[\&\>\[role\=checkbox\]\,\[role\=radio\]\]\:mt-px {
    @container field-group (width >= 28rem) {
      &:has(>[data-slot=field-content]) {
        &>[role=checkbox],[role=radio] {
          margin-top: 1px;
        }
      }
    }
  }
  .\[\&\>a\]\:underline {
    &>a {
      text-decoration-line: underline;
    }
  }
  .\[\&\>a\]\:underline-offset-4 {
    &>a {
      text-underline-offset: 4px;
    }
  }
  .\[\&\>a\:hover\]\:text-primary {
    &>a:hover {
      color: var(--seq-color-primary);
    }
  }
  .has-\[\>\[data-align\=block-end\]\]\:\[\&\>input\]\:pt-3 {
    &:has(>[data-align=block-end]) {
      &>input {
        padding-top: calc(var(--spacing) * 3);
      }
    }
  }
  .has-\[\>\[data-align\=block-start\]\]\:\[\&\>input\]\:pb-3 {
    &:has(>[data-align=block-start]) {
      &>input {
        padding-bottom: calc(var(--spacing) * 3);
      }
    }
  }
  .has-\[\>\[data-align\=inline-end\]\]\:\[\&\>input\]\:pr-2 {
    &:has(>[data-align=inline-end]) {
      &>input {
        padding-right: calc(var(--spacing) * 2);
      }
    }
  }
  .has-\[\>\[data-align\=inline-start\]\]\:\[\&\>input\]\:pl-2 {
    &:has(>[data-align=inline-start]) {
      &>input {
        padding-left: calc(var(--spacing) * 2);
      }
    }
  }
  .\[\&\>svg\]\:mr-2 {
    &>svg {
      margin-right: calc(var(--spacing) * 2);
    }
  }
  .\[\&\>svg\]\:self-start {
    &>svg {
      align-self: flex-start;
    }
  }
  .\[\&\>svg\]\:text-\(--alert-accent\) {
    &>svg {
      color: var(--alert-accent);
    }
  }
  .\[\&\>td\]\:first\:rounded-l-lg {
    &>td {
      &:first-child {
        border-top-left-radius: var(--radius-lg);
        border-bottom-left-radius: var(--radius-lg);
      }
    }
  }
  .\[\&\>td\]\:last\:rounded-r-lg {
    &>td {
      &:last-child {
        border-top-right-radius: var(--radius-lg);
        border-bottom-right-radius: var(--radius-lg);
      }
    }
  }
  .focus-within\:\[\&\>td\]\:bg-background-hover {
    &:focus-within {
      &>td {
        background-color: var(--seq-color-background-hover);
      }
    }
  }
  .hover\:\[\&\>td\]\:bg-background-hover {
    &:hover {
      @media (hover: hover) {
        &>td {
          background-color: var(--seq-color-background-hover);
        }
      }
    }
  }
  .data-\[state\=selected\]\:\[\&\>td\]\:bg-background-hover {
    &[data-state="selected"] {
      &>td {
        background-color: var(--seq-color-background-hover);
      }
    }
  }
  .\[\[data-variant\=legend\]\+\&\]\:-mt-1\.5 {
    [data-variant=legend]+& {
      margin-top: calc(var(--spacing) * -1.5);
    }
  }
}
@property --tw-animation-delay {
  syntax: "*";
  inherits: false;
  initial-value: 0s;
}
@property --tw-animation-direction {
  syntax: "*";
  inherits: false;
  initial-value: normal;
}
@property --tw-animation-duration {
  syntax: "*";
  inherits: false;
}
@property --tw-animation-fill-mode {
  syntax: "*";
  inherits: false;
  initial-value: none;
}
@property --tw-animation-iteration-count {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-enter-blur {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-enter-opacity {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-enter-rotate {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-enter-scale {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-enter-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-enter-translate-y {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-exit-blur {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-exit-opacity {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-exit-rotate {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-exit-scale {
  syntax: "*";
  inherits: false;
  initial-value: 1;
}
@property --tw-exit-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-exit-translate-y {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
:root, [data-theme=light] {
  --seq-color-positive: var(--color-green-600);
  --seq-color-negative: var(--color-red-600);
  --seq-color-info: var(--color-indigo-600);
  --seq-color-warning: var(--color-yellow-500);
  --seq-color-destructive: var(--color-red-600);
  --seq-color-primary: var(--color-slate-800);
  --seq-color-secondary: var(--color-slate-800);
  --seq-color-muted: var(--color-slate-500);
  --seq-color-inverse: var(--color-slate-50);
  --seq-color-button-primary: var(--color-white);
  --seq-color-background-primary: var(--color-slate-50);
  --seq-color-background-secondary: white;
  --seq-color-background-muted: var(--color-slate-100);
  --seq-color-background-inverse: var(--color-slate-950);
  --seq-color-background-overlay: color-mix( in oklab, oklch(86.9% 0.022 252.894) 80%, transparent );
  @supports (color: color-mix(in lab, red, red)) {
    --seq-color-background-overlay: color-mix( in oklab, var(--color-slate-300) 80%, transparent );
  }
  --seq-color-background-raised: white;
  --seq-color-background-input: var(--color-slate-50);
  --seq-color-background-hover: var(--color-slate-100);
  --seq-color-background-active: var(--color-slate-200);
  --seq-color-border-normal: var(--color-slate-300);
  --seq-color-border-hover: var(--color-slate-400);
  --seq-color-border-focus: var(--color-violet-600);
  --seq-color-border-card: var(--color-slate-200);
  --seq-color-border-button: var(--color-slate-300);
  --seq-color-drop-shadow: color-mix( in oklab, oklch(12.9% 0.042 264.695) 15%, transparent );
  @supports (color: color-mix(in lab, red, red)) {
    --seq-color-drop-shadow: color-mix( in oklab, var(--color-slate-950) 15%, transparent );
  }
  --seq-color-gradient-backdrop: linear-gradient(
      
      243.18deg,
      rgba(86, 52, 189, 0.85) 0%,
      rgba(49, 41, 223, 0.85) 63.54%,
      rgba(7, 98, 149, 0.85) 100% );
  --seq-color-gradient-primary: linear-gradient(
      
      89.69deg,
      #4411e1 0.27%,
      #7537f9 99.73% );
  --seq-color-gradient-secondary: linear-gradient(
      
      32.51deg,
      #951990 -15.23%,
      #3a35b1 48.55%,
      #20a8b0 100% );
  --seq-color-gradient-skeleton: linear-gradient(
      
      -45deg,
      transparent,
      var(--color-slate-300),
      transparent );
}
[data-theme=dark] {
  --seq-color-positive: var(--color-green-500);
  --seq-color-negative: var(--color-red-500);
  --seq-color-info: var(--color-indigo-500);
  --seq-color-warning: var(--color-yellow-500);
  --seq-color-destructive: var(--color-red-500);
  --seq-color-primary: white;
  --seq-color-secondary: white;
  --seq-color-muted: var(--color-zinc-500);
  --seq-color-inverse: black;
  --seq-color-button-primary: var(--color-white);
  --seq-color-background-primary: black;
  --seq-color-background-secondary: var(--color-zinc-900);
  --seq-color-background-muted: var(--color-zinc-950);
  --seq-color-background-inverse: white;
  --seq-color-background-overlay: color-mix( in oklab, oklch(37% 0.013 285.805) 90%, transparent );
  @supports (color: color-mix(in lab, red, red)) {
    --seq-color-background-overlay: color-mix( in oklab, var(--color-zinc-700) 90%, transparent );
  }
  --seq-color-background-raised: var(--color-zinc-800);
  --seq-color-background-input: var(--color-zinc-950);
  --seq-color-background-hover: var(--color-zinc-900);
  --seq-color-background-active: var(--color-zinc-700);
  --seq-color-border-normal: var(--color-zinc-700);
  --seq-color-border-hover: var(--color-zinc-600);
  --seq-color-border-focus: var(--color-violet-500);
  --seq-color-border-card: var(--color-zinc-800);
  --seq-color-border-button: var(--color-zinc-700);
  --seq-color-drop-shadow: color-mix( in oklab, oklch(14.1% 0.005 285.823) 40%, transparent );
  @supports (color: color-mix(in lab, red, red)) {
    --seq-color-drop-shadow: color-mix( in oklab, var(--color-zinc-950) 40%, transparent );
  }
  --seq-color-gradient-backdrop: linear-gradient(
      
      243.18deg,
      rgba(86, 52, 189, 0.85) 0%,
      rgba(49, 41, 223, 0.85) 63.54%,
      rgba(7, 98, 149, 0.85) 100% );
  --seq-color-gradient-primary: linear-gradient(
      
      89.69deg,
      #4411e1 0.27%,
      #7537f9 99.73% );
  --seq-color-gradient-secondary: linear-gradient(
      
      32.51deg,
      #951990 -15.23%,
      #3a35b1 48.55%,
      #20a8b0 100% );
  --seq-color-gradient-skeleton: linear-gradient(
      
      -45deg,
      transparent,
      var(--color-zinc-700),
      transparent );
}
:root {
  --base-unit: 16;
  color: var(--color-primary);
}
@property --tw-border-spacing-x {
  syntax: "<length>";
  inherits: false;
  initial-value: 0;
}
@property --tw-border-spacing-y {
  syntax: "<length>";
  inherits: false;
  initial-value: 0;
}
@property --tw-translate-x {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-translate-y {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-translate-z {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-rotate-x {
  syntax: "*";
  inherits: false;
}
@property --tw-rotate-y {
  syntax: "*";
  inherits: false;
}
@property --tw-rotate-z {
  syntax: "*";
  inherits: false;
}
@property --tw-skew-x {
  syntax: "*";
  inherits: false;
}
@property --tw-skew-y {
  syntax: "*";
  inherits: false;
}
@property --tw-border-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}
@property --tw-leading {
  syntax: "*";
  inherits: false;
}
@property --tw-font-weight {
  syntax: "*";
  inherits: false;
}
@property --tw-tracking {
  syntax: "*";
  inherits: false;
}
@property --tw-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-inset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-inset-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-ring-color {
  syntax: "*";
  inherits: false;
}
@property --tw-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-ring-color {
  syntax: "*";
  inherits: false;
}
@property --tw-inset-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-ring-inset {
  syntax: "*";
  inherits: false;
}
@property --tw-ring-offset-width {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}
@property --tw-ring-offset-color {
  syntax: "*";
  inherits: false;
  initial-value: #fff;
}
@property --tw-ring-offset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-outline-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}
@property --tw-blur {
  syntax: "*";
  inherits: false;
}
@property --tw-brightness {
  syntax: "*";
  inherits: false;
}
@property --tw-contrast {
  syntax: "*";
  inherits: false;
}
@property --tw-grayscale {
  syntax: "*";
  inherits: false;
}
@property --tw-hue-rotate {
  syntax: "*";
  inherits: false;
}
@property --tw-invert {
  syntax: "*";
  inherits: false;
}
@property --tw-opacity {
  syntax: "*";
  inherits: false;
}
@property --tw-saturate {
  syntax: "*";
  inherits: false;
}
@property --tw-sepia {
  syntax: "*";
  inherits: false;
}
@property --tw-drop-shadow {
  syntax: "*";
  inherits: false;
}
@property --tw-drop-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-drop-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-drop-shadow-size {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-blur {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-brightness {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-contrast {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-grayscale {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-hue-rotate {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-invert {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-opacity {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-saturate {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-sepia {
  syntax: "*";
  inherits: false;
}
@property --tw-duration {
  syntax: "*";
  inherits: false;
}
@property --tw-ease {
  syntax: "*";
  inherits: false;
}
@property --tw-content {
  syntax: "*";
  initial-value: "";
  inherits: false;
}
@property --tw-gradient-position {
  syntax: "*";
  inherits: false;
}
@property --tw-gradient-from {
  syntax: "<color>";
  inherits: false;
  initial-value: #0000;
}
@property --tw-gradient-via {
  syntax: "<color>";
  inherits: false;
  initial-value: #0000;
}
@property --tw-gradient-to {
  syntax: "<color>";
  inherits: false;
  initial-value: #0000;
}
@property --tw-gradient-stops {
  syntax: "*";
  inherits: false;
}
@property --tw-gradient-via-stops {
  syntax: "*";
  inherits: false;
}
@property --tw-gradient-from-position {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0%;
}
@property --tw-gradient-via-position {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 50%;
}
@property --tw-gradient-to-position {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 100%;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity,1);
    transform: translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0)scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1))rotate(var(--tw-enter-rotate,0));
    filter: blur(var(--tw-enter-blur,0));
  }
}
@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity,1);
    transform: translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0)scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1))rotate(var(--tw-exit-rotate,0));
    filter: blur(var(--tw-exit-blur,0));
  }
}
@keyframes skeleton {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@keyframes swipe-out {
  from {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  to {
    transform: translateX(100%);
  }
}
@layer properties {
  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {
    *, ::before, ::after, ::backdrop {
      --tw-border-spacing-x: 0;
      --tw-border-spacing-y: 0;
      --tw-translate-x: 0;
      --tw-translate-y: 0;
      --tw-translate-z: 0;
      --tw-rotate-x: initial;
      --tw-rotate-y: initial;
      --tw-rotate-z: initial;
      --tw-skew-x: initial;
      --tw-skew-y: initial;
      --tw-border-style: solid;
      --tw-leading: initial;
      --tw-font-weight: initial;
      --tw-tracking: initial;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-color: initial;
      --tw-shadow-alpha: 100%;
      --tw-inset-shadow: 0 0 #0000;
      --tw-inset-shadow-color: initial;
      --tw-inset-shadow-alpha: 100%;
      --tw-ring-color: initial;
      --tw-ring-shadow: 0 0 #0000;
      --tw-inset-ring-color: initial;
      --tw-inset-ring-shadow: 0 0 #0000;
      --tw-ring-inset: initial;
      --tw-ring-offset-width: 0px;
      --tw-ring-offset-color: #fff;
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-outline-style: solid;
      --tw-blur: initial;
      --tw-brightness: initial;
      --tw-contrast: initial;
      --tw-grayscale: initial;
      --tw-hue-rotate: initial;
      --tw-invert: initial;
      --tw-opacity: initial;
      --tw-saturate: initial;
      --tw-sepia: initial;
      --tw-drop-shadow: initial;
      --tw-drop-shadow-color: initial;
      --tw-drop-shadow-alpha: 100%;
      --tw-drop-shadow-size: initial;
      --tw-backdrop-blur: initial;
      --tw-backdrop-brightness: initial;
      --tw-backdrop-contrast: initial;
      --tw-backdrop-grayscale: initial;
      --tw-backdrop-hue-rotate: initial;
      --tw-backdrop-invert: initial;
      --tw-backdrop-opacity: initial;
      --tw-backdrop-saturate: initial;
      --tw-backdrop-sepia: initial;
      --tw-duration: initial;
      --tw-ease: initial;
      --tw-content: "";
      --tw-gradient-position: initial;
      --tw-gradient-from: #0000;
      --tw-gradient-via: #0000;
      --tw-gradient-to: #0000;
      --tw-gradient-stops: initial;
      --tw-gradient-via-stops: initial;
      --tw-gradient-from-position: 0%;
      --tw-gradient-via-position: 50%;
      --tw-gradient-to-position: 100%;
      --tw-animation-delay: 0s;
      --tw-animation-direction: normal;
      --tw-animation-duration: initial;
      --tw-animation-fill-mode: none;
      --tw-animation-iteration-count: 1;
      --tw-enter-blur: 0;
      --tw-enter-opacity: 1;
      --tw-enter-rotate: 0;
      --tw-enter-scale: 1;
      --tw-enter-translate-x: 0;
      --tw-enter-translate-y: 0;
      --tw-exit-blur: 0;
      --tw-exit-opacity: 1;
      --tw-exit-rotate: 0;
      --tw-exit-scale: 1;
      --tw-exit-translate-x: 0;
      --tw-exit-translate-y: 0;
    }
  }
}

`
