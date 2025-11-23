import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#2196F3",
          600: "#1E88E5",
          700: "#1976D2",
          800: "#1565C0",
          900: "#0D47A1",
        },
        dark: {
          bg: {
            primary: '#0f1419',
            secondary: '#1a1f26',
            tertiary: '#252b33',
          },
          text: {
            primary: '#e1e8ed',
            secondary: '#8899a6',
            muted: '#5b6f7a',
          },
          border: {
            light: '#2f3942',
            DEFAULT: '#3e4a54',
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        surface: "0 8px 32px rgba(33, 150, 243, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 300ms ease-out forwards',
        'fade-in-up-delay-1': 'fadeInUp 300ms ease-out 100ms forwards',
        'fade-in-up-delay-2': 'fadeInUp 300ms ease-out 200ms forwards',
        'fade-in-up-delay-3': 'fadeInUp 300ms ease-out 300ms forwards',
      },
    },
  },
  plugins: [],
};

export default config;
