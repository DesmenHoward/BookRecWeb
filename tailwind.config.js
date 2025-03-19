/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7D6E83',
        accent: '#A75D5D',
        background: '#F9F5EB',
        surface: '#EFE3D0',
        text: '#4F4557',
        'text-light': '#7D6E83',
        border: '#D0B8A8'
      }
    },
  },
  plugins: [],
}