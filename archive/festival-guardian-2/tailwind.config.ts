import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090b",
        surface: "#121216",
        "surface-2": "#1a1a20",
        "surface-3": "#22222a",
        fg: "#ececef",
        muted: "#8b8b96",
        subtle: "#6a6a74",
        border: "#2a2a32",
        accent: "#c5ccd6",
        "accent-fg": "#0c0c10",
        safe: "#3d9a72",
        surge: "#c4a35a",
        crit: "#d45b4a",
        // Backward-compatible Guardian tokens mapped to dark minimalist palette
        guardian: {
          bg: "#09090b",
          card: "#121216",
          surface: "#161B22",
          border: "#2a2a32",
          accent: "#FF6600",
          cyan: "#22D3EE",
          green: "#3d9a72",
          amber: "#c4a35a",
          red: "#d45b4a",
          text: "#ececef",
          muted: "#8b8b96",
          subtle: "#6a6a74",
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
export default config;
