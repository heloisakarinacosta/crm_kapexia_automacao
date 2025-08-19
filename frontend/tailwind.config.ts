import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Include pages if they exist
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Main location for App Router
  ],
  theme: {
    extend: {
      colors: {
        // Keep existing custom colors
        gray: {
          950: "#0a0a0a",
          900: "#121212",
          800: "#1f1f1f",
          700: "#2e2e2e",
          600: "#484848",
          500: "#666666",
          400: "#8a8a8a",
          300: "#b0b0b0",
          200: "#d6d6d6",
          100: "#e8e8e8",
        },
        blue: {
          600: "#2563eb",
          500: "#3b82f6",
          400: "#60a5fa",
        }
      },
      // Add other extensions if needed, e.g., backgroundImage
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [], // Add plugins if needed later
};

export default config;

