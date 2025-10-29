/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#EFFAFD",      // Pale Blue
        "primary": "#4A8BDF",          // Royal Blue
        "secondary": "#A0006D",        // Eggplant
        "text-primary": "#333333",     // Darker Charcoal Gray
        "text-secondary": "#555555",
        "accent": "#FFC107"
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'large': '0 12px 24px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
