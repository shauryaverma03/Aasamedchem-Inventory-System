/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F3FAF8",
        primary: {
          DEFAULT: "#0F4C4C",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6C63FF",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#14B8A6",
          foreground: "#ffffff",
        },
        success: "#10B981",
        danger: "#EF4444",
        border: "#E2EBE9",
        card: "#ffffff",
        muted: "#F0F5F4",
        "muted-foreground": "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
}

