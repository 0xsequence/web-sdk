export const styles = String.raw`
/*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */
@layer theme, base, components, utilities;
@layer theme {
  :root, :host {
    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    --color-red-50: oklch(0.971 0.013 17.38);
    --color-red-100: oklch(0.936 0.032 17.717);
    --color-red-200: oklch(0.885 0.062 18.334);
    --color-red-300: oklch(0.808 0.114 19.571);
    --color-red-400: oklch(0.704 0.191 22.216);
    --color-red-500: oklch(0.637 0.237 25.331);
    --color-red-600: oklch(0.577 0.245 27.325);
    --color-red-700: oklch(0.505 0.213 27.518);
    --color-red-800: oklch(0.444 0.177 26.899);
    --color-red-900: oklch(0.396 0.141 25.723);
    --color-red-950: oklch(0.258 0.092 26.042);
    --color-orange-50: oklch(0.98 0.016 73.684);
    --color-orange-100: oklch(0.954 0.038 75.164);
    --color-orange-200: oklch(0.901 0.076 70.697);
    --color-orange-300: oklch(0.837 0.128 66.29);
    --color-orange-400: oklch(0.75 0.183 55.934);
    --color-orange-500: oklch(0.705 0.213 47.604);
    --color-orange-600: oklch(0.646 0.222 41.116);
    --color-orange-700: oklch(0.553 0.195 38.402);
    --color-orange-800: oklch(0.47 0.157 37.304);
    --color-orange-900: oklch(0.408 0.123 38.172);
    --color-orange-950: oklch(0.266 0.079 36.259);
    --color-amber-50: oklch(0.987 0.022 95.277);
    --color-amber-100: oklch(0.962 0.059 95.617);
    --color-amber-200: oklch(0.924 0.12 95.746);
    --color-amber-300: oklch(0.879 0.169 91.605);
    --color-amber-400: oklch(0.828 0.189 84.429);
    --color-amber-500: oklch(0.769 0.188 70.08);
    --color-amber-600: oklch(0.666 0.179 58.318);
    --color-amber-700: oklch(0.555 0.163 48.998);
    --color-amber-800: oklch(0.473 0.137 46.201);
    --color-amber-900: oklch(0.414 0.112 45.904);
    --color-amber-950: oklch(0.279 0.077 45.635);
    --color-yellow-50: oklch(0.987 0.026 102.212);
    --color-yellow-100: oklch(0.973 0.071 103.193);
    --color-yellow-200: oklch(0.945 0.129 101.54);
    --color-yellow-300: oklch(0.905 0.182 98.111);
    --color-yellow-400: oklch(0.852 0.199 91.936);
    --color-yellow-500: oklch(0.795 0.184 86.047);
    --color-yellow-600: oklch(0.681 0.162 75.834);
    --color-yellow-700: oklch(0.554 0.135 66.442);
    --color-yellow-800: oklch(0.476 0.114 61.907);
    --color-yellow-900: oklch(0.421 0.095 57.708);
    --color-yellow-950: oklch(0.286 0.066 53.813);
    --color-lime-50: oklch(0.986 0.031 120.757);
    --color-lime-100: oklch(0.967 0.067 122.328);
    --color-lime-200: oklch(0.938 0.127 124.321);
    --color-lime-300: oklch(0.897 0.196 126.665);
    --color-lime-400: oklch(0.841 0.238 128.85);
    --color-lime-500: oklch(0.768 0.233 130.85);
    --color-lime-600: oklch(0.648 0.2 131.684);
    --color-lime-700: oklch(0.532 0.157 131.589);
    --color-lime-800: oklch(0.453 0.124 130.933);
    --color-lime-900: oklch(0.405 0.101 131.063);
    --color-lime-950: oklch(0.274 0.072 132.109);
    --color-green-50: oklch(0.982 0.018 155.826);
    --color-green-100: oklch(0.962 0.044 156.743);
    --color-green-200: oklch(0.925 0.084 155.995);
    --color-green-300: oklch(0.871 0.15 154.449);
    --color-green-400: oklch(0.792 0.209 151.711);
    --color-green-500: oklch(0.723 0.219 149.579);
    --color-green-600: oklch(0.627 0.194 149.214);
    --color-green-700: oklch(0.527 0.154 150.069);
    --color-green-800: oklch(0.448 0.119 151.328);
    --color-green-900: oklch(0.393 0.095 152.535);
    --color-green-950: oklch(0.266 0.065 152.934);
    --color-emerald-50: oklch(0.979 0.021 166.113);
    --color-emerald-100: oklch(0.95 0.052 163.051);
    --color-emerald-200: oklch(0.905 0.093 164.15);
    --color-emerald-300: oklch(0.845 0.143 164.978);
    --color-emerald-400: oklch(0.765 0.177 163.223);
    --color-emerald-500: oklch(0.696 0.17 162.48);
    --color-emerald-600: oklch(0.596 0.145 163.225);
    --color-emerald-700: oklch(0.508 0.118 165.612);
    --color-emerald-800: oklch(0.432 0.095 166.913);
    --color-emerald-900: oklch(0.378 0.077 168.94);
    --color-emerald-950: oklch(0.262 0.051 172.552);
    --color-teal-50: oklch(0.984 0.014 180.72);
    --color-teal-100: oklch(0.953 0.051 180.801);
    --color-teal-200: oklch(0.91 0.096 180.426);
    --color-teal-300: oklch(0.855 0.138 181.071);
    --color-teal-400: oklch(0.777 0.152 181.912);
    --color-teal-500: oklch(0.704 0.14 182.503);
    --color-teal-600: oklch(0.6 0.118 184.704);
    --color-teal-700: oklch(0.511 0.096 186.391);
    --color-teal-800: oklch(0.437 0.078 188.216);
    --color-teal-900: oklch(0.386 0.063 188.416);
    --color-teal-950: oklch(0.277 0.046 192.524);
    --color-cyan-50: oklch(0.984 0.019 200.873);
    --color-cyan-100: oklch(0.956 0.045 203.388);
    --color-cyan-200: oklch(0.917 0.08 205.041);
    --color-cyan-300: oklch(0.865 0.127 207.078);
    --color-cyan-400: oklch(0.789 0.154 211.53);
    --color-cyan-500: oklch(0.715 0.143 215.221);
    --color-cyan-600: oklch(0.609 0.126 221.723);
    --color-cyan-700: oklch(0.52 0.105 223.128);
    --color-cyan-800: oklch(0.45 0.085 224.283);
    --color-cyan-900: oklch(0.398 0.07 227.392);
    --color-cyan-950: oklch(0.302 0.056 229.695);
    --color-sky-50: oklch(0.977 0.013 236.62);
    --color-sky-100: oklch(0.951 0.026 236.824);
    --color-sky-200: oklch(0.901 0.058 230.902);
    --color-sky-300: oklch(0.828 0.111 230.318);
    --color-sky-400: oklch(0.746 0.16 232.661);
    --color-sky-500: oklch(0.685 0.169 237.323);
    --color-sky-600: oklch(0.588 0.158 241.966);
    --color-sky-700: oklch(0.5 0.134 242.749);
    --color-sky-800: oklch(0.443 0.11 240.79);
    --color-sky-900: oklch(0.391 0.09 240.876);
    --color-sky-950: oklch(0.293 0.066 243.157);
    --color-blue-50: oklch(0.97 0.014 254.604);
    --color-blue-100: oklch(0.932 0.032 255.585);
    --color-blue-200: oklch(0.882 0.059 254.128);
    --color-blue-300: oklch(0.809 0.105 251.813);
    --color-blue-400: oklch(0.707 0.165 254.624);
    --color-blue-500: oklch(0.623 0.214 259.815);
    --color-blue-600: oklch(0.546 0.245 262.881);
    --color-blue-700: oklch(0.488 0.243 264.376);
    --color-blue-800: oklch(0.424 0.199 265.638);
    --color-blue-900: oklch(0.379 0.146 265.522);
    --color-blue-950: oklch(0.282 0.091 267.935);
    --color-indigo-50: oklch(0.962 0.018 272.314);
    --color-indigo-100: oklch(0.93 0.034 272.788);
    --color-indigo-200: oklch(0.87 0.065 274.039);
    --color-indigo-300: oklch(0.785 0.115 274.713);
    --color-indigo-400: oklch(0.673 0.182 276.935);
    --color-indigo-500: oklch(0.585 0.233 277.117);
    --color-indigo-600: oklch(0.511 0.262 276.966);
    --color-indigo-700: oklch(0.457 0.24 277.023);
    --color-indigo-800: oklch(0.398 0.195 277.366);
    --color-indigo-900: oklch(0.359 0.144 278.697);
    --color-indigo-950: oklch(0.257 0.09 281.288);
    --color-violet-50: oklch(0.969 0.016 293.756);
    --color-violet-100: oklch(0.943 0.029 294.588);
    --color-violet-200: oklch(0.894 0.057 293.283);
    --color-violet-300: oklch(0.811 0.111 293.571);
    --color-violet-400: oklch(0.702 0.183 293.541);
    --color-violet-500: oklch(0.606 0.25 292.717);
    --color-violet-600: oklch(0.541 0.281 293.009);
    --color-violet-700: oklch(0.491 0.27 292.581);
    --color-violet-800: oklch(0.432 0.232 292.759);
    --color-violet-900: oklch(0.38 0.189 293.745);
    --color-violet-950: oklch(0.283 0.141 291.089);
    --color-purple-50: oklch(0.977 0.014 308.299);
    --color-purple-100: oklch(0.946 0.033 307.174);
    --color-purple-200: oklch(0.902 0.063 306.703);
    --color-purple-300: oklch(0.827 0.119 306.383);
    --color-purple-400: oklch(0.714 0.203 305.504);
    --color-purple-500: oklch(0.627 0.265 303.9);
    --color-purple-600: oklch(0.558 0.288 302.321);
    --color-purple-700: oklch(0.496 0.265 301.924);
    --color-purple-800: oklch(0.438 0.218 303.724);
    --color-purple-900: oklch(0.381 0.176 304.987);
    --color-purple-950: oklch(0.291 0.149 302.717);
    --color-fuchsia-50: oklch(0.977 0.017 320.058);
    --color-fuchsia-100: oklch(0.952 0.037 318.852);
    --color-fuchsia-200: oklch(0.903 0.076 319.62);
    --color-fuchsia-300: oklch(0.833 0.145 321.434);
    --color-fuchsia-400: oklch(0.74 0.238 322.16);
    --color-fuchsia-500: oklch(0.667 0.295 322.15);
    --color-fuchsia-600: oklch(0.591 0.293 322.896);
    --color-fuchsia-700: oklch(0.518 0.253 323.949);
    --color-fuchsia-800: oklch(0.452 0.211 324.591);
    --color-fuchsia-900: oklch(0.401 0.17 325.612);
    --color-fuchsia-950: oklch(0.293 0.136 325.661);
    --color-pink-50: oklch(0.971 0.014 343.198);
    --color-pink-100: oklch(0.948 0.028 342.258);
    --color-pink-200: oklch(0.899 0.061 343.231);
    --color-pink-300: oklch(0.823 0.12 346.018);
    --color-pink-400: oklch(0.718 0.202 349.761);
    --color-pink-500: oklch(0.656 0.241 354.308);
    --color-pink-600: oklch(0.592 0.249 0.584);
    --color-pink-700: oklch(0.525 0.223 3.958);
    --color-pink-800: oklch(0.459 0.187 3.815);
    --color-pink-900: oklch(0.408 0.153 2.432);
    --color-pink-950: oklch(0.284 0.109 3.907);
    --color-rose-50: oklch(0.969 0.015 12.422);
    --color-rose-100: oklch(0.941 0.03 12.58);
    --color-rose-200: oklch(0.892 0.058 10.001);
    --color-rose-300: oklch(0.81 0.117 11.638);
    --color-rose-400: oklch(0.712 0.194 13.428);
    --color-rose-500: oklch(0.645 0.246 16.439);
    --color-rose-600: oklch(0.586 0.253 17.585);
    --color-rose-700: oklch(0.514 0.222 16.935);
    --color-rose-800: oklch(0.455 0.188 13.697);
    --color-rose-900: oklch(0.41 0.159 10.272);
    --color-rose-950: oklch(0.271 0.105 12.094);
    --color-slate-50: oklch(0.984 0.003 247.858);
    --color-slate-100: oklch(0.968 0.007 247.896);
    --color-slate-200: oklch(0.929 0.013 255.508);
    --color-slate-300: oklch(0.869 0.022 252.894);
    --color-slate-400: oklch(0.704 0.04 256.788);
    --color-slate-500: oklch(0.554 0.046 257.417);
    --color-slate-600: oklch(0.446 0.043 257.281);
    --color-slate-700: oklch(0.372 0.044 257.287);
    --color-slate-800: oklch(0.279 0.041 260.031);
    --color-slate-900: oklch(0.208 0.042 265.755);
    --color-slate-950: oklch(0.129 0.042 264.695);
    --color-gray-50: oklch(0.985 0.002 247.839);
    --color-gray-100: oklch(0.967 0.003 264.542);
    --color-gray-200: oklch(0.928 0.006 264.531);
    --color-gray-300: oklch(0.872 0.01 258.338);
    --color-gray-400: oklch(0.707 0.022 261.325);
    --color-gray-500: oklch(0.551 0.027 264.364);
    --color-gray-600: oklch(0.446 0.03 256.802);
    --color-gray-700: oklch(0.373 0.034 259.733);
    --color-gray-800: oklch(0.278 0.033 256.848);
    --color-gray-900: oklch(0.21 0.034 264.665);
    --color-gray-950: oklch(0.13 0.028 261.692);
    --color-zinc-50: oklch(0.985 0 0);
    --color-zinc-100: oklch(0.967 0.001 286.375);
    --color-zinc-200: oklch(0.92 0.004 286.32);
    --color-zinc-300: oklch(0.871 0.006 286.286);
    --color-zinc-400: oklch(0.705 0.015 286.067);
    --color-zinc-500: oklch(0.552 0.016 285.938);
    --color-zinc-600: oklch(0.442 0.017 285.786);
    --color-zinc-700: oklch(0.37 0.013 285.805);
    --color-zinc-800: oklch(0.274 0.006 286.033);
    --color-zinc-900: oklch(0.21 0.006 285.885);
    --color-zinc-950: oklch(0.141 0.005 285.823);
    --color-neutral-50: oklch(0.985 0 0);
    --color-neutral-100: oklch(0.97 0 0);
    --color-neutral-200: oklch(0.922 0 0);
    --color-neutral-300: oklch(0.87 0 0);
    --color-neutral-400: oklch(0.708 0 0);
    --color-neutral-500: oklch(0.556 0 0);
    --color-neutral-600: oklch(0.439 0 0);
    --color-neutral-700: oklch(0.371 0 0);
    --color-neutral-800: oklch(0.269 0 0);
    --color-neutral-900: oklch(0.205 0 0);
    --color-neutral-950: oklch(0.145 0 0);
    --color-stone-50: oklch(0.985 0.001 106.423);
    --color-stone-100: oklch(0.97 0.001 106.424);
    --color-stone-200: oklch(0.923 0.003 48.717);
    --color-stone-300: oklch(0.869 0.005 56.366);
    --color-stone-400: oklch(0.709 0.01 56.259);
    --color-stone-500: oklch(0.553 0.013 58.071);
    --color-stone-600: oklch(0.444 0.011 73.639);
    --color-stone-700: oklch(0.374 0.01 67.558);
    --color-stone-800: oklch(0.268 0.007 34.298);
    --color-stone-900: oklch(0.216 0.006 56.043);
    --color-stone-950: oklch(0.147 0.004 49.25);
    --color-black: #000;
    --color-white: #fff;
    --spacing: 0.25rem;
    --breakpoint-sm: 40rem;
    --breakpoint-md: 48rem;
    --breakpoint-lg: 64rem;
    --breakpoint-xl: 80rem;
    --breakpoint-2xl: 96rem;
    --container-3xs: 16rem;
    --container-2xs: 18rem;
    --container-xs: 20rem;
    --container-sm: 24rem;
    --container-md: 28rem;
    --container-lg: 32rem;
    --container-xl: 36rem;
    --container-2xl: 42rem;
    --container-3xl: 48rem;
    --container-4xl: 56rem;
    --container-5xl: 64rem;
    --container-6xl: 72rem;
    --container-7xl: 80rem;
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
    --text-3xl: 1.875rem;
    --text-3xl--line-height: calc(2.25 / 1.875);
    --text-4xl: 2.25rem;
    --text-4xl--line-height: calc(2.5 / 2.25);
    --text-5xl: 3rem;
    --text-5xl--line-height: 1;
    --text-6xl: 3.75rem;
    --text-6xl--line-height: 1;
    --text-7xl: 4.5rem;
    --text-7xl--line-height: 1;
    --text-8xl: 6rem;
    --text-8xl--line-height: 1;
    --text-9xl: 8rem;
    --text-9xl--line-height: 1;
    --font-weight-thin: 100;
    --font-weight-extralight: 200;
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;
    --font-weight-black: 900;
    --tracking-tighter: -0.05em;
    --tracking-tight: -0.025em;
    --tracking-normal: 0em;
    --tracking-wide: 0.025em;
    --tracking-wider: 0.05em;
    --tracking-widest: 0.1em;
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --leading-loose: 2;
    --radius-xs: 0.125rem;
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
    --radius-4xl: 2rem;
    --shadow-2xs: 0 1px rgb(0 0 0 / 0.05);
    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --inset-shadow-2xs: inset 0 1px rgb(0 0 0 / 0.05);
    --inset-shadow-xs: inset 0 1px 1px rgb(0 0 0 / 0.05);
    --inset-shadow-sm: inset 0 2px 4px rgb(0 0 0 / 0.05);
    --drop-shadow-xs: 0 1px 1px rgb(0 0 0 / 0.05);
    --drop-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.15);
    --drop-shadow-md: 0 3px 3px rgb(0 0 0 / 0.12);
    --drop-shadow-lg: 0 4px 4px rgb(0 0 0 / 0.15);
    --drop-shadow-xl: 0 9px 7px rgb(0 0 0 / 0.1);
    --drop-shadow-2xl: 0 25px 25px rgb(0 0 0 / 0.15);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --animate-spin: spin 1s linear infinite;
    --animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    --animate-bounce: bounce 1s infinite;
    --blur-xs: 4px;
    --blur-sm: 8px;
    --blur-md: 12px;
    --blur-lg: 16px;
    --blur-xl: 24px;
    --blur-2xl: 40px;
    --blur-3xl: 64px;
    --perspective-dramatic: 100px;
    --perspective-near: 300px;
    --perspective-normal: 500px;
    --perspective-midrange: 800px;
    --perspective-distant: 1200px;
    --aspect-video: 16 / 9;
    --default-transition-duration: 150ms;
    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    --default-font-family: var(--font-sans);
    --default-font-feature-settings: var(--font-sans--font-feature-settings);
    --default-font-variation-settings: var(
      --font-sans--font-variation-settings
    );
    --default-mono-font-family: var(--font-mono);
    --default-mono-font-feature-settings: var(
      --font-mono--font-feature-settings
    );
    --default-mono-font-variation-settings: var(
      --font-mono--font-variation-settings
    );
    --font-body: Inter, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --color-primary: var(--seq-color-primary);
    --color-secondary: var(--seq-color-secondary);
    --color-muted: var(--seq-color-muted);
    --color-inverse: var(--seq-color-inverse);
    --color-positive: var(--seq-color-positive);
    --color-negative: var(--seq-color-negative);
    --color-info: var(--seq-color-info);
    --color-warning: var(--seq-color-warning);
    --color-background-primary: var(--seq-color-background-primary);
    --color-background-secondary: var(--seq-color-background-secondary);
    --color-background-contrast: var(--seq-color-background-contrast);
    --color-background-muted: var(--seq-color-background-muted);
    --color-background-control: var(--seq-color-background-control);
    --color-background-inverse: var(--seq-color-background-inverse);
    --color-background-backdrop: var(--seq-color-background-backdrop);
    --color-background-overlay: var(--seq-color-background-overlay);
    --color-background-raised: var(--seq-color-background-raised);
    --color-border-normal: var(--seq-color-border-normal);
    --color-border-focus: var(--seq-color-border-focus);
    --color-button-glass: var(--seq-color-button-glass);
    --color-button-emphasis: var(--seq-color-button-emphasis);
    --color-button-inverse: var(--seq-color-button-inverse);
    --background-image-gradient-backdrop: var(--seq-color-gradient-backdrop);
    --background-image-gradient-primary: var(--seq-color-gradient-primary);
    --background-image-gradient-secondary: var(--seq-color-gradient-secondary);
    --background-image-gradient-skeleton: var(--seq-color-gradient-skeleton);
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
    font-family: var( --default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" );
    font-feature-settings: var(--default-font-feature-settings, normal);
    font-variation-settings: var( --default-font-variation-settings, normal );
    -webkit-tap-highlight-color: transparent;
  }
  body {
    line-height: inherit;
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
    font-family: var( --default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace );
    font-feature-settings: var( --default-mono-font-feature-settings, normal );
    font-variation-settings: var( --default-mono-font-variation-settings, normal );
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
    color: color-mix(in oklab, currentColor 50%, transparent);
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
  .pointer-events-auto {
    pointer-events: auto;
  }
  .pointer-events-none {
    pointer-events: none;
  }
  .visible {
    visibility: visible;
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
  .inset-0 {
    inset: calc(var(--spacing) * 0);
  }
  .inset-2 {
    inset: calc(var(--spacing) * 2);
  }
  .top-0 {
    top: calc(var(--spacing) * 0);
  }
  .top-4 {
    top: calc(var(--spacing) * 4);
  }
  .top-\[1px\] {
    top: 1px;
  }
  .right-0 {
    right: calc(var(--spacing) * 0);
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
  .left-\[-28px\] {
    left: -28px;
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
  .z-1000 {
    z-index: 1000;
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
  .m-4 {
    margin: calc(var(--spacing) * 4);
  }
  .mx-0 {
    margin-inline: calc(var(--spacing) * 0);
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
  .mt-0\.5 {
    margin-top: calc(var(--spacing) * 0.5);
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
  .mt-8 {
    margin-top: calc(var(--spacing) * 8);
  }
  .mt-10 {
    margin-top: calc(var(--spacing) * 10);
  }
  .mr-4 {
    margin-right: calc(var(--spacing) * 4);
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
  .ml-\[-16px\] {
    margin-left: -16px;
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
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  .h-1 {
    height: calc(var(--spacing) * 1);
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
  .h-14 {
    height: calc(var(--spacing) * 14);
  }
  .h-16 {
    height: calc(var(--spacing) * 16);
  }
  .h-24 {
    height: calc(var(--spacing) * 24);
  }
  .h-\[1px\] {
    height: 1px;
  }
  .h-\[14px\] {
    height: 14px;
  }
  .h-\[52px\] {
    height: 52px;
  }
  .h-\[60px\] {
    height: 60px;
  }
  .h-\[64px\] {
    height: 64px;
  }
  .h-\[calc\(100dvh-70px\)\] {
    height: calc(100dvh - 70px);
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
  .max-h-\[calc\(100dvh-80px\)\] {
    max-height: calc(100dvh - 80px);
  }
  .max-h-full {
    max-height: 100%;
  }
  .min-h-\[64px\] {
    min-height: 64px;
  }
  .min-h-\[100px\] {
    min-height: 100px;
  }
  .min-h-full {
    min-height: 100%;
  }
  .w-1\/2 {
    width: calc(1/2 * 100%);
  }
  .w-3 {
    width: calc(var(--spacing) * 3);
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
  .w-\[1px\] {
    width: 1px;
  }
  .w-\[14px\] {
    width: 14px;
  }
  .w-\[52px\] {
    width: 52px;
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
  .max-w-1\/2 {
    max-width: calc(1/2 * 100%);
  }
  .max-w-\[532px\] {
    max-width: 532px;
  }
  .max-w-full {
    max-width: 100%;
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
  .min-w-full {
    min-width: 100%;
  }
  .shrink-0 {
    flex-shrink: 0;
  }
  .grow {
    flex-grow: 1;
  }
  .origin-top {
    transform-origin: top;
  }
  .translate-x-0 {
    --tw-translate-x: calc(var(--spacing) * 0);
    translate: var(--tw-translate-x) var(--tw-translate-y);
  }
  .transform {
    transform: var(--tw-rotate-x) var(--tw-rotate-y) var(--tw-rotate-z) var(--tw-skew-x) var(--tw-skew-y);
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
  .list-none {
    list-style-type: none;
  }
  .appearance-none {
    appearance: none;
  }
  .grid-cols-\[1fr_2fr\] {
    grid-template-columns: 1fr 2fr;
  }
  .grid-cols-\[2fr_1fr\] {
    grid-template-columns: 2fr 1fr;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-row {
    flex-direction: row;
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
  .gap-0 {
    gap: calc(var(--spacing) * 0);
  }
  .gap-0\.5 {
    gap: calc(var(--spacing) * 0.5);
  }
  .gap-1 {
    gap: calc(var(--spacing) * 1);
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
  .self-center {
    align-self: center;
  }
  .justify-self-center {
    justify-self: center;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .overflow-x-auto {
    overflow-x: auto;
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
  .rounded-full {
    border-radius: calc(infinity * 1px);
  }
  .rounded-lg {
    border-radius: var(--radius-lg);
  }
  .rounded-md {
    border-radius: var(--radius-md);
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
  .border-t-2 {
    border-top-style: var(--tw-border-style);
    border-top-width: 2px;
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
  .border-border-focus {
    border-color: var(--color-border-focus);
  }
  .border-border-normal {
    border-color: var(--color-border-normal);
  }
  .border-transparent {
    border-color: transparent;
  }
  .border-t-primary {
    border-top-color: var(--color-primary);
  }
  .border-t-transparent {
    border-top-color: transparent;
  }
  .bg-background-backdrop {
    background-color: var(--color-background-backdrop);
  }
  .bg-background-control {
    background-color: var(--color-background-control);
  }
  .bg-background-inverse {
    background-color: var(--color-background-inverse);
  }
  .bg-background-overlay {
    background-color: var(--color-background-overlay);
  }
  .bg-background-primary {
    background-color: var(--color-background-primary);
  }
  .bg-background-raised {
    background-color: var(--color-background-raised);
  }
  .bg-background-secondary {
    background-color: var(--color-background-secondary);
  }
  .bg-border-normal {
    background-color: var(--color-border-normal);
  }
  .bg-button-emphasis {
    background-color: var(--color-button-emphasis);
  }
  .bg-button-glass {
    background-color: var(--color-button-glass);
  }
  .bg-button-inverse {
    background-color: var(--color-button-inverse);
  }
  .bg-info {
    background-color: var(--color-info);
  }
  .bg-negative {
    background-color: var(--color-negative);
  }
  .bg-positive {
    background-color: var(--color-positive);
  }
  .bg-transparent {
    background-color: transparent;
  }
  .bg-warning {
    background-color: var(--color-warning);
  }
  .bg-white {
    background-color: var(--color-white);
  }
  .bg-gradient-primary {
    background-image: var(--background-image-gradient-primary);
  }
  .bg-gradient-secondary {
    background-image: var(--background-image-gradient-secondary);
  }
  .bg-gradient-skeleton {
    background-image: var(--background-image-gradient-skeleton);
  }
  .bg-\[length\:400\%_400\%\] {
    background-size: 400% 400%;
  }
  .bg-no-repeat {
    background-repeat: no-repeat;
  }
  .fill-background-raised {
    fill: var(--color-background-raised);
  }
  .object-cover {
    object-fit: cover;
  }
  .p-0 {
    padding: calc(var(--spacing) * 0);
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
  .p-\[10px\] {
    padding: 10px;
  }
  .px-0 {
    padding-inline: calc(var(--spacing) * 0);
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
  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }
  .py-3 {
    padding-block: calc(var(--spacing) * 3);
  }
  .py-4 {
    padding-block: calc(var(--spacing) * 4);
  }
  .py-5 {
    padding-block: calc(var(--spacing) * 5);
  }
  .py-6 {
    padding-block: calc(var(--spacing) * 6);
  }
  .pt-0 {
    padding-top: calc(var(--spacing) * 0);
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
  .pb-0 {
    padding-bottom: calc(var(--spacing) * 0);
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
  .text-left {
    text-align: left;
  }
  .text-right {
    text-align: right;
  }
  .font-body {
    font-family: var(--font-body);
  }
  .font-mono {
    font-family: var(--font-mono);
  }
  .text-3xl {
    font-size: var(--text-3xl);
    line-height: var(--tw-leading, var(--text-3xl--line-height));
  }
  .text-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
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
  .leading-9 {
    --tw-leading: calc(var(--spacing) * 9);
    line-height: calc(var(--spacing) * 9);
  }
  .leading-\[inherit\] {
    --tw-leading: inherit;
    line-height: inherit;
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
  .tracking-\[0\.8px\] {
    --tw-tracking: 0.8px;
    letter-spacing: 0.8px;
  }
  .tracking-normal {
    --tw-tracking: var(--tracking-normal);
    letter-spacing: var(--tracking-normal);
  }
  .tracking-wide {
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .text-ellipsis {
    text-overflow: ellipsis;
  }
  .whitespace-nowrap {
    white-space: nowrap;
  }
  .text-background-raised {
    color: var(--color-background-raised);
  }
  .text-background-secondary {
    color: var(--color-background-secondary);
  }
  .text-black {
    color: var(--color-black);
  }
  .text-info {
    color: var(--color-info);
  }
  .text-inherit {
    color: inherit;
  }
  .text-inverse {
    color: var(--color-inverse);
  }
  .text-muted {
    color: var(--color-muted);
  }
  .text-negative {
    color: var(--color-negative);
  }
  .text-positive {
    color: var(--color-positive);
  }
  .text-primary {
    color: var(--color-primary);
  }
  .text-secondary {
    color: var(--color-secondary);
  }
  .text-warning {
    color: var(--color-warning);
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
      color: var(--color-muted);
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
  .opacity-100 {
    opacity: 100%;
  }
  .ring-1 {
    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-2 {
    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-\[0_0_10px_0_rgba\(0\,0\,0\,0\.5\)\] {
    --tw-shadow: 0 0 10px 0 var(--tw-shadow-color, rgba(0,0,0,0.5));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-border-focus {
    --tw-ring-color: var(--color-border-focus);
  }
  .ring-border-normal {
    --tw-ring-color: var(--color-border-normal);
  }
  .ring-white\/10 {
    --tw-ring-color: color-mix(in oklab, var(--color-white) 10%, transparent);
  }
  .outline-hidden {
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
  .transition {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .transition-transform {
    transition-property: transform, translate, scale, rotate;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .duration-100 {
    --tw-duration: 100ms;
    transition-duration: 100ms;
  }
  .duration-200 {
    --tw-duration: 200ms;
    transition-duration: 200ms;
  }
  .ease-out {
    --tw-ease: var(--ease-out);
    transition-timing-function: var(--ease-out);
  }
  .will-change-transform {
    will-change: transform;
  }
  .\[mask-image\:radial-gradient\(circle_at_82\%_82\%\,transparent_22\%\,black_0\)\] {
    mask-image: radial-gradient(circle at 82% 82%,transparent 22%,black 0);
  }
  .ring-inset {
    --tw-ring-inset: inset;
  }
  .select-none {
    -webkit-user-select: none;
    user-select: none;
  }
  .selection\:bg-transparent {
    & *::selection {
      background-color: transparent;
    }
    &::selection {
      background-color: transparent;
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
  .before\:bg-linear-to-l {
    &::before {
      content: var(--tw-content);
      --tw-gradient-position: to left in oklab;
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .before\:bg-linear-to-t {
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
  .before\:to-background-overlay {
    &::before {
      content: var(--tw-content);
      --tw-gradient-to: var(--color-background-overlay);
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .before\:to-background-primary {
    &::before {
      content: var(--tw-content);
      --tw-gradient-to: var(--color-background-primary);
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
  .after\:block {
    &::after {
      content: var(--tw-content);
      display: block;
    }
  }
  .after\:hidden {
    &::after {
      content: var(--tw-content);
      display: none;
    }
  }
  .after\:h-3 {
    &::after {
      content: var(--tw-content);
      height: calc(var(--spacing) * 3);
    }
  }
  .after\:h-4 {
    &::after {
      content: var(--tw-content);
      height: calc(var(--spacing) * 4);
    }
  }
  .after\:h-\[18px\] {
    &::after {
      content: var(--tw-content);
      height: 18px;
    }
  }
  .after\:h-full {
    &::after {
      content: var(--tw-content);
      height: 100%;
    }
  }
  .after\:w-3 {
    &::after {
      content: var(--tw-content);
      width: calc(var(--spacing) * 3);
    }
  }
  .after\:w-4 {
    &::after {
      content: var(--tw-content);
      width: calc(var(--spacing) * 4);
    }
  }
  .after\:w-\[18px\] {
    &::after {
      content: var(--tw-content);
      width: 18px;
    }
  }
  .after\:w-full {
    &::after {
      content: var(--tw-content);
      width: 100%;
    }
  }
  .after\:rounded-full {
    &::after {
      content: var(--tw-content);
      border-radius: calc(infinity * 1px);
    }
  }
  .after\:bg-current {
    &::after {
      content: var(--tw-content);
      background-color: currentColor;
    }
  }
  .after\:bg-linear-to-b {
    &::after {
      content: var(--tw-content);
      --tw-gradient-position: to bottom in oklab;
      background-image: linear-gradient(var(--tw-gradient-stops));
    }
  }
  .after\:bg-linear-to-r {
    &::after {
      content: var(--tw-content);
      --tw-gradient-position: to right in oklab;
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
      --tw-gradient-to: var(--color-background-primary);
      --tw-gradient-stops: var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position));
    }
  }
  .after\:content-\[\"\"\] {
    &::after {
      content: var(--tw-content);
      --tw-content: "";
      content: var(--tw-content);
    }
  }
  .focus-within\:border-transparent {
    &:focus-within {
      border-color: transparent;
    }
  }
  .focus-within\:opacity-100 {
    &:focus-within {
      opacity: 100%;
    }
  }
  .focus-within\:ring-2 {
    &:focus-within {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus-within\:ring-border-focus {
    &:focus-within {
      --tw-ring-color: var(--color-border-focus);
    }
  }
  .focus-within\:ring-inset {
    &:focus-within {
      --tw-ring-inset: inset;
    }
  }
  .hover\:bg-button-glass {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-button-glass);
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
  .hover\:opacity-100 {
    &:hover {
      @media (hover: hover) {
        opacity: 100%;
      }
    }
  }
  .hover\:ring-border-focus {
    &:hover {
      @media (hover: hover) {
        --tw-ring-color: var(--color-border-focus);
      }
    }
  }
  .focus\:opacity-100 {
    &:focus {
      opacity: 100%;
    }
  }
  .focus\:ring-0 {
    &:focus {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus\:ring-2 {
    &:focus {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus\:ring-border-focus {
    &:focus {
      --tw-ring-color: var(--color-border-focus);
    }
  }
  .focus\:outline-hidden {
    &:focus {
      outline-style: none;
      @media (forced-colors: active) {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
    }
  }
  .focus-visible\:ring-2 {
    &:focus-visible {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus-visible\:ring-border-focus {
    &:focus-visible {
      --tw-ring-color: var(--color-border-focus);
    }
  }
  .focus-visible\:outline-hidden {
    &:focus-visible {
      outline-style: none;
      @media (forced-colors: active) {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
    }
  }
  .disabled\:cursor-default {
    &:disabled {
      cursor: default;
    }
  }
  .disabled\:opacity-50 {
    &:disabled {
      opacity: 50%;
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
      color: var(--color-muted);
    }
  }
  .data-disabled\:opacity-50 {
    &[data-disabled] {
      opacity: 50%;
    }
  }
  .data-disabled\:opacity-80 {
    &[data-disabled] {
      opacity: 80%;
    }
  }
  .data-highlighted\:bg-background-contrast {
    &[data-highlighted] {
      background-color: var(--color-background-contrast);
    }
  }
  .data-highlighted\:bg-background-secondary {
    &[data-highlighted] {
      background-color: var(--color-background-secondary);
    }
  }
  .data-\[state\=active\]\:text-primary {
    &[data-state="active"] {
      color: var(--color-primary);
    }
  }
  .data-\[state\=checked\]\:translate-x-5 {
    &[data-state="checked"] {
      --tw-translate-x: calc(var(--spacing) * 5);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
  }
  .data-\[state\=checked\]\:bg-background-control {
    &[data-state="checked"] {
      background-color: var(--color-background-control);
    }
  }
  .data-\[state\=checked\]\:bg-gradient-primary {
    &[data-state="checked"] {
      background-image: var(--background-image-gradient-primary);
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
  .data-\[swipe\=move\]\:translate-x-\[var\(--radix-toast-swipe-move-x\)\] {
    &[data-swipe="move"] {
      --tw-translate-x: var(--radix-toast-swipe-move-x);
      translate: var(--tw-translate-x) var(--tw-translate-y);
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
  .lg\:h-auto\! {
    @media (width >= 64rem) {
      height: auto !important;
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
  .\[\&\:has\(\:disabled\)\:hover\]\:cursor-default {
    &:has(:disabled):hover {
      cursor: default;
    }
  }
  .\[\&\:has\(\:disabled\)\:hover\]\:opacity-50 {
    &:has(:disabled):hover {
      opacity: 50%;
    }
  }
  .focus-within\:\[\&\:has\(\:focus-visible\)\]\:ring-2 {
    &:focus-within {
      &:has(:focus-visible) {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentColor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
    }
  }
  .\[\&\>svg\]\:stroke-2 {
    &>svg {
      stroke-width: 2;
    }
  }
  .\[\&\>svg\]\:stroke-\[calc\(24\/16\*2px\)\] {
    &>svg {
      stroke-width: calc(24 / 16 * 2px);
    }
  }
  .\[\&\>svg\]\:stroke-\[calc\(24\/32\*2px\)\] {
    &>svg {
      stroke-width: calc(24 / 32 * 2px);
    }
  }
}
@layer base {
  .seq-root *, .seq-root *::before, .seq-root *::after {
    box-sizing: border-box;
  }
  :root, [data-theme=dark] {
    --seq-color-positive: #1fc266;
    --seq-color-negative: #c2501f;
    --seq-color-info: #0076cc;
    --seq-color-warning: #f4b03e;
    --seq-color-primary: rgba(255, 255, 255, 1);
    --seq-color-secondary: rgba(255, 255, 255, 0.8);
    --seq-color-muted: rgba(255, 255, 255, 0.5);
    --seq-color-inverse: rgba(0, 0, 0, 1);
    --seq-color-background-primary: rgba(0, 0, 0, 1);
    --seq-color-background-secondary: rgba(255, 255, 255, 0.1);
    --seq-color-background-contrast: rgba(255, 255, 255, 0.5);
    --seq-color-background-muted: rgba(255, 255, 255, 0.05);
    --seq-color-background-control: rgba(255, 255, 255, 0.25);
    --seq-color-background-inverse: rgba(255, 255, 255, 1);
    --seq-color-background-backdrop: rgba(34, 34, 34, 0.9);
    --seq-color-background-overlay: rgba(0, 0, 0, 0.7);
    --seq-color-background-raised: rgba(54, 54, 54, 0.7);
    --seq-color-border-normal: rgba(255, 255, 255, 0.25);
    --seq-color-border-focus: rgba(255, 255, 255, 0.5);
    --seq-color-button-glass: rgba(255, 255, 255, 0.15);
    --seq-color-button-emphasis: rgba(0, 0, 0, 0.5);
    --seq-color-button-inverse: rgba(255, 255, 255, 0.8);
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
        var(--seq-color-background-secondary),
        transparent );
  }
  [data-theme=light] {
    --seq-color-primary: rgba(0, 0, 0, 1);
    --seq-color-secondary: rgba(0, 0, 0, 0.8);
    --seq-color-muted: rgba(0, 0, 0, 0.5);
    --seq-color-inverse: rgba(255, 255, 255, 1);
    --seq-color-background-primary: rgba(244, 244, 244, 1);
    --seq-color-background-secondary: rgba(0, 0, 0, 0.1);
    --seq-color-background-contrast: rgba(244, 244, 244, 0.5);
    --seq-color-background-muted: rgba(0, 0, 0, 0.05);
    --seq-color-background-control: rgba(0, 0, 0, 0.25);
    --seq-color-background-inverse: #rgba(0, 0, 0, 1);
    --seq-color-background-backdrop: rgba(221, 221, 221, 0.9);
    --seq-color-background-overlay: rgba(244, 244, 244, 0.7);
    --seq-color-background-raised: rgba(192, 192, 192, 0.7);
    --seq-color-border-normal: rgba(0, 0, 0, 0.25);
    --seq-color-border-focus: rgba(0, 0, 0, 0.5);
    --seq-color-button-glass: rgba(0, 0, 0, 0.15);
    --seq-color-button-emphasis: rgba(255, 255, 255, 0.5);
    --seq-color-button-inverse: rgba(0, 0, 0, 0.8);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
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
  initial-value: rotateX(0);
}
@property --tw-rotate-y {
  syntax: "*";
  inherits: false;
  initial-value: rotateY(0);
}
@property --tw-rotate-z {
  syntax: "*";
  inherits: false;
  initial-value: rotateZ(0);
}
@property --tw-skew-x {
  syntax: "*";
  inherits: false;
  initial-value: skewX(0);
}
@property --tw-skew-y {
  syntax: "*";
  inherits: false;
  initial-value: skewY(0);
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
@property --tw-inset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-shadow-color {
  syntax: "*";
  inherits: false;
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
`
