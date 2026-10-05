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
        guardian: {
          bg: "#060609",
          card: "#0D1117",
          surface: "#161B22",
          border: "#21262D",
          accent: "#FF6600",
          cyan: "#22D3EE",
          green: "#22C55E",
          amber: "#F59E0B",
          red: "#EF4444",
          text: "#E6EDF3",
          muted: "#7D8590",
        },
        iqoo: {
          orange: "#FF6600",
          black: "#060609",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
