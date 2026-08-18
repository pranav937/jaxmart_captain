/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jaxmart: {
          primary: '#232F72',
          navy: '#121358',
          teal: '#36ADA3',
          blue: '#2563EB',
          mediumBlue: '#2F578A',
          bg: '#F6F8FB',
          border: '#7B8C9F',
          error: '#BA1A1A',
          card: '#FFFFFF',
          muted: '#64748B',
          lightBg: '#F0F4F8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'jaxmart-sm': '0 1px 3px rgba(18, 19, 88, 0.05)',
        'jaxmart-card': '0 4px 12px rgba(18, 19, 88, 0.04), 0 1px 3px rgba(18, 19, 88, 0.02)',
        'jaxmart-lg': '0 12px 32px rgba(18, 19, 88, 0.08)',
        'jaxmart-drawer': '-8px 0 24px rgba(18, 19, 88, 0.12)',
      },
      borderRadius: {
        'jaxmart': '8px',
      }
    },
  },
  plugins: [],
}
