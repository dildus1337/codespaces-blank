/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        doom: {
          dark: '#121214',
          panel: '#1a1a1e',
          border: '#2a2a30',
          accent: '#dc2626',
          yellow: '#eab308',
          green: '#22c55e',
          blue: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
