/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <- 꼭 이 줄 있어야 함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
