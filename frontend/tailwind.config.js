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
        "3xl": "1.5rem",
      },
      boxShadow: {
        "glow-secondary": "0 0 20px rgba(108,99,255,0.25)",
        "glow-accent": "0 0 20px rgba(20,184,166,0.25)",
        "glow-primary": "0 0 20px rgba(15,76,76,0.2)",
        "card": "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 16px 48px -8px rgba(108,99,255,0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern": "radial-gradient(ellipse at top, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(20,184,166,0.08) 0%, transparent 60%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
}
