/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f1a',
          secondary: '#1a1a2e',
          card: '#16213e',
          panel: '#1f1f3a',
        },
        accent: {
          blue: '#4f8ef7',
          green: '#3ecf8e',
          yellow: '#f5a623',
          red: '#e85d75',
          purple: '#9b59b6',
        }
      }
    },
  },
  plugins: [],
}
