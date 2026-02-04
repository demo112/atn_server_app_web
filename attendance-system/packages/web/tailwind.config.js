/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        background: {
          light: '#F3F4F6',
          dark: '#111827',
        },
        card: {
          light: '#ffffff',
          dark: '#1f2937',
        },
        border: {
          light: '#e5e7eb',
          dark: '#374151',
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      }
    },
  },
  plugins: [],
}
