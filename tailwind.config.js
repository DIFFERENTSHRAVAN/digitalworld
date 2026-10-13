/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16324F',
          dark: '#0F2338',
          light: '#2A4D70',
        },
        secondary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          hover: '#1E40AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F7FA',
          subtle: '#EBF0F5',
        },
        charcoal: {
          DEFAULT: '#1F2937',
          muted: '#4B5563',
          light: '#9CA3AF',
        },
        success: {
          DEFAULT: '#16A34A',
          dark: '#15803D',
          light: '#DCFCE7',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          hover: '#20BA5A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(22, 50, 79, 0.08), 0 1px 4px -1px rgba(22, 50, 79, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(22, 50, 79, 0.12), 0 4px 8px -2px rgba(22, 50, 79, 0.06)',
      }
    },
  },
  plugins: [],
}
