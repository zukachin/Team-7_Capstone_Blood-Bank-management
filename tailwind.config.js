/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/**/*.{js,jsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        lifelink: {
          gray: "#f3f4f6", // soft gray background
        },
        blood: {
          dark: "#7f1d1d", // deep red text
          primary: "#dc2626", // lighter red
          secondary: "#b91c1c",
          accent: "#c21717",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // 🔴 Blood drop & pulse animations
      keyframes: {
        // old pulse effect (renamed)
        bloodpulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        // new dripping effect
        blooddrop: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "70%": { transform: "translateY(80px)", opacity: "1" },
          "100%": { transform: "translateY(120px)", opacity: "0" },
        },
      },
      animation: {
        bloodpulse: "bloodpulse 5s ease-in-out infinite",
        blooddrop: "blooddrop 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
