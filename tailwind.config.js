/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: '#ffffff',
          text: '#000000',
          hint: '#999999',
          link: '#ff6600',
          button: '#ff6600',
          'button-text': '#ffffff',
          'secondary-bg': '#f5f5f5',
        },
        primary: {
          DEFAULT: '#ff6600', // Fruit Orange
          dark: '#e65c00',    // Slightly Darker
          light: '#ff8533',   // Lighter Orange
          50: '#fff0e6',
          100: '#ffe0cc',
        },
        danger: {
          DEFAULT: '#e02f2f', // Urgent Red
          dark: '#c02323',
        },
        success: {
          DEFAULT: '#00a65a', // Trust Green
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'float': '0 4px 12px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'card': '8px',
      }
    },
  },
  plugins: [],
}

