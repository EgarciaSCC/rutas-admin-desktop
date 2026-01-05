import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        nexus: {
          red: {
            50: "hsl(var(--nexus-red-50))",
            100: "hsl(var(--nexus-red-100))",
            200: "hsl(var(--nexus-red-200))",
            300: "hsl(var(--nexus-red-300))",
            400: "hsl(var(--nexus-red-400))",
            500: "hsl(var(--nexus-red-500))",
            600: "hsl(var(--nexus-red-600))",
            700: "hsl(var(--nexus-red-700))",
            800: "hsl(var(--nexus-red-800))",
            900: "hsl(var(--nexus-red-900))",
          },
          purple: {
            50: "hsl(var(--nexus-purple-50))",
            100: "hsl(var(--nexus-purple-100))",
            200: "hsl(var(--nexus-purple-200))",
            300: "hsl(var(--nexus-purple-300))",
            400: "hsl(var(--nexus-purple-400))",
            500: "hsl(var(--nexus-purple-500))",
            600: "hsl(var(--nexus-purple-600))",
            700: "hsl(var(--nexus-purple-700))",
            800: "hsl(var(--nexus-purple-800))",
            900: "hsl(var(--nexus-purple-900))",
          },
          yellow: {
            50: "hsl(var(--nexus-yellow-50))",
            100: "hsl(var(--nexus-yellow-100))",
            200: "hsl(var(--nexus-yellow-200))",
            300: "hsl(var(--nexus-yellow-300))",
            400: "hsl(var(--nexus-yellow-400))",
            500: "hsl(var(--nexus-yellow-500))",
          },
          gray: {
            50: "hsl(var(--nexus-gray-50))",
            100: "hsl(var(--nexus-gray-100))",
            200: "hsl(var(--nexus-gray-200))",
            300: "hsl(var(--nexus-gray-300))",
            400: "hsl(var(--nexus-gray-400))",
            500: "hsl(var(--nexus-gray-500))",
            600: "hsl(var(--nexus-gray-600))",
            700: "hsl(var(--nexus-gray-700))",
            800: "hsl(var(--nexus-gray-800))",
            900: "hsl(var(--nexus-gray-900))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
